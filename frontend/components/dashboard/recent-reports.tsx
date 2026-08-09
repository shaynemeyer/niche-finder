import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { ReportRow } from '@/components/dashboard/report-row';
import { ReportsEmptyState } from '@/components/dashboard/reports-empty-state';
import type { ReportListItem } from '@/lib/data/reports';

export function RecentReports({
  reports,
  isLoading = false,
}: {
  reports: ReportListItem[];
  isLoading?: boolean;
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Recent Validations
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your latest niche validation reports
            </p>
          </div>
          <Link
            href="/dashboard/reports"
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            View All
            <ArrowRight className="size-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        ) : reports.length === 0 ? (
          <ReportsEmptyState
            title="No validations yet"
            description="Start validating your first niche to see results here"
          />
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
