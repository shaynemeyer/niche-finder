import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getAdminAnalytics } from '@/lib/data/admin';
import { PRO_MONTHLY_PRICE } from '@/lib/constants';
import { KeyMetrics } from '@/components/admin/key-metrics';
import { ReportsByStatus } from '@/components/admin/reports-by-status';
import { SecondaryMetrics } from '@/components/admin/analytics/secondary-metrics';
import { UserPlanBreakdown } from '@/components/admin/analytics/user-plan-breakdown';
import { PerformanceSummary } from '@/components/admin/analytics/performance-summary';
import { SummaryCards } from '@/components/admin/analytics/summary-cards';
import { RefreshButton } from '@/components/admin/analytics/refresh-button';

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const analytics = await getAdminAnalytics();
  const proUsers = analytics.planBreakdown.PRO;
  const freeUsers = analytics.planBreakdown.FREE;
  const proConversionRate = analytics.totalUsers
    ? Math.round((proUsers / analytics.totalUsers) * 100)
    : 0;
  const successRate = analytics.totalReports
    ? Math.round(
        (analytics.reportsBreakdown.COMPLETED / analytics.totalReports) * 100,
      )
    : 0;
  // No billing model exists yet, so MRR is derived from the pro user count
  // and the landing page's list price rather than a real subscription charge.
  const mrr = proUsers * PRO_MONTHLY_PRICE;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Detailed platform analytics and insights
          </p>
        </div>
        <RefreshButton />
      </div>

      <KeyMetrics
        totalUsers={analytics.totalUsers}
        newUsersThisMonth={analytics.newUsersThisMonth}
        totalReports={analytics.totalReports}
        recentReports={analytics.recentReports}
        proUsers={proUsers}
        freeUsers={freeUsers}
        mrr={mrr}
      />

      <SecondaryMetrics
        averageScore={analytics.averageScore}
        monthlyValidations={analytics.monthlyValidations}
        proConversionRate={proConversionRate}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsByStatus counts={analytics.reportsBreakdown} />
        <UserPlanBreakdown proUsers={proUsers} freeUsers={freeUsers} />
      </div>

      <PerformanceSummary
        completedReports={analytics.reportsBreakdown.COMPLETED}
        totalReports={analytics.totalReports}
        failedReports={analytics.reportsBreakdown.FAILED}
        averageScore={analytics.averageScore}
      />

      <SummaryCards
        newUsersThisMonth={analytics.newUsersThisMonth}
        recentReports={analytics.recentReports}
        mrr={mrr}
        successRate={successRate}
      />
    </div>
  );
}
