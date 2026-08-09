import { Target, CheckCircle, XCircle } from 'lucide-react';

import type { AIMarketInsights } from '@/lib/validations/insights';

/** Summary, strengths/weaknesses and opportunity score from the AI insights. */
export function ReportOpportunity({
  insights,
}: {
  insights: AIMarketInsights;
}) {
  const { opportunityAssessment } = insights;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Opportunity Assessment
        </h2>
      </div>
      <div className="px-6 py-4 space-y-4">
        <p className="text-foreground leading-relaxed">{insights.summary}</p>
        <p className="text-muted-foreground leading-relaxed">
          {opportunityAssessment.reasoning}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-foreground mb-2">Strengths</h4>
            <ul className="space-y-1">
              {opportunityAssessment.strengths.map((strength) => (
                <li
                  key={strength}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2">Weaknesses</h4>
            <ul className="space-y-1">
              {opportunityAssessment.weaknesses.map((weakness) => (
                <li
                  key={weakness}
                  className="flex items-start gap-2 text-sm text-foreground"
                >
                  <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {opportunityAssessment.score !== null && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Opportunity Score
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {opportunityAssessment.score}/100
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
