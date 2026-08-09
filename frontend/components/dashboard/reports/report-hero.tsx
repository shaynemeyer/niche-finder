import { getScoreColor, getViabilityColor } from './score-colors';

/**
 * Title, overall score and viability rating for a completed report.
 * overallScore/viabilityRating are null for a fallback report - the model
 * withholds a score rather than present a heuristic as real analysis.
 */
export function ReportHero({
  niche,
  keyword,
  overallScore,
  viabilityRating,
  createdAt,
}: {
  niche: string;
  keyword: string;
  overallScore: number | null;
  viabilityRating: string | null;
  createdAt: Date;
}) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-border rounded-lg">
      <div className="py-8 px-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">{niche}</h1>
          <p className="text-lg text-muted-foreground">
            Keyword: <span className="font-semibold">{keyword}</span>
          </p>

          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <div
                className={`text-6xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore ?? 'N/A'}
                {overallScore !== null && <span className="text-3xl">/100</span>}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Overall Score
              </p>
            </div>

            <div className="h-20 w-px bg-border"></div>

            <div className="text-center">
              <div
                className={`inline-block px-6 py-3 rounded-full text-2xl font-bold border-2 ${getViabilityColor(viabilityRating)}`}
              >
                {viabilityRating ?? 'N/A'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Viability Rating
              </p>
            </div>
          </div>

          <div className="text-sm text-muted-foreground mt-4">
            Generated on{' '}
            {createdAt.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
