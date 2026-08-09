import { Lightbulb } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { AIMarketInsights } from '@/lib/validations/insights';

const difficultyStyles: Record<
  AIMarketInsights['businessIdeas'][number]['difficulty'],
  string
> = {
  Easy: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  Medium:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  Hard: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

/** Concrete business ideas with launch cost/time/revenue model, plus a quick tally. */
export function ReportBusinessIdeas({
  businessIdeas,
}: {
  businessIdeas: AIMarketInsights['businessIdeas'];
}) {
  const easyCount = businessIdeas.filter(
    (idea) => idea.difficulty === 'Easy',
  ).length;
  const quickLaunchCount = businessIdeas.filter((idea) =>
    /week/i.test(idea.timeToLaunch),
  ).length;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          Business Ideas
        </h2>
      </div>
      <div className="px-6 py-4">
        <p className="text-muted-foreground mb-6">
          Based on the niche analysis, here are specific business ideas you
          can launch:
        </p>
        <div className="space-y-6">
          {businessIdeas.map((idea) => (
            <div
              key={idea.idea}
              className="p-6 border-2 border-border rounded-lg hover:border-yellow-300 dark:hover:border-yellow-800 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {idea.idea}
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {idea.description}
                  </p>
                </div>
                <span
                  className={cn(
                    'ml-4 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                    difficultyStyles[idea.difficulty],
                  )}
                >
                  {idea.difficulty}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Time to Launch
                  </div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">
                    {idea.timeToLaunch}
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Estimated Cost
                  </div>
                  <div className="font-semibold text-green-700 dark:text-green-300">
                    {idea.estimatedCost}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Revenue Model
                  </div>
                  <div className="font-semibold text-purple-700 dark:text-purple-300">
                    {idea.revenueModel}
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">
                    Target Market
                  </div>
                  <div className="font-semibold text-orange-700 dark:text-orange-300">
                    {idea.targetMarket}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-900 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <h4 className="font-semibold text-foreground">Quick Overview</h4>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {businessIdeas.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Ideas Generated
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {easyCount}
              </div>
              <div className="text-xs text-muted-foreground">
                Easy to Start
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {quickLaunchCount}
              </div>
              <div className="text-xs text-muted-foreground">
                Quick Launch
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
