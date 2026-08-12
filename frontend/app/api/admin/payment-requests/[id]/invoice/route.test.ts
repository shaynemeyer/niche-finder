import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getPaymentRequestInvoicePath = vi.fn();
const readFile = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/payments', () => ({
  getPaymentRequestInvoicePath: (...args: unknown[]) =>
    getPaymentRequestInvoicePath(...args),
}));

vi.mock('fs/promises', () => ({
  readFile: (...args: unknown[]) => readFile(...args),
}));

import { GET } from './route';

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'admin-1', role: 'ADMIN' } });
  getPaymentRequestInvoicePath.mockResolvedValue({
    invoicePath: 'invoices/file.pdf',
  });
  readFile.mockResolvedValue(Buffer.from('pdf-bytes'));
});

describe('GET /api/admin/payment-requests/[id]/invoice', () => {
  it('returns 401 when unauthenticated', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(new Request('http://test'), makeParams('payment-1'));

    expect(response.status).toBe(401);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('returns 403 for a non-admin user', async () => {
    authMock.mockResolvedValue({ user: { id: 'user-1', role: 'USER' } });

    const response = await GET(new Request('http://test'), makeParams('payment-1'));

    expect(response.status).toBe(403);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('returns 404 when no payment request has that id', async () => {
    getPaymentRequestInvoicePath.mockResolvedValue(null);

    const response = await GET(new Request('http://test'), makeParams('missing'));

    expect(response.status).toBe(404);
    expect(readFile).not.toHaveBeenCalled();
  });

  it('streams the file with the correct content type', async () => {
    getPaymentRequestInvoicePath.mockResolvedValue({
      invoicePath: 'invoices/file.png',
    });

    const response = await GET(new Request('http://test'), makeParams('payment-1'));

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('image/png');
  });

  it('defaults to application/pdf for an unrecognized extension', async () => {
    getPaymentRequestInvoicePath.mockResolvedValue({
      invoicePath: 'invoices/file.pdf',
    });

    const response = await GET(new Request('http://test'), makeParams('payment-1'));

    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('returns a generic 500 when the file cannot be read', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    readFile.mockRejectedValue(new Error('ENOENT'));

    const response = await GET(new Request('http://test'), makeParams('payment-1'));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).not.toContain('ENOENT');
    consoleError.mockRestore();
  });
});
