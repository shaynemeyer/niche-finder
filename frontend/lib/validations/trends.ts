import { z } from 'zod';

/**
 * Validates TrendsAnalysisResult read back out of the trendsData JSONB
 * column, rather than trusting an unchecked cast - see
 * app/dashboard/reports/[id]/page.tsx. Mirrors lib/trends/types.ts.
 */
export const trendsAnalysisResultSchema = z.object({
  keyword: z.string(),
  timelineData: z.array(z.object({ time: z.string(), value: z.number() })),
  averageInterest: z.number(),
  growthRate: z.number(),
  trend: z.enum(['rising', 'declining', 'stable']),
  relatedQueries: z.object({
    top: z.array(z.object({ query: z.string(), value: z.number() })),
    rising: z.array(z.object({ query: z.string(), value: z.number() })),
  }),
  regionalInterest: z.array(z.object({ geo: z.string(), value: z.number() })),
  insights: z.array(z.string()),
  partial: z.boolean(),
});
