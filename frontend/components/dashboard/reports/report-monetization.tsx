import { DollarSign } from 'lucide-react';

import type { AIMarketInsights } from '@/lib/validations/insights';

/** Primary and secondary monetization strategies with revenue potential. */
export function ReportMonetization({
  monetizationStrategies,
}: {
  monetizationStrategies: AIMarketInsights['monetizationStrategies'];
}) {
  const strategies = [
    monetizationStrategies.primary,
    ...monetizationStrategies.secondary,
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
          Monetization Strategies
        </h2>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => (
            <div
              key={strategy}
              className="p-4 border-2 border-border rounded-lg hover:border-green-300 dark:hover:border-green-800 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-foreground">
                  {index === 0 ? 'Primary' : 'Secondary'}
                </h4>
              </div>
              <p className="text-sm text-foreground">{strategy}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
          <div className="text-sm text-muted-foreground">
            Estimated Revenue Potential
          </div>
          <div className="text-lg font-semibold text-green-600 dark:text-green-400">
            {monetizationStrategies.estimatedRevenuePotential}
          </div>
        </div>
      </div>
    </div>
  );
}
