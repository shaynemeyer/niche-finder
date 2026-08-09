import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import type { TrendsAnalysisResult } from '@/lib/trends/types';
import { buildFallbackInsights } from './fallback';
import { buildPrompt } from './prompt';
import {
  modelInsightsSchema,
  type AIMarketInsights,
  type ModelInsights,
} from '@/lib/validations/insights';

export type { AIMarketInsights } from '@/lib/validations/insights';

/**
 * Model used for insight generation, overridable with OPENAI_MODEL so it can
 * be changed per environment without a deploy.
 *
 * The default is a dated pin rather than a floating alias like
 * `gpt-4-turbo-preview`: an alias can change under you and silently alter both
 * output and cost.
 */
const DEFAULT_MODEL = 'gpt-4-turbo-2024-04-09';

/**
 * Tried in order when the primary model fails. A model can be deprecated,
 * overloaded, or unavailable to a given key, and none of those are reasons to
 * drop the user all the way to the boilerplate fallback.
 */
const DEFAULT_FALLBACK_MODELS = ['gpt-4o-mini'];

/** Comma-separated env list to array, empty entries dropped. */
function parseModelList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
}

/** Response ceiling. JSON keys and punctuation consume budget without
 * producing prose, so leave headroom above the requested word count -
 * a truncated response is invalid JSON and lands in the fallback. */
const MAX_TOKENS = { free: 800, pro: 3000 } as const;
const WORD_LIMIT = { free: 500, pro: 2000 } as const;

/**
 * OpenAI Service for generating AI-powered market insights
 */
export class OpenAIService {
  private openai: OpenAI;
  /** Primary first, then fallbacks, in the order they will be tried. */
  private readonly models: string[];

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }

    const primary = process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL;
    const fallbacks = parseModelList(process.env.OPENAI_FALLBACK_MODELS);

    this.models = [
      primary,
      ...(fallbacks.length > 0 ? fallbacks : DEFAULT_FALLBACK_MODELS),
    ].filter((model, index, all) => all.indexOf(model) === index);

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate comprehensive market insights
   */
  async generateMarketInsights(
    niche: string,
    keyword: string,
    trendsData: TrendsAnalysisResult,
    isPro: boolean = false,
  ): Promise<AIMarketInsights> {
    const tier = isPro ? 'pro' : 'free';
    const maxTokens = MAX_TOKENS[tier];
    const wordLimit = WORD_LIMIT[tier];

    const prompt = buildPrompt(niche, keyword, trendsData, wordLimit);

    let lastError: unknown;

    // Each configured model in turn: a deprecated, overloaded or
    // unavailable-to-this-key model should not drop the user to boilerplate
    // while another model would have answered.
    for (const model of this.models) {
      try {
        const parsed = await this.requestInsights(model, prompt, maxTokens);

        return {
          ...parsed,
          // The model does not see the trends data's partial flag, so its
          // score would come from zeroed inputs. Drop it rather than show it.
          opportunityAssessment: {
            ...parsed.opportunityAssessment,
            score: trendsData.partial ? null : parsed.opportunityAssessment.score,
          },
          wordCount: this.countWords(parsed),
          isFallback: false,
          partialData: trendsData.partial,
          model,
        };
      } catch (error) {
        lastError = error;
        console.error(`OpenAI request failed for model ${model}:`, error);
      }
    }

    console.error('All OpenAI models failed, using fallback:', lastError);

    const insights = buildFallbackInsights(
      niche,
      keyword,
      trendsData,
      this.calculateOpportunityScore(trendsData),
    );

    // Counted rather than hardcoded: an earlier version claimed a flat 500,
    // which anything reading the field would have believed.
    return { ...insights, wordCount: this.countWords(insights) };
  }

  /** One completion request, parsed. Throws so the caller can try the next model. */
  private async requestInsights(
    model: string,
    prompt: string,
    maxTokens: number,
  ): Promise<ModelInsights> {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content:
            'You are an expert market research analyst specializing in niche validation and business opportunity assessment. Provide detailed, actionable insights based on data.',
        },
        { role: 'user', content: prompt },
      ],
      // max_tokens is deprecated in the SDK and rejected by reasoning models.
      max_completion_tokens: maxTokens,
      temperature: 0.7,
      response_format: zodResponseFormat(modelInsightsSchema, 'market_insights'),
    });

    // choices can be empty; indexing it unguarded throws a TypeError that
    // would be indistinguishable from a network failure.
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parsed rather than cast: the schema is enforced by the API and re-checked
    // here, so a malformed payload throws instead of flowing through as a lie.
    return modelInsightsSchema.parse(JSON.parse(content));
  }

  /**
   * Calculate opportunity score, 0-100.
   *
   * Each signal is normalised to 0-1 and weighted, rather than added to a
   * base. An earlier version started at 50 and only ever added points, so the
   * worst possible niche still scored 58 and all-zero data scored 73 - the
   * score could never tell a user an idea was weak.
   *
   * Returns null when the trends data is partial: an upstream failure zeroes
   * every input, and scoring that produces a confident number from nothing.
   */
  private calculateOpportunityScore(
    trendsData: TrendsAnalysisResult,
  ): number | null {
    if (trendsData.partial) return null;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));

    const trend =
      trendsData.trend === 'rising' ? 1 : trendsData.trend === 'stable' ? 0.5 : 0;
    const interest = clamp(trendsData.averageInterest / 100);
    // -50% growth scores 0, +100% scores 1.
    const growth = clamp((trendsData.growthRate + 50) / 150);
    const queries = clamp(trendsData.relatedQueries.rising.length / 8);

    const weighted =
      0.3 * trend + 0.35 * interest + 0.25 * growth + 0.1 * queries;

    return Math.round(weighted * 100);
  }

  /**
   * Count words of prose in the insights.
   *
   * Walks the string values rather than counting JSON.stringify output, which
   * includes braces, quoted keys and punctuation and inflates the figure well
   * beyond anything a reader would call a word count.
   */
  private countWords(value: unknown): number {
    if (typeof value === 'string') {
      return value.split(/\s+/).filter((word) => word.length > 0).length;
    }

    if (Array.isArray(value)) {
      return value.reduce<number>((sum, item) => sum + this.countWords(item), 0);
    }

    if (value && typeof value === 'object') {
      return Object.values(value).reduce<number>(
        (sum, item) => sum + this.countWords(item),
        0,
      );
    }

    return 0;
  }
}
