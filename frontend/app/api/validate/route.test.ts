import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const isProUser = vi.fn();
const claimMonthlyValidation = vi.fn();
const createPendingReport = vi.fn();
const markReportProcessing = vi.fn();
const markReportFailed = vi.fn();
const completeReport = vi.fn();
const analyzeKeyword = vi.fn();
const generateMarketInsights = vi.fn();

// after() defers work until the response is sent. Running the callback inline
// keeps the assertions on what the analysis writes, not on scheduling.
vi.mock('next/server', async () => {
  const actual = await vi.importActual<typeof import('next/server')>(
    'next/server',
  );
  return {
    ...actual,
    after: (task: () => Promise<void> | void) => afterTasks.push(task),
  };
});

vi.mock('@/lib/auth', () => ({ auth: () => authMock() }));

// Mocked at the data layer rather than at Prisma: the handler owns auth,
// input validation, orchestration and the response. Query shapes belong to
// lib/data and are covered by lib/data/reports.test.ts.
vi.mock('@/lib/data/reports', () => ({
  isProUser: (...args: unknown[]) => isProUser(...args),
  claimMonthlyValidation: (...args: unknown[]) =>
    claimMonthlyValidation(...args),
  createPendingReport: (...args: unknown[]) => createPendingReport(...args),
  markReportProcessing: (...args: unknown[]) => markReportProcessing(...args),
  markReportFailed: (...args: unknown[]) => markReportFailed(...args),
  completeReport: (...args: unknown[]) => completeReport(...args),
}));

vi.mock('@/lib/trends', () => ({
  GoogleTrendsService: class {
    analyzeKeyword = (...args: unknown[]) => analyzeKeyword(...args);
  },
}));

vi.mock('@/lib/openai', () => ({
  OpenAIService: class {
    generateMarketInsights = (...args: unknown[]) =>
      generateMarketInsights(...args);
  },
}));

const afterTasks: Array<() => Promise<void> | void> = [];

import { POST } from './route';

function postRequest(body: unknown) {
  return new Request('http://localhost:3000/api/validate', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = { niche: 'AI tools for writers', keyword: 'ai writing' };

function buildInsights(overrides: Record<string, unknown> = {}) {
  return {
    summary: 'A summary.',
    opportunityAssessment: { score: 80, reasoning: '', strengths: [], weaknesses: [] },
    competitionAnalysis: { level: 'low', keyPlayers: [], differentiationOpportunities: [] },
    monetizationStrategies: { primary: 'SaaS', secondary: [], estimatedRevenuePotential: '' },
    gtmStrategy: { phase1: [], phase2: [], phase3: [], quickWins: [] },
    isFallback: false,
    partialData: false,
    ...overrides,
  };
}

/** Runs the analysis that POST scheduled via after(). */
async function runScheduledAnalysis() {
  for (const task of afterTasks) await task();
}

/** The analysis payload handed to completeReport. */
function storedAnalysis() {
  return completeReport.mock.calls[0]?.[1];
}

beforeEach(() => {
  vi.clearAllMocks();
  afterTasks.length = 0;

  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  isProUser.mockResolvedValue(false);
  claimMonthlyValidation.mockResolvedValue(true);
  createPendingReport.mockResolvedValue({ id: 'report-1' });
  markReportProcessing.mockResolvedValue({});
  markReportFailed.mockResolvedValue({});
  completeReport.mockResolvedValue({});
  analyzeKeyword.mockResolvedValue({ partial: false });
  generateMarketInsights.mockResolvedValue(buildInsights());
});

describe('POST /api/validate', () => {
  it('returns 202 with the report id before the analysis runs', async () => {
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(202);
    await expect(response.json()).resolves.toEqual({
      id: 'report-1',
      status: 'PENDING',
    });
    // The response is sent before any analysis has happened.
    expect(analyzeKeyword).not.toHaveBeenCalled();
  });

  it('rejects an unauthenticated request', async () => {
    authMock.mockResolvedValue(null);

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(401);
    expect(createPendingReport).not.toHaveBeenCalled();
  });

  it('rejects a body that fails the schema', async () => {
    const response = await POST(postRequest({ niche: 'ab', keyword: '' }));

    expect(response.status).toBe(400);
    expect(createPendingReport).not.toHaveBeenCalled();
  });

  it('creates the report for the session user', async () => {
    await POST(postRequest(validBody));

    expect(createPendingReport).toHaveBeenCalledWith(
      'user-1',
      validBody.niche,
      validBody.keyword,
    );
  });
});

describe('free-tier quota', () => {
  it('claims the slot before the analysis runs', async () => {
    await POST(postRequest(validBody));

    // Claiming after the analysis would let two concurrent requests both read
    // an under-limit count and both proceed.
    expect(claimMonthlyValidation).toHaveBeenCalledWith('user-1');
    expect(analyzeKeyword).not.toHaveBeenCalled();
  });

  it('refuses a request that could not claim a slot', async () => {
    claimMonthlyValidation.mockResolvedValue(false);

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(403);
    expect(createPendingReport).not.toHaveBeenCalled();
  });

  it('proceeds when a slot was claimed', async () => {
    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(202);
    expect(createPendingReport).toHaveBeenCalledOnce();
  });

  it('does not claim a slot for a pro user', async () => {
    isProUser.mockResolvedValue(true);

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(202);
    expect(claimMonthlyValidation).not.toHaveBeenCalled();
  });
});

describe('analysis', () => {
  it('stores the completed report with its score and rating', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(completeReport).toHaveBeenCalledWith(
      'report-1',
      expect.objectContaining({
        overallScore: 80,
        viabilityRating: 'HIGH',
        summaryText: 'A summary.',
      }),
    );
  });

  it('marks the report PROCESSING before calling upstream', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(markReportProcessing).toHaveBeenCalledWith('report-1');
    expect(markReportProcessing.mock.invocationCallOrder[0]).toBeLessThan(
      analyzeKeyword.mock.invocationCallOrder[0],
    );
  });

  it('splits competition, monetization and GTM into their own columns', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    const data = storedAnalysis();
    expect(data.competitionData).toMatchObject({ level: 'low' });
    expect(data.monetizationIdeas).toMatchObject({ primary: 'SaaS' });
    expect(data.gtmStrategy).toMatchObject({ quickWins: [] });
  });

  it('passes the pro flag through to both services', async () => {
    isProUser.mockResolvedValue(true);

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(analyzeKeyword).toHaveBeenCalledWith(validBody.keyword, true);
    expect(generateMarketInsights.mock.calls[0][3]).toBe(true);
  });

  it('marks the report FAILED when the analysis throws', async () => {
    analyzeKeyword.mockRejectedValue(new Error('trends down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    // Nothing is listening once the 202 is sent, so the failure has to land
    // on the row or the report sits in PROCESSING forever.
    expect(markReportFailed).toHaveBeenCalledWith('report-1');
    expect(completeReport).not.toHaveBeenCalled();
  });
});

describe('withholding the score', () => {
  it('stores no score when the insights are the fallback template', async () => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({ isFallback: true }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    // The fallback score is a heuristic over trends data, not analysis, and
    // would render identically to a real one.
    expect(storedAnalysis().overallScore).toBeNull();
    expect(storedAnalysis().viabilityRating).toBeNull();
  });

  it('stores no score when the model withheld one', async () => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({
        opportunityAssessment: { score: null, reasoning: '', strengths: [], weaknesses: [] },
      }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(storedAnalysis().overallScore).toBeNull();
    expect(storedAnalysis().viabilityRating).toBeNull();
  });

  it('still completes the report so the trends half is not lost', async () => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({ isFallback: true }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(completeReport).toHaveBeenCalledOnce();
    expect(markReportFailed).not.toHaveBeenCalled();
  });
});

describe('viability rating boundaries', () => {
  it.each([
    [70, 'HIGH'],
    [69, 'MEDIUM'],
    [40, 'MEDIUM'],
    [39, 'LOW'],
    [0, 'LOW'],
  ])('scores %i as %s', async (score, expected) => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({
        opportunityAssessment: { score, reasoning: '', strengths: [], weaknesses: [] },
      }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(storedAnalysis().viabilityRating).toBe(expected);
  });
});
