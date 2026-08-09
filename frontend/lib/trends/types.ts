/**
 * Result shapes returned by GoogleTrendsService.
 *
 * Separate from the service so consumers - the OpenAI insight modules, and
 * anything rendering a report - can type against a result without importing a
 * module that makes network calls.
 */

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
