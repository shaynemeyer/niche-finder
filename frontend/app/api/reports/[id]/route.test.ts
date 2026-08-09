import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const deleteReport = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

vi.mock('@/lib/data/reports', () => ({
  deleteReport: (...args: unknown[]) => deleteReport(...args),
}));

import { DELETE } from './route';

function deleteRequest(id = 'report-1') {
  return [
    new Request(`http://localhost:3000/api/reports/${id}`, {
      method: 'DELETE',
    }),
    { params: Promise.resolve({ id }) },
  ] as const;
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  deleteReport.mockResolvedValue(true);
});

describe('DELETE /api/reports/[id]', () => {
  it('returns 204 with no body when the report was deleted', async () => {
    const response = await DELETE(...deleteRequest());

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe('');
  });

  it('rejects an unauthenticated request without deleting', async () => {
    authMock.mockResolvedValue(null);

    const response = await DELETE(...deleteRequest());

    expect(response.status).toBe(401);
    expect(deleteReport).not.toHaveBeenCalled();
  });

  it('scopes the delete to the session user', async () => {
    await DELETE(...deleteRequest('report-9'));

    // The id comes from the URL; the user must not.
    expect(deleteReport).toHaveBeenCalledWith('report-9', 'user-1');
  });

  it('404s when the report is missing or belongs to someone else', async () => {
    deleteReport.mockResolvedValue(false);

    const response = await DELETE(...deleteRequest());

    // Same response either way, so a guessed id reveals nothing.
    expect(response.status).toBe(404);
  });
});
