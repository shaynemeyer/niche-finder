import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getUserProfile = vi.fn();
const updateUserName = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/users', () => ({
  getUserProfile: (...args: unknown[]) => getUserProfile(...args),
  updateUserName: (...args: unknown[]) => updateUserName(...args),
}));

import { GET, PATCH } from './route';

function patchRequest(body: unknown) {
  return new Request('http://localhost/api/user/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

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
  updateUserName.mockResolvedValue({ ...user, name: 'Grace Hopper' });
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

describe('PATCH /api/user/profile', () => {
  it('updates the name and returns the updated profile', async () => {
    const response = await PATCH(patchRequest({ name: 'Grace Hopper' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      user: {
        ...user,
        name: 'Grace Hopper',
        createdAt: user.createdAt.toISOString(),
      },
    });
    expect(updateUserName).toHaveBeenCalledWith('user-1', 'Grace Hopper');
  });

  it('rejects an unauthenticated request without writing', async () => {
    authMock.mockResolvedValue(null);

    const response = await PATCH(patchRequest({ name: 'Grace Hopper' }));

    expect(response.status).toBe(401);
    expect(updateUserName).not.toHaveBeenCalled();
  });

  it('rejects a name that is too short', async () => {
    const response = await PATCH(patchRequest({ name: 'A' }));

    expect(response.status).toBe(400);
    expect(updateUserName).not.toHaveBeenCalled();
  });

  it('rejects a missing body', async () => {
    const response = await PATCH(patchRequest(undefined));

    expect(response.status).toBe(400);
    expect(updateUserName).not.toHaveBeenCalled();
  });

  it('returns a generic 500 without leaking the internal error', async () => {
    updateUserName.mockRejectedValue(new Error('connection reset'));

    const response = await PATCH(patchRequest({ name: 'Grace Hopper' }));

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).not.toMatch(/connection reset/);
  });
});
