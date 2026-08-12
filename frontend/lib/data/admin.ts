/**
 * Data access for admin analytics. See lib/data/reports.ts for why queries
 * live in this layer rather than in route handlers.
 */
import { prisma } from '@/lib/prisma';
import { PlanType, ReportStatus } from '@/lib/generated/prisma/client';

export type PlanBreakdown = Record<PlanType, number>;
export type ReportStatusBreakdown = Record<ReportStatus, number>;

export type AdminAnalytics = {
  totalUsers: number;
  planBreakdown: PlanBreakdown;
  totalReports: number;
  reportsBreakdown: ReportStatusBreakdown;
  monthlyValidations: number;
  newUsersThisMonth: number;
  recentReports: number;
  averageScore: number;
};

function countByKey<K extends string>(
  groups: { _count: number }[],
  keys: readonly K[],
  keyOf: (group: { _count: number }, index: number) => K,
): Record<K, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    K,
    number
  >;
  groups.forEach((group, index) => {
    counts[keyOf(group, index)] = group._count;
  });
  return counts;
}

/** Site-wide counts for the admin dashboard: users, plans, report statuses, and recent activity. */
export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    subscriptionGroups,
    totalReports,
    reportStatusGroups,
    monthlyUsage,
    newUsersThisMonth,
    recentReports,
    completedScore,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.groupBy({ by: ['planType'], _count: true }),
    prisma.report.count(),
    prisma.report.groupBy({ by: ['status'], _count: true }),
    prisma.usageLog.aggregate({
      where: { month, year },
      _sum: { validationCount: true },
    }),
    prisma.user.count({ where: { createdAt: { gte: firstDayOfMonth } } }),
    prisma.report.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.report.aggregate({
      where: { status: ReportStatus.COMPLETED, overallScore: { not: null } },
      _avg: { overallScore: true },
    }),
  ]);

  const planBreakdown = countByKey(
    subscriptionGroups,
    Object.values(PlanType),
    (_group, index) => subscriptionGroups[index].planType,
  );

  const reportsBreakdown = countByKey(
    reportStatusGroups,
    Object.values(ReportStatus),
    (_group, index) => reportStatusGroups[index].status,
  );

  return {
    totalUsers,
    planBreakdown,
    totalReports,
    reportsBreakdown,
    monthlyValidations: monthlyUsage._sum.validationCount ?? 0,
    newUsersThisMonth,
    recentReports,
    averageScore: completedScore._avg.overallScore
      ? Math.round(completedScore._avg.overallScore)
      : 0,
  };
}
