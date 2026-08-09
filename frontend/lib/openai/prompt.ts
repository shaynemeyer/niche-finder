import type { TrendsAnalysisResult } from '@/lib/trends/types';

/**
 * Build prompt for OpenAI
 */
export function buildPrompt(
  niche: string,
  keyword: string,
  trendsData: TrendsAnalysisResult,
  wordLimit: number,
): string {
  return `
Analyze this niche/market opportunity and provide comprehensive insights in JSON format.

**Niche:** ${niche}
**Keyword:** ${keyword}

**Google Trends Data:**
- Average interest: ${trendsData.averageInterest}/100
- Growth rate: ${trendsData.growthRate}%
- Trend: ${trendsData.trend}
- Top related queries: ${trendsData.relatedQueries.top
    .slice(0, 5)
    .map((q) => q.query)
    .join(', ')}
- Rising queries: ${trendsData.relatedQueries.rising
    .slice(0, 5)
    .map((q) => q.query)
    .join(', ')}
- Top regions: ${trendsData.regionalInterest
    .slice(0, 3)
    .map((r) => r.geo)
    .join(', ')}

**Response Requirements:**
- Maximum ${wordLimit} words
- Return ONLY valid JSON (no markdown, no code blocks)
- Use this exact structure:

{
"summary": "2-3 paragraph executive summary of the market opportunity",
"opportunityAssessment": {
  "score": 75,
  "reasoning": "Explain the score",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"]
},
"targetAudience": {
  "demographics": "Age, location, income, education",
  "psychographics": "Values, interests, behaviors",
  "painPoints": ["pain point 1", "pain point 2", "pain point 3"]
},
"competitionAnalysis": {
  "level": "low | medium | high",
  "keyPlayers": ["competitor 1", "competitor 2"],
  "differentiationOpportunities": ["opportunity 1", "opportunity 2"]
},
"monetizationStrategies": {
  "primary": "Main revenue model",
  "secondary": ["alternative model 1", "alternative model 2"],
  "estimatedRevenuePotential": "$X - $Y per month/year"
},
"businessIdeas": [
  {
    "idea": "Specific business idea name",
    "description": "Detailed description of the business idea and how it addresses the pain points",
    "difficulty": "Easy | Medium | Hard",
    "timeToLaunch": "2-4 weeks | 1-3 months | 3-6 months",
    "estimatedCost": "$500-$2000 | $2000-$10000 | etc",
    "revenueModel": "How this business will make money",
    "targetMarket": "Who will buy this product/service"
  }
],
"gtmStrategy": {
  "phase1": ["action 1", "action 2"],
  "phase2": ["action 1", "action 2"],
  "phase3": ["action 1", "action 2"],
  "quickWins": ["quick win 1", "quick win 2"]
},
"risks": ["risk 1", "risk 2", "risk 3"],
"recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

**IMPORTANT for Business Ideas:**
- Generate 3-5 SPECIFIC, actionable business ideas based on the niche and pain points
- Make each idea unique and address different segments or approaches
- Be creative but realistic
- Include concrete details (pricing, features, target market)
- Range from easy/quick wins to more complex long-term ideas

Examples of good business ideas:
- "15-Minute Home Workout App" with specific features like "no equipment needed, office-friendly exercises"
- "AI-Powered Content Calendar Tool" with "automated topic suggestions based on trending keywords"
- "Eco-Friendly Fashion Subscription Box" with "curated sustainable brands, monthly delivery"

Provide realistic, data-driven insights. Be specific and actionable.
`;
}
