import { ReportStatusBadge } from '@/components/dashboard/report-status-badge';
import { ReportProgressBar } from '@/components/dashboard/report-progress-bar';
import type { ReportStatus } from '@/lib/generated/prisma/client';

/** Shown in place of the analysis while a report is still PENDING/PROCESSING. */
export function ReportProcessing({
  niche,
  keyword,
  status,
}: {
  niche: string;
  keyword: string;
  status: ReportStatus;
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="py-12 px-6 text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">{niche}</h1>
        <p className="text-muted-foreground">
          Keyword: <span className="font-semibold">{keyword}</span>
        </p>
        <div className="flex justify-center">
          <ReportStatusBadge status={status} />
        </div>
        <div className="max-w-sm mx-auto">
          <ReportProgressBar />
        </div>
        <p className="text-sm text-muted-foreground">
          This page refreshes automatically while your report is being
          analyzed.
        </p>
      </div>
    </div>
  );
}
