import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/lib/auth';
import { countReports, listReports } from '@/lib/data/reports';
import { ReportStatus } from '@/lib/generated/prisma/client';
import { Button } from '@/components/ui/button';
import { ReportFilter } from '@/components/dashboard/report-filter';
import { ReportRow } from '@/components/dashboard/report-row';
import { ReportStats } from '@/components/dashboard/report-stats';
import { ReportsEmptyState } from '@/components/dashboard/reports-empty-state';

/** Ignores anything that is not a real status, so a junk URL shows everything. */
function parseStatus(raw: string | undefined): ReportStatus | undefined {
  return Object.values(ReportStatus).includes(raw as ReportStatus)
    ? (raw as ReportStatus)
    : undefined;
}

export default async function ReportsPage(
  props: PageProps<'/dashboard/reports'>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const userId = session.user.id;
  const { status: rawStatus } = await props.searchParams;
  const status = parseStatus(
    Array.isArray(rawStatus) ? rawStatus[0] : rawStatus,
  );

  const [reports, total, completed, processing, failed] = await Promise.all([
    listReports(userId, { status, limit: 100 }),
    countReports(userId),
    countReports(userId, { status: ReportStatus.COMPLETED }),
    countReports(userId, { status: ReportStatus.PROCESSING }),
    countReports(userId, { status: ReportStatus.FAILED }),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">All Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your niche validation reports
          </p>
        </div>
        <Button asChild size="lg" className="h-11 px-6 text-sm">
          <Link href="/dashboard">New Validation</Link>
        </Button>
      </div>

      <ReportFilter active={status} />

      <div className="bg-card rounded-lg border border-border shadow-sm">
        {reports.length === 0 ? (
          <ReportsEmptyState
            // Distinguishes "nothing yet" from "nothing matching this filter",
            // where pointing at the validation form would be wrong.
            title={status ? 'No matching reports' : 'No reports yet'}
            description={
              status
                ? 'No reports have this status. Try a different filter.'
                : 'Start validating your first niche to see reports here'
            }
            action={
              status
                ? undefined
                : { href: '/dashboard', label: 'Create First Validation' }
            }
          />
        ) : (
          <div className="p-4 space-y-3">
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} actions />
            ))}
          </div>
        )}
      </div>

      <ReportStats
        total={total}
        completed={completed}
        processing={processing}
        failed={failed}
      />
    </div>
  );
}
