import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { getMonthlyUsage, listReports } from '@/lib/data/reports';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { PendingPaymentNotice } from '@/components/dashboard/pending-payment-notice';
import { SubscriptionStatusCard } from '@/components/dashboard/subscription-status-card';
import { ValidationForm } from '@/components/dashboard/validation-form';
import { RecentReports } from '@/components/dashboard/recent-reports';
import { ReportStatusPoller } from '@/components/dashboard/report-status-poller';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';

const hasPendingPayment = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const userId = session.user.id;

  const [reports, used] = await Promise.all([
    listReports(userId, { limit: 5 }),
    getMonthlyUsage(userId),
  ]);

  const planType = session.user.subscription?.planType ?? 'FREE';

  // Recomputed on every refresh, so the poller stops once the last report
  // reaches COMPLETED or FAILED.
  const hasUnsettledReports = reports.some(
    (report) => report.status === 'PENDING' || report.status === 'PROCESSING',
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WelcomeHeader firstName={session.user.name?.split(' ')[0] || 'there'} />

      {hasPendingPayment && <PendingPaymentNotice />}

      <SubscriptionStatusCard
        planType={planType}
        used={used}
        limit={planType === 'PRO' ? null : FREE_TIER_MONTHLY_LIMIT}
      />

      <ValidationForm />

      <ReportStatusPoller hasUnsettledReports={hasUnsettledReports} />

      <RecentReports reports={reports} />

      <QuickStats
        total={reports.length}
        thisMonth={used}
        completed={reports.filter((r) => r.status === 'COMPLETED').length}
      />
    </div>
  );
}
