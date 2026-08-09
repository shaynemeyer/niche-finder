import { after, NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import {
  claimMonthlyValidation,
  completeReport,
  createPendingReport,
  isProUser,
  markReportFailed,
  markReportProcessing,
} from '@/lib/data/reports';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';
import { GoogleTrendsService } from '@/lib/trends';
import { OpenAIService } from '@/lib/openai';
import { validateNicheSchema } from '@/lib/validations/report';
import { ReportStatus } from '@/lib/generated/prisma/client';

/**
 * Trends alone takes ~6s (three sequential calls, 2s apart) and the OpenAI
 * call follows it, so the default serverless timeout is not enough.
 */
export const maxDuration = 60;

function viabilityFromScore(score: number | null) {
  if (score === null) return null;
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const body = await request.json().catch(() => null);
  const parsed = validateNicheSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a niche and a keyword.' },
      { status: 400 },
    );
  }
  const { niche, keyword } = parsed.data;

  const isPro = await isProUser(userId);

  // Claimed before the analysis runs, not after: incrementing afterwards lets
  // concurrent requests both read an under-limit count and both proceed.
  if (!isPro && !(await claimMonthlyValidation(userId))) {
    return NextResponse.json(
      {
        error: `Free plan allows ${FREE_TIER_MONTHLY_LIMIT} validations per month. Upgrade to Pro for unlimited reports.`,
      },
      { status: 403 },
    );
  }

  const report = await createPendingReport(userId, niche, keyword);

  // Scheduled with after() rather than a bare un-awaited call: the analysis
  // takes ~10s, and a floating promise can be frozen the moment the response
  // is sent, leaving the report stuck PENDING forever.
  after(() => runAnalysis(report.id, niche, keyword, isPro));

  return NextResponse.json(
    { id: report.id, status: ReportStatus.PENDING },
    { status: 202 },
  );
}

/** Runs after the response is sent; owns the report's terminal status. */
async function runAnalysis(
  reportId: string,
  niche: string,
  keyword: string,
  isPro: boolean,
) {
  try {
    await markReportProcessing(reportId);

    const trends = await new GoogleTrendsService().analyzeKeyword(
      keyword,
      isPro,
    );
    const insights = await new OpenAIService().generateMarketInsights(
      niche,
      keyword,
      trends,
      isPro,
    );

    // Null when the trends data was incomplete — the model is told to withhold
    // a score rather than invent one, so `partial` must not become a number.
    //
    // Withheld again when the insights are the fallback template: that score is
    // a heuristic over trends data, not analysis, and storing it would render
    // identically to a real one. `isFallback` stays readable inside aiInsights.
    const score = insights.isFallback
      ? null
      : insights.opportunityAssessment.score;

    await completeReport(reportId, {
      trendsData: trends,
      aiInsights: insights,
      competitionData: insights.competitionAnalysis,
      monetizationIdeas: insights.monetizationStrategies,
      gtmStrategy: insights.gtmStrategy,
      overallScore: score,
      viabilityRating: viabilityFromScore(score),
      summaryText: insights.summary,
    });
  } catch (error) {
    // Nothing is listening now that the response has been sent, so a failure
    // has to be recorded on the row or the report never leaves PROCESSING.
    console.error(`Validation failed for report ${reportId}:`, error);
    await markReportFailed(reportId);
  }
}
