import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getSubscription = vi.fn();
const cancelSubscription = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/users', () => ({
  getSubscription: (...args: unknown[]) => getSubscription(...args),
  cancelSubscription: (...args: unknown[]) => cancelSubscription(...args),
}));

import { POST } from './route';

const freeSubscription = {
  planType: 'FREE',
  isActive: true,
  startDate: new Date('2026-01-01T00:00:00.000Z'),
};

const proSubscription = {
  planType: 'PRO',
  isActive: true,
  startDate: new Date('2026-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  getSubscription.mockResolvedValue(proSubscription);
  cancelSubscription.mockResolvedValue(freeSubscription);
});

describe('POST /api/subscription/cancel', () => {
  it('downgrades a PRO subscription to FREE', async () => {
    const response = await POST();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: 'Successfully downgraded to Free Plan',
      subscription: {
        ...freeSubscription,
        startDate: freeSubscription.startDate.toISOString(),
      },
    });
    expect(cancelSubscription).toHaveBeenCalledWith('user-1');
  });

  it('rejects an unauthenticated request without querying', async () => {
    authMock.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(getSubscription).not.toHaveBeenCalled();
  });

  it('returns 404 when the caller has no subscription', async () => {
    getSubscription.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(404);
    expect(cancelSubscription).not.toHaveBeenCalled();
  });

  it('rejects an already-FREE subscription without writing', async () => {
    getSubscription.mockResolvedValue(freeSubscription);

    const response = await POST();

    expect(response.status).toBe(400);
    expect(cancelSubscription).not.toHaveBeenCalled();
  });

  it('returns a generic 500 without leaking the internal error', async () => {
    cancelSubscription.mockRejectedValue(new Error('connection reset'));

    const response = await POST();

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).not.toMatch(/connection reset/);
  });
});
