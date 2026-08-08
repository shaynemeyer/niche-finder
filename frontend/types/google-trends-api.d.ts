/**
 * google-trends-api ships no type declarations and has no @types package on
 * npm, so `strict` mode rejects the import (TS7016). These cover the methods
 * and options documented in the package README.
 *
 * Every method resolves to a JSON *string*, not an object — the caller has to
 * JSON.parse the result.
 */
declare module 'google-trends-api' {
  /**
   * Shapes of the parsed payloads. Field names were read off real responses,
   * not the README, which does not document them.
   */
  export interface TimelinePoint {
    time: string;
    formattedTime: string;
    formattedAxisTime: string;
    value: number[];
    hasData: boolean[];
    formattedValue: string[];
  }

  export interface InterestOverTimeResponse {
    default: {
      timelineData: TimelinePoint[];
      averages: number[];
    };
  }

  export interface GeoMapPoint {
    geoCode: string;
    geoName: string;
    value: number[];
    formattedValue: string[];
    maxValueIndex: number;
    hasData: boolean[];
  }

  export interface InterestByRegionResponse {
    default: {
      geoMapData: GeoMapPoint[];
    };
  }

  export interface RankedKeyword {
    query: string;
    value: number;
    formattedValue: string;
    hasData: boolean;
    link: string;
  }

  export interface RelatedQueriesResponse {
    default: {
      rankedList: { rankedKeyword: RankedKeyword[] }[];
    };
  }

  interface TrendsOptions {
    keyword?: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    resolution?: 'COUNTRY' | 'REGION' | 'CITY' | 'DMA';
    granularTimeResolution?: boolean;
    property?: '' | 'images' | 'news' | 'youtube' | 'froogle';
  }

  interface DailyTrendsOptions {
    trendDate?: Date;
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: string;
  }

  interface RealTimeTrendsOptions {
    geo: string;
    hl?: string;
    timezone?: number;
    category?: string;
  }

  export function interestOverTime(options: TrendsOptions): Promise<string>;
  export function interestByRegion(options: TrendsOptions): Promise<string>;
  export function relatedQueries(options: TrendsOptions): Promise<string>;
  export function relatedTopics(options: TrendsOptions): Promise<string>;
  export function autoComplete(options: TrendsOptions): Promise<string>;
  export function dailyTrends(options: DailyTrendsOptions): Promise<string>;
  export function realTimeTrends(
    options: RealTimeTrendsOptions,
  ): Promise<string>;

  const googleTrends: {
    interestOverTime: typeof interestOverTime;
    interestByRegion: typeof interestByRegion;
    relatedQueries: typeof relatedQueries;
    relatedTopics: typeof relatedTopics;
    autoComplete: typeof autoComplete;
    dailyTrends: typeof dailyTrends;
    realTimeTrends: typeof realTimeTrends;
  };

  export default googleTrends;
}
