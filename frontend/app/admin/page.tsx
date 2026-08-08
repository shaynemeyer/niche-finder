import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { KeyMetrics } from '@/components/admin/key-metrics';
import { ReportsByStatus } from '@/components/admin/reports-by-status';
import { PlatformStatistics } from '@/components/admin/platform-statistics';
import { QuickActions } from '@/components/admin/quick-actions';
import type { ReportStatus } from '@/lib/generated/prisma/client';

// The report pipeline and admin queries do not exist yet; these stand in
// until they do.
const metrics = {
  totalUsers: 0,
  newUsersThisMonth: 0,
  totalReports: 0,
  recentReports: 0,
  proUsers: 0,
  freeUsers: 0,
  mrr: 0,
};

const reportCounts: Record<ReportStatus, number> = {
  COMPLETED: 0,
  PROCESSING: 0,
  PENDING: 0,
  FAILED: 0,
};

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  if (session.user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Platform overview and key metrics
        </p>
      </div>

      <KeyMetrics {...metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportsByStatus counts={reportCounts} />
        <PlatformStatistics
          monthlyValidations={0}
          monthlyValidationsTarget={100}
          averageScore={0}
          proConversionRate={0}
        />
      </div>

      <QuickActions />
    </div>
  );
}
