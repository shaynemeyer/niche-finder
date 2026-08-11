import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();
const findMany = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    paymentRequest: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      findMany: (...args: unknown[]) => findMany(...args),
    },
  },
}));

import { hasPendingPayment, listPaymentRequests } from './payments';

beforeEach(() => {
  vi.clearAllMocks();
  findFirst.mockResolvedValue(null);
  findMany.mockResolvedValue([]);
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

describe('listPaymentRequests', () => {
  it('scopes to the user and orders most recent first', async () => {
    await listPaymentRequests('user-1');

    expect(findMany.mock.calls[0][0]).toMatchObject({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('does not select invoicePath', async () => {
    await listPaymentRequests('user-1');

    expect(findMany.mock.calls[0][0].select).not.toHaveProperty('invoicePath');
  });

  it('returns the requests as given', async () => {
    const requests = [{ id: 'payment-1', transactionId: 'tx-1' }];
    findMany.mockResolvedValue(requests);

    await expect(listPaymentRequests('user-1')).resolves.toBe(requests);
  });
});
