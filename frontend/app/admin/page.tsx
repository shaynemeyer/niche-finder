import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getAdminAnalytics } from '@/lib/data/admin';
import { KeyMetrics } from '@/components/admin/key-metrics';
import { ReportsByStatus } from '@/components/admin/reports-by-status';
import { PlatformStatistics } from '@/components/admin/platform-statistics';
import { QuickActions } from '@/components/admin/quick-actions';

// No billing model exists yet, so MRR has no data source to read from.
const MRR_PLACEHOLDER = 0;
// No usage target is modeled yet; 100 keeps the progress bar meaningful.
const MONTHLY_VALIDATIONS_TARGET = 100;

export default async function AdminPage() {
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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and key metrics
        </p>
      </div>

      <KeyMetrics
        totalUsers={analytics.totalUsers}
        newUsersThisMonth={analytics.newUsersThisMonth}
        totalReports={analytics.totalReports}
        recentReports={analytics.recentReports}
        proUsers={proUsers}
        freeUsers={freeUsers}
        mrr={MRR_PLACEHOLDER}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsByStatus counts={analytics.reportsBreakdown} />
        <PlatformStatistics
          monthlyValidations={analytics.monthlyValidations}
          monthlyValidationsTarget={MONTHLY_VALIDATIONS_TARGET}
          averageScore={analytics.averageScore}
          proConversionRate={proConversionRate}
        />
      </div>

      <QuickActions />
    </div>
  );
}
