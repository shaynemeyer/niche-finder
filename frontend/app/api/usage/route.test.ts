import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getMonthlyUsage = vi.fn();
const isProUser = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/reports', () => ({
  getMonthlyUsage: (...args: unknown[]) => getMonthlyUsage(...args),
  isProUser: (...args: unknown[]) => isProUser(...args),
}));

import { GET } from './route';

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  getMonthlyUsage.mockResolvedValue(2);
  isProUser.mockResolvedValue(false);
});

describe('GET /api/usage', () => {
  it('returns the count and the free-tier limit', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ used: 2, limit: 3 });
  });

  it('reports no limit for a pro user', async () => {
    isProUser.mockResolvedValue(true);

    const response = await GET();

    // null rather than a number: PRO is unlimited, and a sentinel like -1 or
    // Infinity would not survive JSON.
    await expect(response.json()).resolves.toEqual({ used: 2, limit: null });
  });

  it('rejects an unauthenticated request without querying', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(getMonthlyUsage).not.toHaveBeenCalled();
  });

  it('reads usage for the session user, never one from the request', async () => {
    await GET();

    expect(getMonthlyUsage).toHaveBeenCalledWith('user-1');
    expect(isProUser).toHaveBeenCalledWith('user-1');
  });

  it('derives no percentage or limit-reached flag', async () => {
    getMonthlyUsage.mockResolvedValue(3);

    const body = await (await GET()).json();

    // The caller derives these; SubscriptionStatusCard already does. Computing
    // them here would be a second place for the rule to drift.
    expect(body).not.toHaveProperty('percentage');
    expect(body).not.toHaveProperty('limitReached');
  });
});
