import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mocked before importing the service: the module is called at construction
// time and the real one makes network requests.
vi.mock('google-trends-api', () => ({
  default: {
    interestOverTime: vi.fn(),
    relatedQueries: vi.fn(),
    interestByRegion: vi.fn(),
  },
}));

// The service sleeps 2s after every call; without this the suite takes 18s.
vi.mock('./utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./utils')>()),
  sleep: vi.fn(() => Promise.resolve()),
}));

import googleTrends from 'google-trends-api';
import { GoogleTrendsService } from './googleTrends';

const mocked = vi.mocked(googleTrends);

/** Builds an interestOverTime payload with the given weekly values. */
function timelinePayload(values: number[]) {
  return JSON.stringify({
    default: {
      timelineData: values.map((value, i) => ({
        time: String(i),
        formattedTime: `Week ${i}`,
        formattedAxisTime: `Week ${i}`,
        value: [value],
        hasData: [true],
        formattedValue: [String(value)],
      })),
      averages: [],
    },
  });
}

function relatedQueriesPayload(top: string[], rising: string[]) {
  const toRanked = (queries: string[]) => ({
    rankedKeyword: queries.map((query, i) => ({
      query,
      value: 100 - i,
      formattedValue: String(100 - i),
      hasData: true,
      link: '/trends/explore',
    })),
  });
  return JSON.stringify({
    default: { rankedList: [toRanked(top), toRanked(rising)] },
  });
}

function regionPayload(regions: { name: string; value: number }[]) {
  return JSON.stringify({
    default: {
      geoMapData: regions.map((r) => ({
        geoCode: r.name.slice(0, 2).toUpperCase(),
        geoName: r.name,
        value: [r.value],
        formattedValue: [String(r.value)],
        maxValueIndex: 0,
        hasData: [true],
      })),
    },
  });
}

/** Every call succeeds, with the timeline values supplied. */
function mockAllSucceed(values: number[]) {
  mocked.interestOverTime.mockResolvedValue(timelinePayload(values));
  mocked.relatedQueries.mockResolvedValue(
    relatedQueriesPayload(['a'], ['b', 'c']),
  );
  mocked.interestByRegion.mockResolvedValue(
    regionPayload([
      { name: 'Ireland', value: 90 },
      { name: 'Norway', value: 40 },
    ]),
  );
}

describe('GoogleTrendsService', () => {
  let service: GoogleTrendsService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new GoogleTrendsService();
  });

  describe('getInterestOverTime', () => {
    it('maps the timeline payload to points', async () => {
      mocked.interestOverTime.mockResolvedValue(timelinePayload([10, 20]));

      expect(await service.getInterestOverTime('x')).toEqual([
        { time: 'Week 0', value: 10 },
        { time: 'Week 1', value: 20 },
      ]);
    });

    it('returns null when the request fails, not an empty array', async () => {
      // A failure has to be distinguishable from a keyword with no data.
      mocked.interestOverTime.mockRejectedValue(new Error('429 Too Many'));

      expect(await service.getInterestOverTime('x')).toBeNull();
    });

    it('returns an empty array when the payload has no timeline', async () => {
      mocked.interestOverTime.mockResolvedValue(
        JSON.stringify({ default: {} }),
      );

      expect(await service.getInterestOverTime('x')).toEqual([]);
    });
  });

  describe('getRelatedQueries', () => {
    it('splits rankedList into top and rising', async () => {
      mocked.relatedQueries.mockResolvedValue(
        relatedQueriesPayload(['seo tools'], ['ai seo', 'seo 2026']),
      );

      const result = await service.getRelatedQueries('x');

      expect(result?.top.map((q) => q.query)).toEqual(['seo tools']);
      expect(result?.rising.map((q) => q.query)).toEqual(['ai seo', 'seo 2026']);
    });

    it('returns null when the request fails', async () => {
      mocked.relatedQueries.mockRejectedValue(new Error('boom'));

      expect(await service.getRelatedQueries('x')).toBeNull();
    });
  });

  describe('getInterestByRegion', () => {
    it('sorts regions by value and caps the list at 10', async () => {
      const many = Array.from({ length: 15 }, (_, i) => ({
        name: `Region ${i}`,
        value: i, // ascending, so sorting must reverse it
      }));
      mocked.interestByRegion.mockResolvedValue(regionPayload(many));

      const result = await service.getInterestByRegion('x');

      expect(result).toHaveLength(10);
      expect(result?.[0]).toEqual({ geo: 'Region 14', value: 14 });
      expect(result?.[9]).toEqual({ geo: 'Region 5', value: 5 });
    });

    it('returns null when the request fails', async () => {
      mocked.interestByRegion.mockRejectedValue(new Error('boom'));

      expect(await service.getInterestByRegion('x')).toBeNull();
    });
  });

  describe('analyzeKeyword', () => {
    it('averages interest and reports a rising trend on growth', async () => {
      // First quarter averages 10, last quarter 40: +300%.
      mockAllSucceed([10, 10, 20, 30, 40, 40, 40, 40]);

      const result = await service.analyzeKeyword('x');

      expect(result.averageInterest).toBe(29);
      expect(result.growthRate).toBeGreaterThan(10);
      expect(result.trend).toBe('rising');
      expect(result.partial).toBe(false);
    });

    it('reports a declining trend when interest falls', async () => {
      mockAllSucceed([80, 80, 60, 40, 20, 10, 10, 10]);

      const result = await service.analyzeKeyword('x');

      expect(result.growthRate).toBeLessThan(-10);
      expect(result.trend).toBe('declining');
    });

    it('reports stable when the change is within ten percent', async () => {
      mockAllSucceed([50, 50, 50, 50, 50, 50, 50, 52]);

      const result = await service.analyzeKeyword('x');

      expect(result.trend).toBe('stable');
    });

    it('flags partial data when a call fails and does not claim low demand', async () => {
      // The regression this guards: an outage previously produced a confident
      // "very low search volume" verdict indistinguishable from real data.
      mockAllSucceed([50, 50, 50, 50]);
      mocked.interestOverTime.mockRejectedValue(new Error('429'));

      const result = await service.analyzeKeyword('x');

      expect(result.partial).toBe(true);
      expect(result.timelineData).toEqual([]);
      expect(result.averageInterest).toBe(0);
      expect(result.insights).toContain(
        'Some trends data could not be retrieved - these figures are incomplete',
      );
      expect(result.insights.join(' ')).not.toContain('Very low search volume');
    });

    it('claims low search volume only when the data is complete', async () => {
      mockAllSucceed([0, 0, 0, 0]);

      const result = await service.analyzeKeyword('x');

      expect(result.partial).toBe(false);
      expect(result.insights.join(' ')).toContain('Very low search volume');
    });

    it('survives every upstream call failing', async () => {
      mocked.interestOverTime.mockRejectedValue(new Error('down'));
      mocked.relatedQueries.mockRejectedValue(new Error('down'));
      mocked.interestByRegion.mockRejectedValue(new Error('down'));

      const result = await service.analyzeKeyword('x');

      expect(result.partial).toBe(true);
      expect(result.relatedQueries).toEqual({ top: [], rising: [] });
      expect(result.regionalInterest).toEqual([]);
      expect(result.growthRate).toBe(0);
    });

    it('returns a real number for series too short to split into quarters', async () => {
      // Below 4 points quarterSize floors to 0 and slice(-0) returns the whole
      // array, so firstAvg would be NaN. The length guard is what stops it;
      // this pins the boundary in case the threshold is ever lowered.
      for (const values of [[10], [10, 20], [10, 20, 30]]) {
        vi.clearAllMocks();
        mockAllSucceed(values);

        const result = await service.analyzeKeyword('x');

        expect(Number.isNaN(result.growthRate)).toBe(false);
        expect(result.growthRate).toBe(0);
      }
    });

    it('computes growth once there are four points to split', async () => {
      mockAllSucceed([10, 20, 30, 40]);

      const result = await service.analyzeKeyword('x');

      expect(result.growthRate).toBe(300);
    });

    it('requests a longer window for pro users', async () => {
      mockAllSucceed([10, 20, 30, 40]);

      await service.analyzeKeyword('x', true);
      const proStart = mocked.interestOverTime.mock.calls[0][0]
        .startTime as Date;

      vi.clearAllMocks();
      mockAllSucceed([10, 20, 30, 40]);

      await service.analyzeKeyword('x', false);
      const freeStart = mocked.interestOverTime.mock.calls[0][0]
        .startTime as Date;

      expect(proStart.getTime()).toBeLessThan(freeStart.getTime());
    });
  });
});
