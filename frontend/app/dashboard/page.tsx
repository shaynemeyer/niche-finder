import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { WelcomeHeader } from '@/components/dashboard/welcome-header';
import { PendingPaymentNotice } from '@/components/dashboard/pending-payment-notice';
import { SubscriptionStatusCard } from '@/components/dashboard/subscription-status-card';
import { ValidationForm } from '@/components/dashboard/validation-form';
import {
  RecentReports,
  type RecentReport,
} from '@/components/dashboard/recent-reports';
import { QuickStats } from '@/components/dashboard/quick-stats';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';

// The report pipeline does not exist yet; these stand in until it does.
const reports: RecentReport[] = [];
const used = 0;
const hasPendingPayment = false;

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  const planType = session.user.subscription?.planType ?? 'FREE';

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

      <RecentReports reports={reports} />

      <QuickStats
        total={reports.length}
        thisMonth={used}
        completed={reports.filter((r) => r.status === 'COMPLETED').length}
      />
    </div>
  );
}
