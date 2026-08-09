import { Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AIMarketInsights } from '@/lib/validations/insights';

const levelStyles: Record<AIMarketInsights['competitionAnalysis']['level'], string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

/** Competition level, key players and differentiation opportunities. */
export function ReportCompetition({
  competitionAnalysis,
}: {
  competitionAnalysis: AIMarketInsights['competitionAnalysis'];
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          Competition & Market Gaps
        </h2>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Competition Level
            </h4>
            <span
              className={cn(
                'inline-flex items-center px-4 py-1 rounded-full text-base font-medium capitalize',
                levelStyles[competitionAnalysis.level],
              )}
            >
              {competitionAnalysis.level}
            </span>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Key Players
            </h4>
            <ul className="space-y-1">
              {competitionAnalysis.keyPlayers.map((player) => (
                <li key={player} className="text-sm text-foreground">
                  {player}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4">
          <h4 className="font-semibold text-foreground mb-2">
            Differentiation Opportunities
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {competitionAnalysis.differentiationOpportunities.map((opp) => (
              <div
                key={opp}
                className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-900"
              >
                <p className="text-sm text-foreground">{opp}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
