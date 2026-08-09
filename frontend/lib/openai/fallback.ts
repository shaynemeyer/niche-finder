import type { TrendsAnalysisResult } from '@/lib/trends/types';
import type { AIMarketInsights } from '@/lib/validations/insights';

/**
 * Generate fallback insights if OpenAI fails
 */
export function buildFallbackInsights(
  niche: string,
  keyword: string,
  trendsData: TrendsAnalysisResult,
  score: number | null,
): Omit<AIMarketInsights, 'wordCount'> {
  // With partial data every trends figure is zero, so stating them as fact
  // would invent a finding out of an outage.
  const summary = trendsData.partial
    ? `AI analysis for "${keyword}" is unavailable, and the Google Trends data behind it is incomplete. Treat this report as a starting point rather than a validation.`
    : `Based on the analysis of "${keyword}", this niche shows ${score !== null && score > 60 ? 'promising' : 'moderate'} potential. Google Trends shows ${trendsData.trend} interest with ${trendsData.averageInterest}/100 average search volume.`;

  const insights: Omit<AIMarketInsights, 'wordCount'> = {
    summary,
    opportunityAssessment: {
      score,
      reasoning: trendsData.partial
        ? 'Not scored: the trends data behind this report is incomplete.'
        : `Score based on search trends (${trendsData.trend}) and average interest level (${trendsData.averageInterest}/100).`,
      strengths: trendsData.partial
        ? []
        : [
            // A declining trend is not a strength; the earlier version
            // reported it as "Stable market demand".
            ...(trendsData.trend === 'rising'
              ? ['Growing market interest']
              : trendsData.trend === 'stable'
                ? ['Stable market demand']
                : []),
            `Average search interest: ${trendsData.averageInterest}/100`,
          ],
      weaknesses: trendsData.partial
        ? ['Trends data incomplete - figures below are not reliable']
        : [
            ...(trendsData.trend === 'declining'
              ? ['Search interest is declining']
              : []),
            trendsData.averageInterest < 40
              ? 'Limited search volume'
              : 'Potential competition from search volume',
            'Manual research needed for deeper validation',
          ],
    },
    targetAudience: {
      demographics: 'Active online searchers interested in this niche',
      psychographics: 'Problem-aware individuals seeking solutions',
      painPoints: [
        'Finding reliable information',
        'Understanding best practices',
        'Implementing effective solutions',
        'Staying updated with trends',
        'Cost-effective alternatives',
      ],
    },
    competitionAnalysis: {
      level:
        trendsData.averageInterest > 60
          ? 'high'
          : trendsData.averageInterest > 30
            ? 'medium'
            : 'low',
      keyPlayers: ['Research required for specific competitors'],
      differentiationOpportunities: [
        'Focus on specific pain points',
        'Target underserved segments',
        'Provide unique value proposition',
      ],
    },
    monetizationStrategies: {
      primary: 'SaaS subscription model',
      secondary: [
        'One-time digital products',
        'Consulting services',
        'Affiliate partnerships',
      ],
      estimatedRevenuePotential: 'Requires further market validation',
    },
    businessIdeas: [
      {
        idea: `${niche} - SaaS Solution`,
        description: `Create a software-as-a-service platform that addresses key challenges in the ${keyword} market. Focus on solving common problems with an innovative approach.`,
        difficulty: 'Medium',
        timeToLaunch: '2-4 months',
        estimatedCost: '$5,000-$15,000',
        revenueModel: 'Monthly subscription ($29-99/month)',
        targetMarket: `${keyword} enthusiasts and professionals`,
      },
      {
        idea: `${niche} - Educational Course`,
        description: `Develop a comprehensive online course teaching people how to succeed in ${keyword}. Include video lessons, worksheets, and community support.`,
        difficulty: 'Easy',
        timeToLaunch: '4-8 weeks',
        estimatedCost: '$1,000-$3,000',
        revenueModel: 'One-time purchase ($49-199)',
        targetMarket: 'Beginners and intermediate users',
      },
      {
        idea: `${niche} - Content & Community`,
        description: `Build a content-driven platform with blog, newsletter, and community forum focused on ${keyword}. Monetize through ads, sponsorships, and premium membership.`,
        difficulty: 'Easy',
        timeToLaunch: '2-6 weeks',
        estimatedCost: '$500-$2,000',
        revenueModel: 'Ads, sponsorships, premium membership',
        targetMarket: 'Content consumers and community seekers',
      },
    ],
    gtmStrategy: {
      phase1: [
        'Build MVP based on market research',
        'Engage in relevant online communities',
        'Create content addressing pain points',
        'Set up analytics and tracking',
      ],
      phase2: [
        'Launch beta to early adopters',
        'Collect user feedback',
        'Refine product-market fit',
        'Start paid marketing campaigns',
      ],
      phase3: [
        'Scale marketing efforts',
        'Expand feature set',
        'Build partnerships',
        'Optimize conversion funnel',
      ],
      quickWins: [
        'Create valuable content',
        'Build email list',
        'Engage with target audience online',
        'Launch MVP or beta version',
      ],
    },
    risks: [
      'Market size may be smaller than estimated',
      'Competition from established players',
      'Changing market dynamics',
    ],
    recommendations: [
      'Validate with direct customer interviews',
      'Build in public to test demand',
      'Start with a focused niche segment',
    ],
    isFallback: true,
    partialData: trendsData.partial,
    model: null,
  };

  // wordCount is deliberately absent: the caller counts it, so this stays a
  // pure template with no dependency on the service.
  return insights;
}
