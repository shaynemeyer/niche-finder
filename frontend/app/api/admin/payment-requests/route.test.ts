import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const listAllPaymentRequests = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/payments', () => ({
  listAllPaymentRequests: (...args: unknown[]) =>
    listAllPaymentRequests(...args),
}));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
  listAllPaymentRequests.mockResolvedValue([]);
});

describe('GET /api/admin/payment-requests', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(listAllPaymentRequests).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-admin user', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(listAllPaymentRequests).not.toHaveBeenCalled();
  });

  it('returns 200 with the payment requests for an admin', async () => {
    const paymentRequests = [{ id: 'payment-1', transactionId: 'tx-1' }];
    listAllPaymentRequests.mockResolvedValue(paymentRequests);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ paymentRequests });
  });

  it('returns a generic 500 and does not leak the internal error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    listAllPaymentRequests.mockRejectedValue(new Error('connection refused'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).not.toContain('connection refused');
    consoleError.mockRestore();
  });
});
