import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const approvePaymentRequest = vi.fn();
const rejectPaymentRequest = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/payments', () => ({
  approvePaymentRequest: (...args: unknown[]) =>
    approvePaymentRequest(...args),
  rejectPaymentRequest: (...args: unknown[]) => rejectPaymentRequest(...args),
}));

import { Prisma } from '@/lib/generated/prisma/client';
import { PATCH } from './route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(body: unknown) {
  return new Request('http://test', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
  approvePaymentRequest.mockResolvedValue({
    id: 'payment-1',
    status: 'APPROVED',
    approvedAt: new Date('2026-01-02'),
  });
  rejectPaymentRequest.mockResolvedValue({
    id: 'payment-1',
    status: 'REJECTED',
    rejectedReason: 'Invalid transaction ID',
  });
});

describe('PATCH /api/admin/payment-requests/[id]', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);

    const response = await PATCH(
      patchRequest({ action: 'approve' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(401);
    expect(approvePaymentRequest).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-admin user', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });

    const response = await PATCH(
      patchRequest({ action: 'approve' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(403);
    expect(approvePaymentRequest).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid action', async () => {
    const response = await PATCH(
      patchRequest({ action: 'delete' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(400);
    expect(approvePaymentRequest).not.toHaveBeenCalled();
  });

  it('returns 400 for a reject action with no reason', async () => {
    const response = await PATCH(
      patchRequest({ action: 'reject' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(400);
    expect(rejectPaymentRequest).not.toHaveBeenCalled();
  });

  it('returns 400 for a reject action with a blank reason', async () => {
    const response = await PATCH(
      patchRequest({ action: 'reject', reason: '   ' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(400);
    expect(rejectPaymentRequest).not.toHaveBeenCalled();
  });

  it('approves the request and returns a success message', async () => {
    const response = await PATCH(
      patchRequest({ action: 'approve' }),
      makeParams('payment-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(approvePaymentRequest).toHaveBeenCalledWith('payment-1');
    expect(body.message).toMatch(/approved/i);
  });

  it('returns 404 when the request is not PENDING or does not exist', async () => {
    approvePaymentRequest.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('No record found', {
        code: 'P2025',
        clientVersion: '7.9.1',
      }),
    );

    const response = await PATCH(
      patchRequest({ action: 'approve' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(404);
  });

  it('returns a generic 500 and does not leak the internal error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    approvePaymentRequest.mockRejectedValue(new Error('connection refused'));

    const response = await PATCH(
      patchRequest({ action: 'approve' }),
      makeParams('payment-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).not.toContain('connection refused');
    consoleError.mockRestore();
  });

  it('rejects the request with a reason and returns a success message', async () => {
    const response = await PATCH(
      patchRequest({ action: 'reject', reason: 'Invalid transaction ID' }),
      makeParams('payment-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(rejectPaymentRequest).toHaveBeenCalledWith({
      id: 'payment-1',
      reason: 'Invalid transaction ID',
    });
    expect(body.message).toMatch(/rejected/i);
  });

  it('returns 404 when the request is not PENDING or does not exist', async () => {
    rejectPaymentRequest.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('No record found', {
        code: 'P2025',
        clientVersion: '7.9.1',
      }),
    );

    const response = await PATCH(
      patchRequest({ action: 'reject', reason: 'Invalid transaction ID' }),
      makeParams('payment-1'),
    );

    expect(response.status).toBe(404);
  });

  it('returns a generic 500 and does not leak the internal error', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    rejectPaymentRequest.mockRejectedValue(new Error('connection refused'));

    const response = await PATCH(
      patchRequest({ action: 'reject', reason: 'Invalid transaction ID' }),
      makeParams('payment-1'),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).not.toContain('connection refused');
    consoleError.mockRestore();
  });
});
