import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import { auth } from '@/lib/auth';
import { getReport } from '@/lib/data/reports';
import { isRunning } from '@/components/dashboard/report-status-badge';
import { BackLink } from '@/components/dashboard/back-link';
import { ReportStatusPoller } from '@/components/dashboard/report-status-poller';
import { ReportActions } from '@/components/dashboard/reports/report-actions';
import { ReportProcessing } from '@/components/dashboard/reports/report-processing';
import { ReportFallbackNotice } from '@/components/dashboard/reports/report-fallback-notice';
import { ReportHero } from '@/components/dashboard/reports/report-hero';
import { ReportKeyMetrics } from '@/components/dashboard/reports/report-key-metrics';
import { ReportOpportunity } from '@/components/dashboard/reports/report-opportunity';
import { ReportSearchTrends } from '@/components/dashboard/reports/report-search-trends';
import { ReportAudience } from '@/components/dashboard/reports/report-audience';
import { ReportCompetition } from '@/components/dashboard/reports/report-competition';
import { ReportMonetization } from '@/components/dashboard/reports/report-monetization';
import { ReportBusinessIdeas } from '@/components/dashboard/reports/report-business-ideas';
import { ReportGtmStrategy } from '@/components/dashboard/reports/report-gtm-strategy';
import { aiMarketInsightsSchema } from '@/lib/validations/insights';
import { trendsAnalysisResultSchema } from '@/lib/validations/trends';

export default async function ReportDetailPage(
  props: PageProps<'/dashboard/reports/[id]'>,
) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect('/signin');
  }

  const { id } = await props.params;

  // getReport scopes by userId: a report id is guessable enough that finding
  // it by id alone would let anyone read another account's report.
  const report = await getReport(id, session.user.id);

  if (!report) {
    notFound();
  }

  if (isRunning(report.status)) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <BackLink />
        <ReportProcessing
          niche={report.niche}
          keyword={report.keyword}
          status={report.status}
        />
        <ReportStatusPoller hasUnsettledReports />
      </div>
    );
  }

  const trendsParsed = trendsAnalysisResultSchema.safeParse(report.trendsData);
  const insightsParsed = aiMarketInsightsSchema.safeParse(report.aiInsights);

  if (
    report.status === 'FAILED' ||
    !trendsParsed.success ||
    !insightsParsed.success
  ) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <BackLink />
        <div className="bg-card rounded-lg border border-border shadow-sm py-12 px-6 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {report.niche}
          </h1>
          <p className="text-muted-foreground">
            This report could not be completed. Try validating this niche
            again.
          </p>
        </div>
      </div>
    );
  }

  const trends = trendsParsed.data;
  const insights = insightsParsed.data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <BackLink />
        <ReportActions
          niche={report.niche}
          keyword={report.keyword}
          status={report.status}
          overallScore={report.overallScore}
          viabilityRating={report.viabilityRating}
          trends={trends}
          insights={insights}
        />
      </div>

      <ReportFallbackNotice
        isFallback={insights.isFallback}
        partialData={insights.partialData}
      />

      <ReportHero
        niche={report.niche}
        keyword={report.keyword}
        overallScore={report.overallScore}
        viabilityRating={report.viabilityRating}
        createdAt={report.createdAt}
      />

      <ReportKeyMetrics trends={trends} />
      <ReportOpportunity insights={insights} />
      <ReportSearchTrends trends={trends} />
      <ReportAudience targetAudience={insights.targetAudience} />
      <ReportCompetition competitionAnalysis={insights.competitionAnalysis} />
      <ReportMonetization
        monetizationStrategies={insights.monetizationStrategies}
      />
      <ReportBusinessIdeas businessIdeas={insights.businessIdeas} />
      <ReportGtmStrategy gtmStrategy={insights.gtmStrategy} />

      <div className="flex items-center justify-between py-6 border-t border-border">
        <Link
          href="/dashboard/reports"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Reports
        </Link>
        <ReportActions
          niche={report.niche}
          keyword={report.keyword}
          status={report.status}
          overallScore={report.overallScore}
          viabilityRating={report.viabilityRating}
          trends={trends}
          insights={insights}
        />
      </div>
    </div>
  );
}
