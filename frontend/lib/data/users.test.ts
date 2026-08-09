import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();
const update = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
  },
}));

import { createUser, updateUserName } from './users';

beforeEach(() => {
  vi.clearAllMocks();
  create.mockResolvedValue({ id: 'user-1' });
  update.mockResolvedValue({ id: 'user-1', name: 'Grace Hopper' });
});

describe('createUser', () => {
  it('provisions a FREE subscription and a usage row in the same write', async () => {
    await createUser('Test User', 'new@example.com', 'hashed');

    // One nested write, not three calls: a failure partway through would
    // otherwise leave an account with no plan.
    const { data } = create.mock.calls[0][0];
    expect(data.subscription.create).toMatchObject({
      planType: 'FREE',
      isActive: true,
    });
    expect(data.usage.create.validationCount).toBe(0);
  });

  it('stores the hash it is given, not a cleartext password', async () => {
    await createUser('Test User', 'new@example.com', 'hashed-by-the-caller');

    expect(create.mock.calls[0][0].data.password).toBe('hashed-by-the-caller');
  });

  it('never selects the password hash back out', async () => {
    await createUser('Test User', 'new@example.com', 'hashed');

    expect(create.mock.calls[0][0].omit).toEqual({ password: true });
  });

  it('dates the usage row to the current calendar month', async () => {
    await createUser(
      'Test User',
      'new@example.com',
      'hashed',
      new Date('2026-03-15T00:00:00Z'),
    );

    expect(create.mock.calls[0][0].data.usage.create).toMatchObject({
      month: 3,
      year: 2026,
    });
  });

  it('assigns the USER role rather than trusting a caller', async () => {
    await createUser('Test User', 'new@example.com', 'hashed');

    // Registration must never be able to mint an admin.
    expect(create.mock.calls[0][0].data.role).toBe('USER');
  });
});

describe('updateUserName', () => {
  it('scopes the update to the given user and sets only the name', async () => {
    await updateUserName('user-1', 'Grace Hopper');

    expect(update.mock.calls[0][0]).toMatchObject({
      where: { id: 'user-1' },
      data: { name: 'Grace Hopper' },
    });
  });

  it('never selects the password hash back out', async () => {
    await updateUserName('user-1', 'Grace Hopper');

    expect(update.mock.calls[0][0].select).not.toHaveProperty('password');
  });
});
