import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
const findFirst = vi.fn();
const findUnique = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
    },
    usageLog: { findUnique: (...args: unknown[]) => findUnique(...args) },
  },
}));

import { getMonthlyUsage, getReport, listReports } from './reports';

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([]);
  findFirst.mockResolvedValue(null);
  findUnique.mockResolvedValue(null);
});

describe('listReports', () => {
  it('scopes to the given user', async () => {
    await listReports('user-1');

    // The only thing keeping one account's reports out of another's list.
    expect(findMany.mock.calls[0][0].where).toMatchObject({ userId: 'user-1' });
  });

  it('omits the JSONB payloads', async () => {
    await listReports('user-1');

    // Large, and a list never renders them.
    const { select } = findMany.mock.calls[0][0];
    expect(select).not.toHaveProperty('trendsData');
    expect(select).not.toHaveProperty('aiInsights');
    expect(select.overallScore).toBe(true);
  });

  it('returns newest first', async () => {
    await listReports('user-1');

    expect(findMany.mock.calls[0][0].orderBy).toEqual({ createdAt: 'desc' });
  });

  it('applies the status filter only when given', async () => {
    await listReports('user-1');
    expect(findMany.mock.calls[0][0].where).not.toHaveProperty('status');

    await listReports('user-1', { status: 'PENDING' });
    expect(findMany.mock.calls[1][0].where).toMatchObject({
      status: 'PENDING',
    });
  });

  it('takes the requested limit, else a default', async () => {
    await listReports('user-1', { limit: 5 });
    expect(findMany.mock.calls[0][0].take).toBe(5);

    await listReports('user-1');
    expect(findMany.mock.calls[1][0].take).toBe(20);
  });
});

describe('getReport', () => {
  it('scopes by user as well as id', async () => {
    await getReport('report-1', 'user-1');

    // findUnique on id alone would expose another account's report; a report
    // id is guessable enough for that to matter.
    expect(findFirst.mock.calls[0][0].where).toEqual({
      id: 'report-1',
      userId: 'user-1',
    });
  });

  it('returns null for a foreign or missing report', async () => {
    await expect(getReport('report-1', 'user-1')).resolves.toBeNull();
  });
});

describe('getMonthlyUsage', () => {
  it('reads the current calendar month for the user', async () => {
    await getMonthlyUsage('user-1', new Date('2026-03-15T00:00:00Z'));

    expect(findUnique.mock.calls[0][0].where.userId_month_year).toEqual({
      userId: 'user-1',
      month: 3,
      year: 2026,
    });
  });

  it('returns 0 before any validation has been run', async () => {
    // Registration creates the row, but a user in a new month has none yet.
    await expect(getMonthlyUsage('user-1')).resolves.toBe(0);
  });

  it('returns the stored count', async () => {
    findUnique.mockResolvedValue({ validationCount: 2 });

    await expect(getMonthlyUsage('user-1')).resolves.toBe(2);
  });
});
