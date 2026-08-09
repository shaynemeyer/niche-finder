import Link from 'next/link';
import { CheckCircle2, Eye } from 'lucide-react';

import {
  isRunning,
  ReportStatusBadge,
  ViabilityBadge,
} from '@/components/dashboard/report-status-badge';
import { ReportProgressBar } from '@/components/dashboard/report-progress-bar';
import { DeleteReportButton } from '@/components/dashboard/delete-report-button';
import { Button } from '@/components/ui/button';
import type { ReportListItem } from '@/lib/data/reports';

const dateFormat: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

/**
 * One report in a list. Shared by the dashboard's recent reports and the full
 * reports page so the two cannot drift on what a report looks like.
 *
 * `actions` adds the View button on the reports page. The dashboard omits it —
 * there the whole row is a link, and a button inside a link nests interactive
 * elements, which breaks keyboard navigation.
 */
export function ReportRow({
  report,
  actions = false,
}: {
  report: ReportListItem;
  actions?: boolean;
}) {
  const body = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          {report.status === 'COMPLETED' && (
            <CheckCircle2 className="size-5 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
          )}
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground truncate">
              {report.niche}
            </h3>
            <p className="text-sm text-muted-foreground truncate">
              {report.keyword}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted-foreground">
          <ReportStatusBadge status={report.status} />
          {report.viabilityRating && (
            <ViabilityBadge rating={report.viabilityRating} />
          )}
          {/* Absent whenever the score was withheld — a partial trends run or
              fallback insights — rather than shown as zero. */}
          {report.overallScore !== null && (
            <span className="font-medium">
              Score: {report.overallScore}/100
            </span>
          )}
          <span>
            Created: {report.createdAt.toLocaleDateString(undefined, dateFormat)}
          </span>
        </div>

        {isRunning(report.status) && <ReportProgressBar />}
      </div>

      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/reports/${report.id}`}>
              <Eye data-icon="inline-start" />
              View
            </Link>
          </Button>
          <DeleteReportButton reportId={report.id} niche={report.niche} />
        </div>
      )}
    </div>
  );

  if (actions) {
    return (
      <div className="p-4 border border-border rounded-lg hover:shadow-sm transition">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={`/dashboard/reports/${report.id}`}
      className="block p-4 border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition"
    >
      {body}
    </Link>
  );
}
