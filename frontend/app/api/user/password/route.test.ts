import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const getUserPasswordHash = vi.fn();
const updateUserPassword = vi.fn();
const compare = vi.fn();
const hash = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/users', () => ({
  getUserPasswordHash: (...args: unknown[]) => getUserPasswordHash(...args),
  updateUserPassword: (...args: unknown[]) => updateUserPassword(...args),
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: (...args: unknown[]) => compare(...args),
    hash: (...args: unknown[]) => hash(...args),
  },
}));

import { PUT } from './route';

function putRequest(body: unknown) {
  return new Request('http://localhost/api/user/password', {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

const validBody = {
  currentPassword: 'oldpassword1',
  newPassword: 'newpassword1',
  confirmPassword: 'newpassword1',
};

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  getUserPasswordHash.mockResolvedValue({ password: 'hashed-old' });
  compare.mockResolvedValue(true);
  hash.mockResolvedValue('hashed-new');
  updateUserPassword.mockResolvedValue({ id: 'user-1' });
});

describe('PUT /api/user/password', () => {
  it('updates the password and returns 200', async () => {
    const response = await PUT(putRequest(validBody));

    expect(response.status).toBe(200);
    expect(compare).toHaveBeenCalledWith('oldpassword1', 'hashed-old');
    expect(hash).toHaveBeenCalledWith('newpassword1', 12);
    expect(updateUserPassword).toHaveBeenCalledWith('user-1', 'hashed-new');
  });

  it('rejects an unauthenticated request without querying', async () => {
    authMock.mockResolvedValue(null);

    const response = await PUT(putRequest(validBody));

    expect(response.status).toBe(401);
    expect(getUserPasswordHash).not.toHaveBeenCalled();
  });

  it('returns 400 when the body fails validation', async () => {
    const response = await PUT(
      putRequest({ ...validBody, confirmPassword: 'mismatch1' }),
    );

    expect(response.status).toBe(400);
    expect(getUserPasswordHash).not.toHaveBeenCalled();
  });

  it('returns 400 when the new password matches the current password', async () => {
    const response = await PUT(
      putRequest({
        currentPassword: 'samepassword1',
        newPassword: 'samepassword1',
        confirmPassword: 'samepassword1',
      }),
    );

    expect(response.status).toBe(400);
    expect(getUserPasswordHash).not.toHaveBeenCalled();
  });

  it('returns 400 when the body is not JSON', async () => {
    const request = new Request('http://localhost/api/user/password', {
      method: 'PUT',
      body: 'not json',
    });

    expect((await PUT(request)).status).toBe(400);
    expect(getUserPasswordHash).not.toHaveBeenCalled();
  });

  it('returns 400 when the current password is wrong', async () => {
    compare.mockResolvedValue(false);

    const response = await PUT(putRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Current password is incorrect');
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('returns 400 for an OAuth-only account with no password set', async () => {
    getUserPasswordHash.mockResolvedValue({ password: null });

    const response = await PUT(putRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Current password is incorrect');
    expect(compare).not.toHaveBeenCalled();
    expect(updateUserPassword).not.toHaveBeenCalled();
  });

  it('returns the same 400 when the session user no longer exists', async () => {
    getUserPasswordHash.mockResolvedValue(null);

    const response = await PUT(putRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('Current password is incorrect');
  });

  it('returns a generic 500 without leaking internal detail', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    updateUserPassword.mockRejectedValue(
      new Error('connection refused at 10.0.0.5:5432'),
    );

    const response = await PUT(putRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(body)).not.toContain('10.0.0.5');
  });
});
