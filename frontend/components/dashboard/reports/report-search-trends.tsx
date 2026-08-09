import { TrendingUp } from 'lucide-react';

import type { TrendsAnalysisResult } from '@/lib/trends/types';

/** Interest/growth summary, a timeline bar chart, and related search terms. */
export function ReportSearchTrends({
  trends,
}: {
  trends: TrendsAnalysisResult;
}) {
  const maxValue = Math.max(
    ...trends.timelineData.map((point) => point.value),
    1,
  );
  const topQueries = trends.relatedQueries.top.slice(0, 5);

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Search Trends
        </h2>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm text-muted-foreground">Avg Interest</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {trends.averageInterest}/100
            </div>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-sm text-muted-foreground">Growth</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 capitalize">
              {trends.trend}
              <span className="text-xs block text-muted-foreground">
                {trends.growthRate}% change
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-foreground mb-3">
            Search Volume Trend
          </h4>
          <div
            className="relative bg-muted rounded-lg p-4"
            style={{ height: '160px' }}
          >
            <div className="flex items-end justify-between gap-1 h-full">
              {trends.timelineData.map((point) => {
                const isZero = point.value === 0;
                const heightPct = Math.max(
                  (point.value / maxValue) * 100,
                  isZero ? 4 : 0,
                );

                return (
                  <div key={point.time} className="flex-1 group relative h-full flex items-end">
                    <div
                      className={
                        isZero
                          ? 'w-full rounded-t transition-all bg-muted-foreground/40 hover:bg-muted-foreground/60'
                          : 'w-full rounded-t transition-all bg-blue-500 hover:bg-blue-600'
                      }
                      style={{ height: `${heightPct}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {point.time}
                        <br />
                        Value: {point.value}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="absolute top-2 right-2 text-xs text-muted-foreground">
              Peak: {maxValue}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-center mt-2">
            Last {trends.timelineData.length} periods • Scaled for visibility
          </div>

          <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded text-xs text-muted-foreground">
            <strong>Note:</strong> Gray bars indicate periods with zero search
            volume. This is normal for new or very niche keywords.
          </div>
        </div>

        {topQueries.length > 0 && (
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Related Searches
            </h4>
            <div className="space-y-2">
              {topQueries.map((related) => (
                <div
                  key={related.query}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-sm text-foreground">
                    {related.query}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${related.value}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {related.value}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
