import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import {
  countReports,
  getMonthlyUsage,
  listReports,
} from '@/lib/data/reports';
import { ReportStatus } from '@/lib/generated/prisma/client';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { PendingPaymentNotice } from '@/components/dashboard/pending-payment-notice';
import { ValidationForm } from '@/components/dashboard/validation-form';
import { RecentReports } from '@/components/dashboard/recent-reports';
import { ReportStatusPoller } from '@/components/dashboard/report-status-poller';
import { QuickStats } from '@/components/dashboard/quick-stats';

const hasPendingPayment = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const userId = session.user.id;

  // Counts come from the database, not from `reports` — that list is capped at
  // 5, so deriving totals from it reports "5" for anyone with more.
  const [reports, used, totalReports, completedReports] = await Promise.all([
    listReports(userId, { limit: 5 }),
    getMonthlyUsage(userId),
    countReports(userId),
    countReports(userId, ReportStatus.COMPLETED),
  ]);


  // Recomputed on every refresh, so the poller stops once the last report
  // reaches COMPLETED or FAILED.
  const hasUnsettledReports = reports.some(
    (report) => report.status === 'PENDING' || report.status === 'PROCESSING',
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <WelcomeHeader firstName={session.user.name?.split(' ')[0] || 'there'} />

      {hasPendingPayment && <PendingPaymentNotice />}

      {/* Plan and usage live in the sidebar (PlanBadge) — a full-width card
          above the fold spent that space on something the user already knows. */}
      <ValidationForm />

      <ReportStatusPoller hasUnsettledReports={hasUnsettledReports} />

      <RecentReports reports={reports} />

      <QuickStats
        total={totalReports}
        thisMonth={used}
        completed={completedReports}
      />
    </div>
  );
}
