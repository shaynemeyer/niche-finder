import { beforeEach, describe, expect, it, vi } from 'vitest';

const findFirst = vi.fn();
const findMany = vi.fn();
const findUnique = vi.fn();
const create = vi.fn();
const update = vi.fn();
const subscriptionUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    paymentRequest: {
      findFirst: (...args: unknown[]) => findFirst(...args),
      findMany: (...args: unknown[]) => findMany(...args),
      findUnique: (...args: unknown[]) => findUnique(...args),
      create: (...args: unknown[]) => create(...args),
      update: (...args: unknown[]) => update(...args),
    },
    subscription: {
      update: (...args: unknown[]) => subscriptionUpdate(...args),
    },
    $transaction: (fn: (tx: unknown) => unknown) =>
      fn({
        paymentRequest: { update: (...args: unknown[]) => update(...args) },
        subscription: {
          update: (...args: unknown[]) => subscriptionUpdate(...args),
        },
      }),
  },
}));

import {
  approvePaymentRequest,
  createPaymentRequest,
  getPaymentRequestInvoicePath,
  getPendingPaymentRequest,
  hasPendingPayment,
  listAllPaymentRequests,
  listPaymentRequests,
  rejectPaymentRequest,
} from './payments';

beforeEach(() => {
  vi.clearAllMocks();
  findFirst.mockResolvedValue(null);
  findMany.mockResolvedValue([]);
  findUnique.mockResolvedValue(null);
  create.mockResolvedValue({
    id: 'payment-1',
    status: 'PENDING',
    createdAt: new Date('2026-01-01'),
  });
  update.mockResolvedValue({
    id: 'payment-1',
    status: 'APPROVED',
    approvedAt: new Date('2026-01-02'),
    userId: 'user-1',
  });
  subscriptionUpdate.mockResolvedValue({});
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

describe('getPendingPaymentRequest', () => {
  it('scopes to the user and to PENDING only', async () => {
    await getPendingPaymentRequest('user-1');

    expect(findFirst.mock.calls[0][0].where).toEqual({
      userId: 'user-1',
      status: 'PENDING',
    });
  });

  it('does not select invoicePath', async () => {
    await getPendingPaymentRequest('user-1');

    expect(findFirst.mock.calls[0][0].select).not.toHaveProperty(
      'invoicePath',
    );
  });

  it('returns null when none exists', async () => {
    await expect(getPendingPaymentRequest('user-1')).resolves.toBeNull();
  });

  it('returns the pending request when one exists', async () => {
    const pending = { id: 'payment-1', createdAt: new Date('2026-01-01') };
    findFirst.mockResolvedValue(pending);

    await expect(getPendingPaymentRequest('user-1')).resolves.toBe(pending);
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

describe('listAllPaymentRequests', () => {
  it('orders most recent first with no user scoping', async () => {
    await listAllPaymentRequests();

    expect(findMany.mock.calls[0][0]).toMatchObject({
      orderBy: { createdAt: 'desc' },
    });
    expect(findMany.mock.calls[0][0].where).toBeUndefined();
  });

  it('selects invoicePath and the submitter name and email', async () => {
    await listAllPaymentRequests();

    const { select } = findMany.mock.calls[0][0];
    expect(select).toHaveProperty('invoicePath', true);
    expect(select.user).toEqual({
      select: { id: true, name: true, email: true },
    });
  });

  it('returns the requests as given', async () => {
    const requests = [{ id: 'payment-1', transactionId: 'tx-1' }];
    findMany.mockResolvedValue(requests);

    await expect(listAllPaymentRequests()).resolves.toBe(requests);
  });
});

describe('getPaymentRequestInvoicePath', () => {
  it('looks up by id and selects only invoicePath', async () => {
    await getPaymentRequestInvoicePath('payment-1');

    expect(findUnique.mock.calls[0][0]).toEqual({
      where: { id: 'payment-1' },
      select: { invoicePath: true },
    });
  });

  it('returns null when no request has that id', async () => {
    await expect(
      getPaymentRequestInvoicePath('missing'),
    ).resolves.toBeNull();
  });

  it('returns the invoice path when found', async () => {
    const found = { invoicePath: 'invoices/file.pdf' };
    findUnique.mockResolvedValue(found);

    await expect(getPaymentRequestInvoicePath('payment-1')).resolves.toBe(
      found,
    );
  });
});

describe('createPaymentRequest', () => {
  it('creates a PENDING request scoped to the user', async () => {
    await createPaymentRequest({
      userId: 'user-1',
      transactionId: 'tx-123',
      invoicePath: 'invoices/file.pdf',
      payment: 29,
    });

    expect(create.mock.calls[0][0]).toMatchObject({
      data: {
        userId: 'user-1',
        transactionId: 'tx-123',
        invoicePath: 'invoices/file.pdf',
        payment: 29,
      },
    });
  });

  it('does not select invoicePath back out', async () => {
    await createPaymentRequest({
      userId: 'user-1',
      transactionId: 'tx-123',
      invoicePath: 'invoices/file.pdf',
      payment: 29,
    });

    expect(create.mock.calls[0][0].select).not.toHaveProperty('invoicePath');
  });

  it('returns the created request', async () => {
    const created = { id: 'payment-1', status: 'PENDING', createdAt: new Date() };
    create.mockResolvedValue(created);

    await expect(
      createPaymentRequest({
        userId: 'user-1',
        transactionId: 'tx-123',
        invoicePath: 'invoices/file.pdf',
        payment: 29,
      }),
    ).resolves.toBe(created);
  });
});

describe('approvePaymentRequest', () => {
  it('updates only a PENDING request to APPROVED', async () => {
    await approvePaymentRequest('payment-1');

    expect(update.mock.calls[0][0]).toMatchObject({
      where: { id: 'payment-1', status: 'PENDING' },
      data: { status: 'APPROVED' },
    });
  });

  it('upgrades the submitter subscription to PRO for one year', async () => {
    await approvePaymentRequest('payment-1');

    const { where, data } = subscriptionUpdate.mock.calls[0][0];
    expect(where).toEqual({ userId: 'user-1' });
    expect(data.planType).toBe('PRO');
    expect(data.isActive).toBe(true);
    expect(data.endDate.getTime() - data.startDate.getTime()).toBeCloseTo(
      365 * 24 * 60 * 60 * 1000,
      -5,
    );
  });

  it('returns the approved request', async () => {
    const approved = {
      id: 'payment-1',
      status: 'APPROVED',
      approvedAt: new Date('2026-01-02'),
      userId: 'user-1',
    };
    update.mockResolvedValue(approved);

    await expect(approvePaymentRequest('payment-1')).resolves.toBe(approved);
  });

  it('propagates a P2025 when the request is not PENDING', async () => {
    const notFound = new Error('No record found');
    update.mockRejectedValue(notFound);

    await expect(approvePaymentRequest('payment-1')).rejects.toBe(notFound);
    expect(subscriptionUpdate).not.toHaveBeenCalled();
  });
});

describe('rejectPaymentRequest', () => {
  it('updates only a PENDING request to REJECTED with the reason', async () => {
    await rejectPaymentRequest({ id: 'payment-1', reason: 'Invalid transaction ID' });

    expect(update.mock.calls[0][0]).toMatchObject({
      where: { id: 'payment-1', status: 'PENDING' },
      data: { status: 'REJECTED', rejectedReason: 'Invalid transaction ID' },
    });
  });

  it('returns the rejected request', async () => {
    const rejected = {
      id: 'payment-1',
      status: 'REJECTED',
      rejectedReason: 'Invalid transaction ID',
    };
    update.mockResolvedValue(rejected);

    await expect(
      rejectPaymentRequest({ id: 'payment-1', reason: 'Invalid transaction ID' }),
    ).resolves.toBe(rejected);
  });

  it('propagates a P2025 when the request is not PENDING', async () => {
    const notFound = new Error('No record found');
    update.mockRejectedValue(notFound);

    await expect(
      rejectPaymentRequest({ id: 'payment-1', reason: 'Invalid transaction ID' }),
    ).rejects.toBe(notFound);
  });
});
