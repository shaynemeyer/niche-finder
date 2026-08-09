import { beforeEach, describe, expect, it, vi } from 'vitest';

const create = vi.fn();

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create } };
  },
}));

import { OpenAIService } from './index';
import type { TrendsAnalysisResult } from '@/lib/trends/types';

function trends(
  overrides: Partial<TrendsAnalysisResult> = {},
): TrendsAnalysisResult {
  return {
    keyword: 'ai writing',
    timelineData: [],
    averageInterest: 50,
    growthRate: 10,
    trend: 'stable',
    relatedQueries: { top: [], rising: [] },
    regionalInterest: [],
    insights: [],
    partial: false,
    ...overrides,
  };
}

/**
 * A complete model payload. The API is constrained to this schema and the
 * result is parsed, not cast, so a partial fixture is rejected - which is the
 * point of the schema, but means fixtures have to be whole.
 */
function modelPayload(overrides: Record<string, unknown> = {}) {
  return JSON.stringify({
    summary: 'A summary',
    opportunityAssessment: {
      score: 70,
      reasoning: 'Because',
      strengths: [],
      weaknesses: [],
    },
    targetAudience: {
      demographics: 'd',
      psychographics: 'p',
      painPoints: [],
    },
    competitionAnalysis: {
      level: 'medium',
      keyPlayers: [],
      differentiationOpportunities: [],
    },
    monetizationStrategies: {
      primary: 'subs',
      secondary: [],
      estimatedRevenuePotential: 'tbd',
    },
    businessIdeas: [],
    gtmStrategy: { phase1: [], phase2: [], phase3: [], quickWins: [] },
    risks: [],
    recommendations: [],
    ...overrides,
  });
}

/** Wraps a payload in the completions response shape. */
function completion(content: string) {
  return { choices: [{ message: { content } }] };
}

function risingQueries(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    query: `q${i}`,
    value: 100 - i,
  }));
}

/** Reaches the private scorer through the fallback path, which surfaces it. */
async function scoreFor(data: TrendsAnalysisResult): Promise<number | null> {
  create.mockRejectedValueOnce(new Error('offline'));
  const service = new OpenAIService();
  const result = await service.generateMarketInsights('n', 'k', data);
  return result.opportunityAssessment.score;
}

describe('OpenAIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  describe('constructor', () => {
    it('refuses to construct without an API key', () => {
      delete process.env.OPENAI_API_KEY;

      expect(() => new OpenAIService()).toThrow(/OPENAI_API_KEY/);
    });
  });

  describe('opportunity score', () => {
    it('uses the full range rather than bottoming out above half', async () => {
      // The regression this guards: a base of 50 with only additive branches
      // meant the worst possible niche still scored 58/100.
      const worst = await scoreFor(
        trends({
          trend: 'declining',
          averageInterest: 0,
          growthRate: -99,
          relatedQueries: { top: [], rising: [] },
        }),
      );

      expect(worst).toBe(0);
    });

    it('awards 100 only to a uniformly strong niche', async () => {
      const best = await scoreFor(
        trends({
          trend: 'rising',
          averageInterest: 100,
          growthRate: 150,
          relatedQueries: { top: [], rising: risingQueries(10) },
        }),
      );

      expect(best).toBe(100);
    });

    it('separates a weak niche from a strong one', async () => {
      const weak = await scoreFor(
        trends({ trend: 'declining', averageInterest: 10, growthRate: -30 }),
      );
      const strong = await scoreFor(
        trends({
          trend: 'rising',
          averageInterest: 80,
          growthRate: 60,
          relatedQueries: { top: [], rising: risingQueries(6) },
        }),
      );

      expect(weak).toBeLessThan(40);
      expect(strong).toBeGreaterThan(75);
    });

    it('refuses to score partial data instead of scoring zeros', async () => {
      // All-zero inputs previously scored 73/100 - a confident recommendation
      // derived from an outage.
      const score = await scoreFor(
        trends({
          partial: true,
          averageInterest: 0,
          growthRate: 0,
          trend: 'stable',
        }),
      );

      expect(score).toBeNull();
    });
  });

  describe('partial trends data', () => {
    it('does not state zeroed figures as fact', async () => {
      create.mockRejectedValueOnce(new Error('offline'));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights(
        'n',
        'k',
        trends({ partial: true, averageInterest: 0 }),
      );

      expect(result.partialData).toBe(true);
      expect(result.summary).not.toContain('0/100');
      expect(result.summary).toMatch(/incomplete/i);
      expect(result.opportunityAssessment.strengths).toEqual([]);
    });

    it('drops the model score when the inputs were incomplete', async () => {
      create.mockResolvedValueOnce({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: 'Looks great',
                opportunityAssessment: { score: 88, strengths: [] },
              }),
            },
          },
        ],
      });
      const service = new OpenAIService();

      const result = await service.generateMarketInsights(
        'n',
        'k',
        trends({ partial: true }),
      );

      // The model never sees the partial flag, so its score came from zeros.
      expect(result.opportunityAssessment.score).toBeNull();
      expect(result.partialData).toBe(true);
    });
  });

  describe('fallback', () => {
    it('marks fallback output so it is not passed off as AI analysis', async () => {
      create.mockRejectedValueOnce(new Error('rate limited'));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.isFallback).toBe(true);
      expect(result.businessIdeas.length).toBeGreaterThan(0);
    });

    it('marks model output as not fallback', async () => {
      create.mockResolvedValueOnce(completion(modelPayload()));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.isFallback).toBe(false);
      expect(result.opportunityAssessment.score).toBe(70);
    });

    it('falls back when the payload does not match the schema', async () => {
      // json_schema constrains the API, but a malformed payload must still be
      // caught here rather than cast through as valid insights.
      create.mockResolvedValueOnce(
        completion(JSON.stringify({ summary: 'missing everything else' })),
      );
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.isFallback).toBe(true);
    });

    it('falls back when choices is empty rather than throwing', async () => {
      create.mockResolvedValueOnce({ choices: [] });
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.isFallback).toBe(true);
    });

    it('falls back when the response is not valid JSON', async () => {
      // A response truncated at max_tokens arrives as unparseable JSON.
      create.mockResolvedValueOnce({
        choices: [{ message: { content: '{"summary":"cut off mid' } }],
      });
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.isFallback).toBe(true);
    });

    it('does not call a declining trend a strength', async () => {
      create.mockRejectedValueOnce(new Error('offline'));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights(
        'n',
        'k',
        trends({ trend: 'declining' }),
      );

      const { strengths, weaknesses } = result.opportunityAssessment;
      expect(strengths.join(' ')).not.toMatch(/stable market demand/i);
      expect(weaknesses.join(' ')).toMatch(/declining/i);
    });
  });

  describe('wordCount', () => {
    it('counts prose, not JSON syntax', async () => {
      // Every string in the payload contributes; the fixture's own prose is
      // counted too, so assert the delta rather than an absolute number.
      const base = await (async () => {
        create.mockResolvedValueOnce(completion(modelPayload()));
        const svc = new OpenAIService();
        return (await svc.generateMarketInsights('n', 'k', trends())).wordCount;
      })();

      create.mockResolvedValueOnce(
        completion(
          modelPayload({
            summary: 'one two three four five',
            risks: ['six seven'],
          }),
        ),
      );
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      // summary goes "A summary" (2) -> 5 words (+3), risks [] -> one 2-word
      // entry (+2). Counting JSON.stringify output would inflate this with
      // braces and quoted keys instead.
      expect(result.wordCount).toBe(base + 5);
    });

    it('computes the fallback word count rather than hardcoding it', async () => {
      create.mockRejectedValueOnce(new Error('offline'));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.wordCount).toBeGreaterThan(0);
      expect(result.wordCount).not.toBe(500);
    });
  });

  describe('model configuration', () => {
    const ok = completion(modelPayload());

    beforeEach(() => {
      delete process.env.OPENAI_MODEL;
      delete process.env.OPENAI_FALLBACK_MODELS;
    });

    it('defaults to a stable model rather than a preview alias', async () => {
      create.mockResolvedValueOnce(ok);
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      // A `-preview` alias can change under you, altering output and cost.
      const model = create.mock.calls[0][0].model as string;
      expect(model).not.toContain('preview');
      expect(model).toBe('gpt-5-nano');
    });

    it('honours OPENAI_MODEL', async () => {
      process.env.OPENAI_MODEL = 'gpt-4o';
      create.mockResolvedValueOnce(ok);
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      expect(create.mock.calls[0][0].model).toBe('gpt-4o');
    });

    it('reports which model answered', async () => {
      process.env.OPENAI_MODEL = 'gpt-4o';
      create.mockResolvedValueOnce(ok);
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(result.model).toBe('gpt-4o');
    });

    it('tries the next model when the primary fails', async () => {
      process.env.OPENAI_MODEL = 'broken-model';
      process.env.OPENAI_FALLBACK_MODELS = 'backup-model';
      create
        .mockRejectedValueOnce(new Error('model_not_found'))
        .mockResolvedValueOnce(ok);
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(create.mock.calls.map((c) => c[0].model)).toEqual([
        'broken-model',
        'backup-model',
      ]);
      expect(result.isFallback).toBe(false);
      expect(result.model).toBe('backup-model');
    });

    it('accepts a comma-separated fallback list and trims it', async () => {
      process.env.OPENAI_MODEL = 'a';
      process.env.OPENAI_FALLBACK_MODELS = ' b , , c ';
      create
        .mockRejectedValueOnce(new Error('down'))
        .mockRejectedValueOnce(new Error('down'))
        .mockResolvedValueOnce(ok);
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      expect(create.mock.calls.map((c) => c[0].model)).toEqual(['a', 'b', 'c']);
    });

    it('does not retry the same model twice when it is also listed as a fallback', async () => {
      process.env.OPENAI_MODEL = 'same';
      process.env.OPENAI_FALLBACK_MODELS = 'same';
      create.mockRejectedValue(new Error('down'));
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      expect(create).toHaveBeenCalledTimes(1);
    });

    it('falls back to the template only after every model fails', async () => {
      process.env.OPENAI_MODEL = 'a';
      process.env.OPENAI_FALLBACK_MODELS = 'b';
      create.mockRejectedValue(new Error('down'));
      const service = new OpenAIService();

      const result = await service.generateMarketInsights('n', 'k', trends());

      expect(create).toHaveBeenCalledTimes(2);
      expect(result.isFallback).toBe(true);
      expect(result.model).toBeNull();
    });
  });

  describe('tier limits', () => {
    it('asks for a larger budget for pro users', async () => {
      create.mockResolvedValue(completion(modelPayload()));
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends(), false);
      const freeTokens = create.mock.calls[0][0].max_completion_tokens;

      await service.generateMarketInsights('n', 'k', trends(), true);
      const proTokens = create.mock.calls[1][0].max_completion_tokens;

      expect(proTokens).toBeGreaterThan(freeTokens);
    });

    it('sends max_completion_tokens, not the deprecated max_tokens', async () => {
      // max_tokens is deprecated in the SDK and rejected by reasoning models.
      create.mockResolvedValueOnce(completion(modelPayload()));
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      const params = create.mock.calls[0][0];
      expect(params.max_completion_tokens).toBeGreaterThan(0);
      expect(params.max_tokens).toBeUndefined();
    });

    it('constrains the response with a json schema, not json_object', async () => {
      create.mockResolvedValueOnce(completion(modelPayload()));
      const service = new OpenAIService();

      await service.generateMarketInsights('n', 'k', trends());

      // json_object guarantees valid JSON but not this shape.
      expect(create.mock.calls[0][0].response_format.type).toBe('json_schema');
    });
  });
});
