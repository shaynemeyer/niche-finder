import googleTrends, {
  type InterestByRegionResponse,
  type InterestOverTimeResponse,
  type RelatedQueriesResponse,
} from 'google-trends-api';
import { sleep } from './utils';

export interface TrendsDataPoint {
  time: string;
  value: number;
}

export interface RelatedQuery {
  query: string;
  value: number;
}

export interface RegionalInterest {
  geo: string;
  value: number;
}

export interface TrendsAnalysisResult {
  keyword: string;
  timelineData: TrendsDataPoint[];
  averageInterest: number;
  growthRate: number;
  trend: 'rising' | 'declining' | 'stable';
  relatedQueries: {
    top: RelatedQuery[];
    rising: RelatedQuery[];
  };
  regionalInterest: RegionalInterest[];
  insights: string[];
  /**
   * True when at least one upstream call failed. Without it an outage is
   * indistinguishable from a keyword nobody searches for, and the report
   * would state "very low search volume" with confidence.
   */
  partial: boolean;
}

/** Pause after each upstream call; Google Trends throttles aggressively. */
const RATE_LIMIT_MS = 2000;

/** Regions kept from interestByRegion, highest interest first. */
const TOP_REGIONS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/// Google trends service for analyzing search trends.

export class GoogleTrendsService {
  /**
   * Get interest over time for a keyword
   */
  async getInterestOverTime(
    keyword: string,
    startTime: Date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // last 1 year ago
    endTime: Date = new Date(),
    geo: string = '',
  ): Promise<TrendsDataPoint[] | null> {
    try {
      const result = await googleTrends.interestOverTime({
        keyword,
        startTime,
        endTime,
        geo,
      });

      const data: InterestOverTimeResponse = JSON.parse(result);

      return (data?.default?.timelineData ?? []).map((point) => ({
        time: point.formattedTime,
        value: point.value[0],
      }));
    } catch (error) {
      console.error('Error fetching google trends data', error);
      return null;
    } finally {
      // In finally so a failure still backs off - an error is often the
      // rate limiter itself, which is when waiting matters most.
      await sleep(RATE_LIMIT_MS);
    }
  }

  /**
   * Get related queries for a keyword
   */
  async getRelatedQueries(
    keyword: string,
    startTime: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    endTime: Date = new Date(),
    geo: string = '',
  ): Promise<{ top: RelatedQuery[]; rising: RelatedQuery[] } | null> {
    try {
      const result = await googleTrends.relatedQueries({
        keyword,
        startTime,
        endTime,
        geo,
      });

      const data: RelatedQueriesResponse = JSON.parse(result);
      const rankedList = data?.default?.rankedList ?? [];

      // rankedList[0] is the top queries, rankedList[1] the rising ones.
      const toQueries = (index: number): RelatedQuery[] =>
        (rankedList[index]?.rankedKeyword ?? []).map((item) => ({
          query: item.query,
          value: item.value,
        }));

      return { top: toQueries(0), rising: toQueries(1) };
    } catch (error) {
      console.error('Error fetching related queries:', error);
      return null;
    } finally {
      await sleep(RATE_LIMIT_MS);
    }
  }

  /**
   * Get interest by region
   */
  async getInterestByRegion(
    keyword: string,
    startTime: Date = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    endTime: Date = new Date(),
    geo: string = '',
  ): Promise<RegionalInterest[] | null> {
    try {
      const result = await googleTrends.interestByRegion({
        keyword,
        startTime,
        endTime,
        geo,
      });

      const data: InterestByRegionResponse = JSON.parse(result);
      const regionalData = (data?.default?.geoMapData ?? []).map((region) => ({
        geo: region.geoName,
        value: region.value[0],
      }));

      return regionalData
        .sort((a, b) => b.value - a.value)
        .slice(0, TOP_REGIONS);
    } catch (error) {
      console.error('Error fetching regional interest:', error);
      return null;
    } finally {
      await sleep(RATE_LIMIT_MS);
    }
  }

  /**
   * Comprehensive analysis of a keyword
   */
  async analyzeKeyword(
    keyword: string,
    isPro: boolean = false,
  ): Promise<TrendsAnalysisResult> {
    // Pro gets 12 months, Free gets 3 months
    const monthsBack = isPro ? 12 : 3;
    const startTime = new Date(Date.now() - monthsBack * 30 * DAY_MS);
    const endTime = new Date();

    // Sequential rather than Promise.all: the calls share one upstream rate
    // limit, and firing them together is what triggers it.
    const timeline = await this.getInterestOverTime(keyword, startTime, endTime);
    const queries = await this.getRelatedQueries(keyword, startTime, endTime);
    const regions = await this.getInterestByRegion(keyword, startTime, endTime);

    const partial = timeline === null || queries === null || regions === null;

    const timelineData = timeline ?? [];
    const relatedQueries = queries ?? { top: [], rising: [] };
    const regionalInterest = regions ?? [];

    // Calculate average interest
    const averageInterest =
      timelineData.length > 0
        ? Math.round(
            timelineData.reduce((sum, point) => sum + point.value, 0) /
              timelineData.length,
          )
        : 0;

    // Calculate growth rate (compare first quarter to last quarter)
    const growthRate = this.calculateGrowthRate(timelineData);

    // Determine trend direction
    let trend: 'rising' | 'declining' | 'stable' = 'stable';
    if (growthRate > 10) trend = 'rising';
    else if (growthRate < -10) trend = 'declining';

    const insights = this.generateInsights({
      keyword,
      timelineData,
      averageInterest,
      growthRate,
      trend,
      relatedQueries,
      regionalInterest,
      partial,
    });

    return {
      keyword,
      timelineData,
      averageInterest,
      growthRate,
      trend,
      relatedQueries,
      regionalInterest,
      insights,
      partial,
    };
  }

  /**
   * Calculate growth rate between first and last quarters
   */
  private calculateGrowthRate(data: TrendsDataPoint[]): number {
    // Below 4 points quarterSize would floor to 0, and slice(-0) returns the
    // whole array rather than an empty one, making firstAvg NaN. This guard is
    // what prevents that - keep the two in step if the threshold changes.
    if (data.length < 4) return 0;

    const quarterSize = Math.floor(data.length / 4);
    const firstQuarter = data.slice(0, quarterSize);
    const lastQuarter = data.slice(-quarterSize);

    const firstAvg =
      firstQuarter.reduce((sum, point) => sum + point.value, 0) /
      firstQuarter.length;
    const lastAvg =
      lastQuarter.reduce((sum, point) => sum + point.value, 0) /
      lastQuarter.length;

    if (firstAvg === 0) return 0;

    return Math.round(((lastAvg - firstAvg) / firstAvg) * 100);
  }

  /**
   * Generate insights from trends data
   */
  private generateInsights(
    data: Omit<TrendsAnalysisResult, 'insights'>,
  ): string[] {
    const insights: string[] = [];

    // An upstream failure looks identical to a keyword nobody searches for,
    // so say so rather than asserting low demand from missing data.
    if (data.partial) {
      insights.push(
        'Some trends data could not be retrieved - these figures are incomplete',
      );
    }

    // Interest level insight
    if (data.averageInterest > 70) {
      insights.push(
        `High search interest (${data.averageInterest}/100) indicates strong market demand`,
      );
    } else if (data.averageInterest > 40) {
      insights.push(
        `Moderate search interest (${data.averageInterest}/100) shows decent market potential`,
      );
    } else if (data.averageInterest > 0) {
      insights.push(
        `Low search interest (${data.averageInterest}/100) suggests niche or emerging market`,
      );
    } else if (!data.partial) {
      insights.push(
        'Very low search volume - consider validating through other channels',
      );
    }

    // Growth trend insight
    if (data.trend === 'rising' && data.growthRate > 0) {
      insights.push(
        `${data.growthRate}% growth indicates rising interest - good timing for market entry`,
      );
    } else if (data.trend === 'declining') {
      insights.push(
        `${Math.abs(data.growthRate)}% decline in interest - market may be saturating or shifting`,
      );
    } else {
      insights.push(
        'Stable interest over time suggests established market with consistent demand',
      );
    }

    // Related queries insight
    if (data.relatedQueries.rising.length > 5) {
      insights.push(
        `${data.relatedQueries.rising.length} rising related queries show expanding market interest`,
      );
    }

    // Regional insight
    if (data.regionalInterest.length > 0) {
      const topRegion = data.regionalInterest[0];
      insights.push(
        `Highest interest in ${topRegion.geo} with ${topRegion.value}/100 score`,
      );
    }

    // Seasonality detection (basic)
    if (data.timelineData.length >= 12) {
      const variance = this.calculateVariance(
        data.timelineData.map((d) => d.value),
      );
      if (variance > 500) {
        insights.push(
          'High variance detected - possible seasonal trends or cyclical demand',
        );
      }
    }

    return insights;
  }

  /**
   * Calculate variance for seasonality detection
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    const variance =
      squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return variance;
  }
}
