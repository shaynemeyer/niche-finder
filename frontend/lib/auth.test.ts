import { beforeEach, describe, expect, it, vi } from 'vitest';
import bcrypt from 'bcryptjs';

const findUnique = vi.fn();

vi.mock('./prisma', () => ({
  prisma: { user: { findUnique: (...args: unknown[]) => findUnique(...args) } },
}));

// NextAuth() runs at module scope; stub it so importing this module in a
// unit test does not boot the full auth config.
vi.mock('next-auth', () => ({
  default: () => ({ handlers: {}, auth: vi.fn(), signIn: vi.fn(), signOut: vi.fn() }),
}));
vi.mock('next-auth/providers/credentials', () => ({ default: (config: unknown) => config }));
vi.mock('@auth/prisma-adapter', () => ({ PrismaAdapter: () => ({}) }));

import { verifyCredentials } from './auth';

const password = 'correct-password';

beforeEach(() => {
  findUnique.mockReset();
});

describe('verifyCredentials', () => {
  it('returns the user for a correct password', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      image: null,
      role: 'USER',
      password: await bcrypt.hash(password, 10),
    });

    const result = await verifyCredentials('user@example.com', password);

    expect(result).toMatchObject({ id: 'user-1', email: 'user@example.com', role: 'USER' });
  });

  it('never returns the password hash', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'user@example.com',
      name: 'Test User',
      image: null,
      role: 'USER',
      password: await bcrypt.hash(password, 10),
    });

    const result = await verifyCredentials('user@example.com', password);

    expect(result).not.toHaveProperty('password');
  });

  it('returns null identically for all three failure modes', async () => {
    // The account-enumeration guarantee: an attacker must not be able to
    // tell a registered email from an unregistered one by the response.
    findUnique.mockResolvedValue(null);
    const unknownEmail = await verifyCredentials('nobody@example.com', password);

    findUnique.mockResolvedValue({ id: 'user-2', email: 'oauth@example.com', password: null });
    const passwordlessAccount = await verifyCredentials('oauth@example.com', password);

    findUnique.mockResolvedValue({
      id: 'user-3',
      email: 'user@example.com',
      name: 'Test User',
      image: null,
      role: 'USER',
      password: await bcrypt.hash(password, 10),
    });
    const wrongPassword = await verifyCredentials('user@example.com', 'wrong-password');

    expect(unknownEmail).toBeNull();
    expect(passwordlessAccount).toBeNull();
    expect(wrongPassword).toBeNull();
  });
});
