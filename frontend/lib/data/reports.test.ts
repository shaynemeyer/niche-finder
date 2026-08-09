import { beforeEach, describe, expect, it, vi } from 'vitest';

const findMany = vi.fn();
const findFirst = vi.fn();
const count = vi.fn();
const deleteMany = vi.fn();
const findUnique = vi.fn();
const subscriptionFindUnique = vi.fn();
const usageUpsert = vi.fn();
const usageUpdate = vi.fn();

vi.mock('@/lib/prisma', () => ({
  prisma: {
    report: {
      findMany: (...args: unknown[]) => findMany(...args),
      findFirst: (...args: unknown[]) => findFirst(...args),
      count: (...args: unknown[]) => count(...args),
      deleteMany: (...args: unknown[]) => deleteMany(...args),
    },
    subscription: {
      findUnique: (...args: unknown[]) => subscriptionFindUnique(...args),
    },
    usageLog: {
      findUnique: (...args: unknown[]) => findUnique(...args),
      upsert: (...args: unknown[]) => usageUpsert(...args),
      update: (...args: unknown[]) => usageUpdate(...args),
    },
  },
}));

import {
  claimMonthlyValidation,
  countReports,
  deleteReport,
  getMonthlyUsage,
  getReport,
  isProUser,
  listReports,
  startOfMonth,
} from './reports';

beforeEach(() => {
  vi.clearAllMocks();
  findMany.mockResolvedValue([]);
  findFirst.mockResolvedValue(null);
  count.mockResolvedValue(0);
  findUnique.mockResolvedValue(null);
  subscriptionFindUnique.mockResolvedValue(null);
  usageUpsert.mockResolvedValue({ validationCount: 1 });
  usageUpdate.mockResolvedValue({});
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

describe('countReports', () => {
  it('counts in the database rather than over a capped list', async () => {
    count.mockResolvedValue(42);

    // listReports takes at most 20; deriving a total from its length would
    // report the cap for any user above it.
    await expect(countReports('user-1')).resolves.toBe(42);
  });

  it('scopes to the given user', async () => {
    await countReports('user-1');

    expect(count.mock.calls[0][0].where).toMatchObject({ userId: 'user-1' });
  });

  it('filters by status only when given', async () => {
    await countReports('user-1');
    expect(count.mock.calls[0][0].where).not.toHaveProperty('status');

    await countReports('user-1', { status: 'COMPLETED' });
    expect(count.mock.calls[1][0].where).toMatchObject({
      status: 'COMPLETED',
    });
  });

  it('filters by created-since only when given', async () => {
    await countReports('user-1');
    expect(count.mock.calls[0][0].where).not.toHaveProperty('createdAt');

    const since = new Date('2026-08-01T00:00:00Z');
    await countReports('user-1', { since });
    expect(count.mock.calls[1][0].where).toMatchObject({
      createdAt: { gte: since },
    });
  });
});

describe('startOfMonth', () => {
  it('returns midnight on the first of the month', () => {
    const result = startOfMonth(new Date(2026, 7, 9, 14, 30));

    // Local time, matching how createdAt is compared.
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(7);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(0);
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

describe('deleteReport', () => {
  it('scopes the delete by user, not just id', async () => {
    deleteMany.mockResolvedValue({ count: 1 });

    await deleteReport('report-1', 'user-1');

    // userId is part of the delete itself, so there is no window where an
    // ownership check passes and the delete then hits a different row.
    expect(deleteMany.mock.calls[0][0].where).toEqual({
      id: 'report-1',
      userId: 'user-1',
    });
  });

  it('is true when a row was removed', async () => {
    deleteMany.mockResolvedValue({ count: 1 });

    await expect(deleteReport('report-1', 'user-1')).resolves.toBe(true);
  });

  it('is false for a missing or foreign report', async () => {
    deleteMany.mockResolvedValue({ count: 0 });

    await expect(deleteReport('report-1', 'user-1')).resolves.toBe(false);
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

describe('isProUser', () => {
  it('is true only for an active PRO subscription', async () => {
    subscriptionFindUnique.mockResolvedValue({
      planType: 'PRO',
      isActive: true,
    });

    await expect(isProUser('user-1')).resolves.toBe(true);
  });

  it('treats an inactive PRO subscription as not pro', async () => {
    // An expired plan must fall back to the free-tier quota, not skip it.
    subscriptionFindUnique.mockResolvedValue({
      planType: 'PRO',
      isActive: false,
    });

    await expect(isProUser('user-1')).resolves.toBe(false);
  });

  it('is false for FREE and for a missing subscription', async () => {
    subscriptionFindUnique.mockResolvedValue({
      planType: 'FREE',
      isActive: true,
    });
    await expect(isProUser('user-1')).resolves.toBe(false);

    subscriptionFindUnique.mockResolvedValue(null);
    await expect(isProUser('user-1')).resolves.toBe(false);
  });
});

describe('claimMonthlyValidation', () => {
  it('increments before checking the limit', async () => {
    await claimMonthlyValidation('user-1');

    // Reading the count first and incrementing after would let two concurrent
    // requests both see an under-limit value and both proceed.
    expect(usageUpsert.mock.calls[0][0].update).toEqual({
      validationCount: { increment: 1 },
    });
  });

  it('claims against the current calendar month', async () => {
    await claimMonthlyValidation('user-1', {
      now: new Date('2026-03-15T00:00:00Z'),
    });

    expect(usageUpsert.mock.calls[0][0].where.userId_month_year).toEqual({
      userId: 'user-1',
      month: 3,
      year: 2026,
    });
  });

  it('counts the validation even when no limit applies', async () => {
    usageUpsert.mockResolvedValue({ validationCount: 9 });

    // PRO waives the limit, not the record: UsageLog is what "This Month"
    // reports, and skipping it left PRO accounts showing zero.
    await expect(
      claimMonthlyValidation('user-1', { enforceLimit: false }),
    ).resolves.toBe(true);
    expect(usageUpsert).toHaveBeenCalledOnce();
    expect(usageUpdate).not.toHaveBeenCalled();
  });

  it('allows the last claim inside the limit', async () => {
    usageUpsert.mockResolvedValue({ validationCount: 3 });

    await expect(claimMonthlyValidation('user-1')).resolves.toBe(true);
    expect(usageUpdate).not.toHaveBeenCalled();
  });

  it('rolls the increment back when it breaches the limit', async () => {
    usageUpsert.mockResolvedValue({ validationCount: 4 });

    await expect(claimMonthlyValidation('user-1')).resolves.toBe(false);
    // Left as it found it, or a refused request would still burn a slot.
    expect(usageUpdate.mock.calls[0][0].data).toEqual({
      validationCount: { decrement: 1 },
    });
  });
});
