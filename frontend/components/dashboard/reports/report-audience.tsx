import { Users } from 'lucide-react';

import type { AIMarketInsights } from '@/lib/validations/insights';

/** Demographics, psychographics and pain points from the AI insights. */
export function ReportAudience({
  targetAudience,
}: {
  targetAudience: AIMarketInsights['targetAudience'];
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Target Audience
        </h2>
      </div>
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Demographics
            </h4>
            <p className="text-sm text-foreground">
              {targetAudience.demographics}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Psychographics
            </h4>
            <p className="text-sm text-foreground">
              {targetAudience.psychographics}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">
              Key Challenges
            </h4>
            <ul className="space-y-1">
              {targetAudience.painPoints.map((point) => (
                <li
                  key={point}
                  className="text-sm text-foreground flex items-start gap-2"
                >
                  <span className="text-purple-600 dark:text-purple-400">
                    •
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
