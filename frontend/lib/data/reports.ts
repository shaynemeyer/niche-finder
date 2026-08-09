/**
 * Data access for reports and usage.
 *
 * The single place that talks to Prisma for these. Pages and route handlers
 * both call these functions rather than querying directly, so moving the
 * backend elsewhere means rewriting this module's internals rather than every
 * call site.
 *
 * Every function takes `userId` explicitly: the ownership scope is part of the
 * signature rather than something a caller has to remember to apply.
 */
import { prisma } from '@/lib/prisma';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';
import {
  ReportStatus,
  type Prisma,
} from '@/lib/generated/prisma/client';

/** The list shape. JSONB payloads are excluded — large, and never rendered in a list. */
const listSelect = {
  id: true,
  niche: true,
  keyword: true,
  status: true,
  overallScore: true,
  viabilityRating: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type ReportListItem = {
  id: string;
  niche: string;
  keyword: string;
  status: ReportStatus;
  overallScore: number | null;
  viabilityRating: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function listReports(
  userId: string,
  options: { status?: ReportStatus; limit?: number } = {},
): Promise<ReportListItem[]> {
  return prisma.report.findMany({
    where: {
      userId,
      ...(options.status ? { status: options.status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: options.limit ?? 20,
    select: listSelect,
  });
}

/**
 * Scoped by userId rather than looked up on id alone: a report id is guessable
 * enough that an unscoped read would expose another account's report. Returns
 * null for both missing and foreign reports so callers cannot tell them apart.
 */
export function getReport(id: string, userId: string) {
  return prisma.report.findFirst({
    where: { id, userId },
    select: { id: true, niche: true, keyword: true, status: true },
  });
}

/** Validations used in the current calendar month; 0 when no row exists yet. */
export async function getMonthlyUsage(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const usage = await prisma.usageLog.findUnique({
    where: {
      userId_month_year: {
        userId,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    },
    select: { validationCount: true },
  });

  return usage?.validationCount ?? 0;
}

/** True only for an active PRO subscription. */
export async function isProUser(userId: string): Promise<boolean> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { planType: true, isActive: true },
  });

  return subscription?.planType === 'PRO' && subscription.isActive;
}

/**
 * Claims one validation against the monthly free-tier quota.
 *
 * The increment happens first and is rolled back if it breaches the limit:
 * reading the count and incrementing afterwards lets two concurrent requests
 * both see an under-limit value and both proceed. Returns false when the
 * caller is over quota, having left the count as it found it.
 */
export async function claimMonthlyValidation(
  userId: string,
  now: Date = new Date(),
): Promise<boolean> {
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const where = { userId_month_year: { userId, month, year } };

  const usage = await prisma.usageLog.upsert({
    where,
    create: { userId, month, year, validationCount: 1 },
    update: { validationCount: { increment: 1 } },
    select: { validationCount: true },
  });

  if (usage.validationCount <= FREE_TIER_MONTHLY_LIMIT) return true;

  await prisma.usageLog.update({
    where,
    data: { validationCount: { decrement: 1 } },
  });
  return false;
}

export function createPendingReport(
  userId: string,
  niche: string,
  keyword: string,
) {
  return prisma.report.create({
    data: { userId, niche, keyword, status: ReportStatus.PENDING },
    select: { id: true },
  });
}

export function markReportProcessing(id: string) {
  return prisma.report.update({
    where: { id },
    data: { status: ReportStatus.PROCESSING },
  });
}

export function markReportFailed(id: string) {
  return prisma.report.update({
    where: { id },
    data: { status: ReportStatus.FAILED },
  });
}

/** The analysis payload, already split across its columns by the caller. */
export type CompletedAnalysis = {
  trendsData: unknown;
  aiInsights: unknown;
  competitionData: unknown;
  monetizationIdeas: unknown;
  gtmStrategy: unknown;
  overallScore: number | null;
  viabilityRating: string | null;
  summaryText: string;
};

export function completeReport(id: string, analysis: CompletedAnalysis) {
  return prisma.report.update({
    where: { id },
    data: {
      status: ReportStatus.COMPLETED,
      // Prisma's JSON input type requires an index signature, which an
      // `interface` never has. These are plain JSON-safe objects.
      trendsData: analysis.trendsData as Prisma.InputJsonValue,
      aiInsights: analysis.aiInsights as Prisma.InputJsonValue,
      competitionData: analysis.competitionData as Prisma.InputJsonValue,
      monetizationIdeas: analysis.monetizationIdeas as Prisma.InputJsonValue,
      gtmStrategy: analysis.gtmStrategy as Prisma.InputJsonValue,
      overallScore: analysis.overallScore,
      viabilityRating: analysis.viabilityRating,
      summaryText: analysis.summaryText,
    },
  });
}
