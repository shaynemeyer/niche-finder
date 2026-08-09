import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { listReports } from '@/lib/data/reports';
import { ReportStatus } from '@/lib/generated/prisma/client';

/** Bounds an unpaginated response; the dashboard shows far fewer. */
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

const REPORT_STATUSES = Object.values(ReportStatus);

function parseLimit(raw: string | null) {
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1) return DEFAULT_LIMIT;
  return Math.min(value, MAX_LIMIT);
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // An unknown status would otherwise be dropped and silently return every
  // report, which reads as "the filter is broken" at the call site.
  const status = searchParams.get('status');
  if (status !== null && !REPORT_STATUSES.includes(status as ReportStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${REPORT_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  // Same function the dashboard page calls, so the two cannot drift and a
  // backend move rewrites one module rather than both call sites.
  const reports = await listReports(session.user.id, {
    status: (status as ReportStatus | null) ?? undefined,
    limit: parseLimit(searchParams.get('limit')),
  });

  return NextResponse.json({ reports });
}
