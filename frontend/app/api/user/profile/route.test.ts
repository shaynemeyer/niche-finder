import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getUserProfile = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/users', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
}));

import { GET } from './route';

const user = {
  id: 'user-1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  role: 'USER',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  getUserProfile.mockResolvedValue(user);
});

describe('GET /api/user/profile', () => {
  it('returns the caller profile', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: { ...user, createdAt: user.createdAt.toISOString() },
    });
  });

  it('rejects an unauthenticated request without querying', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(getUserProfile).not.toHaveBeenCalled();
  });

  it('reads the profile for the session user, never one from the request', async () => {
    await GET();

    expect(getUserProfile).toHaveBeenCalledWith('user-1');
  });

  it('returns 404 when the session user no longer exists', async () => {
    getUserProfile.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(404);
  });
});
