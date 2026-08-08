import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import type { ReportStatus } from '@/lib/generated/prisma/client';

export type RecentReport = {
  id: string;
  niche: string;
  keyword: string;
  status: ReportStatus;
  createdAt: Date;
  overallScore: number | null;
  viabilityRating: string | null;
};

const viabilityStyles: Record<string, string> = {
  HIGH: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  MEDIUM:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  LOW: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export function RecentReports({
  reports,
  isLoading = false,
}: {
  reports: RecentReport[];
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
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="animate-pulse">
              <div className="h-20 bg-muted rounded-lg" />
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No validations yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Start validating your first niche to see results here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="block p-4 border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-muted-foreground">
                        {report.status}
                      </span>
                      <h4 className="font-medium text-foreground">
                        {report.niche}
                      </h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {report.keyword}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{report.createdAt.toLocaleDateString()}</span>
                      {report.overallScore !== null && (
                        <span>Score: {report.overallScore}/100</span>
                      )}
                    </div>
                  </div>
                  {report.viabilityRating && (
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          viabilityStyles[report.viabilityRating] ??
                          'bg-muted text-muted-foreground'
                        }`}
                      >
                        {report.viabilityRating}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
