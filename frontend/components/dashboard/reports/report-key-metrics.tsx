import { TrendingUp, BarChart3, Globe } from 'lucide-react';

import type { TrendsAnalysisResult } from '@/lib/trends/types';

/** Top-line trend numbers, pulled straight from trendsData. */
export function ReportKeyMetrics({
  trends,
}: {
  trends: TrendsAnalysisResult;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-950 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {trends.averageInterest}/100
              </div>
              <div className="text-sm text-muted-foreground">
                Avg. Interest
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-950 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {trends.growthRate}%
              </div>
              <div className="text-sm text-muted-foreground">
                Growth Rate
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm">
        <div className="py-4 px-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-950 rounded-lg">
              <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground capitalize">
                {trends.trend}
              </div>
              <div className="text-sm text-muted-foreground">
                Trend Status
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
