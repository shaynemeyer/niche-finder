import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const hasPendingPayment = vi.fn();
const createPaymentRequest = vi.fn();
const mkdir = vi.fn();
const writeFile = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/payments', () => ({
  hasPendingPayment: (...args: unknown[]) => hasPendingPayment(...args),
  createPaymentRequest: (...args: unknown[]) => createPaymentRequest(...args),
}));

vi.mock('fs/promises', () => ({
  mkdir: (...args: unknown[]) => mkdir(...args),
  writeFile: (...args: unknown[]) => writeFile(...args),
}));

import { POST } from './route';

function makeInvoice(overrides: Partial<{ type: string; size: number }> = {}) {
  const type = overrides.type ?? 'application/pdf';
  const size = overrides.size ?? 1024;
  return new File([new Uint8Array(size)], 'invoice.pdf', { type });
}

function postRequest({
  transactionId,
  invoice,
}: {
  transactionId?: string;
  invoice?: File | null;
} = {}) {
  const formData = new FormData();
  if (invoice !== null) {
    formData.append('invoice', invoice ?? makeInvoice());
  }
  if (transactionId !== undefined) {
    formData.append('transactionId', transactionId);
  }

  return new Request('http://localhost/api/subscription/bank-transfer', {
    method: 'POST',
    body: formData,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  hasPendingPayment.mockResolvedValue(false);
  createPaymentRequest.mockResolvedValue({
    id: 'payment-1',
    status: 'PENDING',
    createdAt: new Date('2026-01-01'),
  });
  mkdir.mockResolvedValue(undefined);
  writeFile.mockResolvedValue(undefined);
});

describe('POST /api/subscription/bank-transfer', () => {
  it('saves the invoice and creates a payment request, returning 201', async () => {
    const response = await POST(
      postRequest({ transactionId: 'transaction-12345' }),
    );
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(createPaymentRequest).toHaveBeenCalledWith(
      'user-1',
      'transaction-12345',
      expect.stringContaining('invoices'),
    );
    expect(body.paymentRequest.id).toBe('payment-1');
  });

  it('rejects an unauthenticated request without touching the filesystem', async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(
      postRequest({ transactionId: 'transaction-12345' }),
    );

    expect(response.status).toBe(401);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('returns 400 when no invoice file is present', async () => {
    const response = await POST(
      postRequest({ transactionId: 'transaction-12345', invoice: null }),
    );

    expect(response.status).toBe(400);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('returns 400 for a disallowed file type', async () => {
    const response = await POST(
      postRequest({
        transactionId: 'transaction-12345',
        invoice: makeInvoice({ type: 'text/plain' }),
      }),
    );

    expect(response.status).toBe(400);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('returns 400 for a file over 5MB', async () => {
    const response = await POST(
      postRequest({
        transactionId: 'transaction-12345',
        invoice: makeInvoice({ size: 5 * 1024 * 1024 + 1 }),
      }),
    );

    expect(response.status).toBe(400);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('returns 400 when the transaction ID is too short', async () => {
    const response = await POST(postRequest({ transactionId: 'ab' }));

    expect(response.status).toBe(400);
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('returns 409 when a payment request is already pending', async () => {
    hasPendingPayment.mockResolvedValue(true);

    const response = await POST(
      postRequest({ transactionId: 'transaction-12345' }),
    );

    expect(response.status).toBe(409);
    expect(writeFile).not.toHaveBeenCalled();
    expect(createPaymentRequest).not.toHaveBeenCalled();
  });

  it('returns a generic 500 without leaking internal detail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    writeFile.mockRejectedValue(new Error('ENOSPC at /var/data/uploads'));

    const response = await POST(
      postRequest({ transactionId: 'transaction-12345' }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('/var/data/uploads');
  });
});
