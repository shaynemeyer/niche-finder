import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    paymentRequest: { findFirst: (...args: unknown[]) => findFirst(...args) },
  },
}));

import { hasPendingPayment } from './payments';

beforeEach(() => {
  vi.clearAllMocks();
  findFirst.mockResolvedValue(null);
});

describe('hasPendingPayment', () => {
  it('scopes to the user and to PENDING only', async () => {
    await hasPendingPayment('user-1');

    // An approved request already upgraded the account, and a rejected one
    // needs a different message than "awaiting approval".
    expect(findFirst.mock.calls[0][0].where).toEqual({
      userId: 'user-1',
      status: 'PENDING',
    });
  });

  it('is true when a pending request exists', async () => {
    findFirst.mockResolvedValue({ id: 'payment-1' });

    await expect(hasPendingPayment('user-1')).resolves.toBe(true);
  });

  it('is false when none exists', async () => {
    await expect(hasPendingPayment('user-1')).resolves.toBe(false);
  });
});
