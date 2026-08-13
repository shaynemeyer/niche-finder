import { Activity } from 'lucide-react';

import { ProgressBar } from '@/components/admin/progress-bar';

type PerformanceSummaryProps = {
  completedReports: number;
  totalReports: number;
  failedReports: number;
  averageScore: number;
};

export function PerformanceSummary({
  completedReports,
  totalReports,
  failedReports,
  averageScore,
}: PerformanceSummaryProps) {
  const completedRate = totalReports
    ? Math.round((completedReports / totalReports) * 100)
    : 0;
  const failureRate = totalReports
    ? Math.round((failedReports / totalReports) * 100)
    : 0;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Platform Performance
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Key health metrics at a glance
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <ProgressBar
              label="Report Success Rate"
              value={completedRate}
              max={100}
              barClassName="bg-green-500 dark:bg-green-400"
              showPercent
            />
            <p className="text-xs text-muted-foreground">
              {completedReports} of {totalReports} reports completed
            </p>
          </div>
          <div className="space-y-2">
            <ProgressBar
              label="Report Failure Rate"
              value={failureRate}
              max={100}
              barClassName="bg-red-500 dark:bg-red-400"
              showPercent
            />
            <p className="text-xs text-muted-foreground">
              {failedReports} failed reports
            </p>
          </div>
          <div className="space-y-2">
            <ProgressBar
              label="Average Score Quality"
              value={averageScore}
              max={100}
              barClassName="bg-blue-500 dark:bg-blue-400"
              showPercent
            />
            <p className="text-xs text-muted-foreground">
              Based on all completed reports
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
