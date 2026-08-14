import { z } from 'zod';

/**
 * Unlike the other schemas here, this one validates a model response rather
 * than user input - it is both the wire contract sent to OpenAI via
 * zodResponseFormat and the check applied to what comes back.
 *
 * The shape the model is constrained to return.
 *
 * Covers only model-authored fields - wordCount, isFallback, partialData and
 * model are computed here afterwards. Passing this to zodResponseFormat makes
 * the API enforce the schema, so the parsed result does not need an unchecked
 * cast: response_format json_object only guarantees valid JSON, not this shape.
 */
export const modelInsightsSchema = z.object({
  summary: z.string(),
  opportunityAssessment: z.object({
    score: z.number().nullable(),
    reasoning: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
  }),
  targetAudience: z.object({
    demographics: z.string(),
    psychographics: z.string(),
    painPoints: z.array(z.string()),
  }),
  competitionAnalysis: z.object({
    level: z.enum(['low', 'medium', 'high']),
    keyPlayers: z.array(z.string()),
    differentiationOpportunities: z.array(z.string()),
  }),
  monetizationStrategies: z.object({
    primary: z.string(),
    secondary: z.array(z.string()),
    estimatedRevenuePotential: z.string(),
  }),
  businessIdeas: z.array(
    z.object({
      idea: z.string(),
      description: z.string(),
      difficulty: z.enum(['Easy', 'Medium', 'Hard']),
      timeToLaunch: z.string(),
      estimatedCost: z.string(),
      revenueModel: z.string(),
      targetMarket: z.string(),
    }),
  ),
  gtmStrategy: z.object({
    phase1: z.array(z.string()),
    phase2: z.array(z.string()),
    phase3: z.array(z.string()),
    quickWins: z.array(z.string()),
  }),
  risks: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type ModelInsights = z.infer<typeof modelInsightsSchema>;

/**
 * The full stored shape: modelInsightsSchema plus the fields this app computes
 * itself (wordCount, isFallback, partialData, model). Used to validate
 * aiInsights read back out of the JSONB column, rather than trusting an
 * unchecked cast - see app/dashboard/reports/[id]/page.tsx.
 */
export const aiMarketInsightsSchema = modelInsightsSchema.extend({
  wordCount: z.number(),
  isFallback: z.boolean(),
  partialData: z.boolean(),
  model: z.string().nullable(),
});

export interface AIMarketInsights {
  summary: string;
  opportunityAssessment: {
    /** 0-100, or null when the trends data was incomplete. */
    score: number | null;
    reasoning: string;
    strengths: string[];
    weaknesses: string[];
  };
  targetAudience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
  };
  competitionAnalysis: {
    level: 'low' | 'medium' | 'high';
    keyPlayers: string[];
    differentiationOpportunities: string[];
  };
  monetizationStrategies: {
    primary: string;
    secondary: string[];
    estimatedRevenuePotential: string;
  };
  businessIdeas: {
    idea: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeToLaunch: string;
    estimatedCost: string;
    revenueModel: string;
    targetMarket: string;
  }[];
  gtmStrategy: {
    phase1: string[];
    phase2: string[];
    phase3: string[];
    quickWins: string[];
  };
  risks: string[];
  recommendations: string[];
  wordCount: number;
  /**
   * True when these insights are the built-in template rather than model
   * output, because the OpenAI call failed. Anything presenting a report must
   * say so - the user paid for analysis, not boilerplate.
   */
  isFallback: boolean;
  /** Mirrors TrendsAnalysisResult.partial: the inputs were incomplete. */
  partialData: boolean;
  /** Model that produced these insights, or null for fallback output. */
  model: string | null;
}
