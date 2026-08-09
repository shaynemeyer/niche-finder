import { beforeEach, describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const subscriptionFindUnique = vi.fn();
const usageUpsert = vi.fn();
const usageUpdate = vi.fn();
const reportCreate = vi.fn();
const reportUpdate = vi.fn();
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

vi.mock('@/lib/prisma', () => ({
  prisma: {
    subscription: {
      findUnique: (...args: unknown[]) => subscriptionFindUnique(...args),
    },
    usageLog: {
      upsert: (...args: unknown[]) => usageUpsert(...args),
      update: (...args: unknown[]) => usageUpdate(...args),
    },
    report: {
      create: (...args: unknown[]) => reportCreate(...args),
      update: (...args: unknown[]) => reportUpdate(...args),
    },
  },
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

/** The data payload of the update that stored the finished analysis. */
function completedUpdate() {
  const call = reportUpdate.mock.calls.find(
    ([arg]) => arg.data.status === 'COMPLETED',
  );
  return call?.[0].data;
}

beforeEach(() => {
  vi.clearAllMocks();
  afterTasks.length = 0;

  authMock.mockResolvedValue({ user: { id: 'user-1' } });
  subscriptionFindUnique.mockResolvedValue({ planType: 'FREE', isActive: true });
  usageUpsert.mockResolvedValue({ validationCount: 1 });
  reportCreate.mockResolvedValue({ id: 'report-1' });
  reportUpdate.mockResolvedValue({});
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
    expect(reportCreate).not.toHaveBeenCalled();
  });

  it('rejects a body that fails the schema', async () => {
    const response = await POST(postRequest({ niche: 'ab', keyword: '' }));

    expect(response.status).toBe(400);
    expect(reportCreate).not.toHaveBeenCalled();
  });

  it('creates the report as PENDING', async () => {
    await POST(postRequest(validBody));

    expect(reportCreate.mock.calls[0][0].data).toMatchObject({
      userId: 'user-1',
      niche: validBody.niche,
      keyword: validBody.keyword,
      status: 'PENDING',
    });
  });
});

describe('free-tier quota', () => {
  it('claims the slot before the analysis runs', async () => {
    await POST(postRequest(validBody));

    // Incrementing after the analysis would let two concurrent requests both
    // read an under-limit count and both proceed.
    expect(usageUpsert).toHaveBeenCalledOnce();
    expect(analyzeKeyword).not.toHaveBeenCalled();
  });

  it('refuses a request that exceeds the limit and releases the slot', async () => {
    usageUpsert.mockResolvedValue({ validationCount: 4 });

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(403);
    expect(usageUpdate.mock.calls[0][0].data).toEqual({
      validationCount: { decrement: 1 },
    });
    expect(reportCreate).not.toHaveBeenCalled();
  });

  it('allows the last request inside the limit', async () => {
    usageUpsert.mockResolvedValue({ validationCount: 3 });

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(202);
    expect(usageUpdate).not.toHaveBeenCalled();
  });

  it('does not touch the usage log for an active PRO subscription', async () => {
    subscriptionFindUnique.mockResolvedValue({ planType: 'PRO', isActive: true });

    const response = await POST(postRequest(validBody));

    expect(response.status).toBe(202);
    expect(usageUpsert).not.toHaveBeenCalled();
  });

  it('treats an inactive PRO subscription as free tier', async () => {
    subscriptionFindUnique.mockResolvedValue({ planType: 'PRO', isActive: false });

    await POST(postRequest(validBody));

    expect(usageUpsert).toHaveBeenCalledOnce();
  });
});

describe('analysis', () => {
  it('stores the completed report with its score and rating', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(completedUpdate()).toMatchObject({
      status: 'COMPLETED',
      overallScore: 80,
      viabilityRating: 'HIGH',
      summaryText: 'A summary.',
    });
  });

  it('marks the report PROCESSING before calling upstream', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(reportUpdate.mock.calls[0][0].data).toEqual({ status: 'PROCESSING' });
  });

  it('splits competition, monetization and GTM into their own columns', async () => {
    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    const data = completedUpdate();
    expect(data.competitionData).toMatchObject({ level: 'low' });
    expect(data.monetizationIdeas).toMatchObject({ primary: 'SaaS' });
    expect(data.gtmStrategy).toMatchObject({ quickWins: [] });
  });

  it('passes the pro flag through to both services', async () => {
    subscriptionFindUnique.mockResolvedValue({ planType: 'PRO', isActive: true });

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
    const last = reportUpdate.mock.calls.at(-1)?.[0].data;
    expect(last).toEqual({ status: 'FAILED' });
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
    const data = completedUpdate();
    expect(data.overallScore).toBeNull();
    expect(data.viabilityRating).toBeNull();
  });

  it('stores no score when the model withheld one', async () => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({
        opportunityAssessment: { score: null, reasoning: '', strengths: [], weaknesses: [] },
      }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    const data = completedUpdate();
    expect(data.overallScore).toBeNull();
    expect(data.viabilityRating).toBeNull();
  });

  it('still completes the report so the trends half is not lost', async () => {
    generateMarketInsights.mockResolvedValue(
      buildInsights({ isFallback: true }),
    );

    await POST(postRequest(validBody));
    await runScheduledAnalysis();

    expect(completedUpdate().status).toBe('COMPLETED');
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

    expect(completedUpdate().viabilityRating).toBe(expected);
  });
});
