import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const listReports = vi.fn();

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

// Mocked at the data layer rather than at Prisma: the handler's job is auth,
// input validation and shaping the response, and lib/data owns the query.
vi.mock('@/lib/data/reports', () => ({
  listReports: (...args: unknown[]) => listReports(...args),
}));

import { GET } from './route';

function getRequest(query = '') {
  return new Request(`http://localhost:3000/api/reports${query}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  listReports.mockResolvedValue([]);
});

describe('GET /api/reports', () => {
  it('returns the caller reports', async () => {
    listReports.mockResolvedValue([{ id: 'report-1', niche: 'AI tools' }]);

    const response = await GET(getRequest());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      reports: [{ id: 'report-1', niche: 'AI tools' }],
    });
  });

  it('rejects an unauthenticated request without querying', async () => {
    authMock.mockResolvedValue(null);

    const response = await GET(getRequest());

    expect(response.status).toBe(401);
    expect(listReports).not.toHaveBeenCalled();
  });

  it('passes the session user id, never one from the request', async () => {
    await GET(getRequest('?userId=someone-else'));

    // The only thing keeping one account's reports out of another's response.
    expect(listReports.mock.calls[0][0]).toBe('user-1');
  });

  it('filters by status when asked', async () => {
    await GET(getRequest('?status=PENDING'));

    expect(listReports.mock.calls[0][1]).toMatchObject({ status: 'PENDING' });
  });

  it('rejects an unknown status rather than ignoring it', async () => {
    const response = await GET(getRequest('?status=BOGUS'));

    // Dropping it would return every report and read as a broken filter.
    expect(response.status).toBe(400);
    expect(listReports).not.toHaveBeenCalled();
  });

  it('applies no status filter when the parameter is absent', async () => {
    await GET(getRequest());

    expect(listReports.mock.calls[0][1].status).toBeUndefined();
  });

  it('caps the limit so a caller cannot request everything', async () => {
    await GET(getRequest('?limit=5000'));

    expect(listReports.mock.calls[0][1].limit).toBe(100);
  });

  it('falls back to the default limit for junk input', async () => {
    await GET(getRequest('?limit=abc'));

    expect(listReports.mock.calls[0][1].limit).toBe(20);
  });
});
