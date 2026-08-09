import { AlertTriangle } from 'lucide-react';

/**
 * Shown when the report used the boilerplate template (isFallback) or trends
 * data was incomplete (partialData) - either way, the analysis below is not
 * fully backed by real data and must not be presented as though it were.
 */
export function ReportFallbackNotice({
  isFallback,
  partialData,
}: {
  isFallback: boolean;
  partialData: boolean;
}) {
  if (!isFallback && !partialData) return null;

  return (
    <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-foreground">
        {isFallback ? (
          <p>
            AI analysis was unavailable when this report ran, so the sections
            below use a generic template rather than insights generated for
            this niche. No score is shown for this reason.
          </p>
        ) : (
          <p>
            Some Google Trends data could not be retrieved for this keyword.
            The figures below may be incomplete.
          </p>
        )}
      </div>
    </div>
  );
}
