import { Target, Zap, CheckCircle } from 'lucide-react';

import type { AIMarketInsights } from '@/lib/validations/insights';

const phases = [
  {
    key: 'phase1' as const,
    title: '📍 Phase 1: Foundation (Weeks 1-4)',
    color: 'bg-blue-50 dark:bg-blue-950',
    badge: 'bg-blue-600 text-white',
  },
  {
    key: 'phase2' as const,
    title: '🚀 Phase 2: Growth (Weeks 5-12)',
    color: 'bg-green-50 dark:bg-green-950',
    badge: 'bg-green-600 text-white',
  },
  {
    key: 'phase3' as const,
    title: '📈 Phase 3: Scale (Month 4+)',
    color: 'bg-purple-50 dark:bg-purple-950',
    badge: 'bg-purple-600 text-white',
  },
];

/** Quick wins plus the three-phase rollout plan. */
export function ReportGtmStrategy({
  gtmStrategy,
}: {
  gtmStrategy: AIMarketInsights['gtmStrategy'];
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Go-to-Market Strategy
        </h2>
      </div>
      <div className="px-6 py-4 space-y-6">
        <p className="text-muted-foreground">
          A phased approach to launching and growing your business in this
          niche.
        </p>

        <div>
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            Quick Wins (Start Immediately)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {gtmStrategy.quickWins.map((win) => (
              <div
                key={win}
                className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-foreground">{win}</span>
              </div>
            ))}
          </div>
        </div>

        {phases.map(({ key, title, color, badge }) => (
          <div key={key}>
            <h4 className="font-semibold text-foreground mb-3">{title}</h4>
            <ol className="space-y-2">
              {gtmStrategy[key].map((step, index) => (
                <li
                  key={step}
                  className={`flex items-start gap-3 p-3 ${color} rounded-lg`}
                >
                  <span
                    className={`flex items-center justify-center w-6 h-6 ${badge} text-sm font-bold rounded-full flex-shrink-0`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-foreground pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
