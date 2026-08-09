import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { getMonthlyUsage, isProUser } from '@/lib/data/reports';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';

/**
 * This month's validation quota for the caller.
 *
 * Nothing in the app calls this yet — the dashboard reads the same data
 * through lib/data in a server component. It exists so every read the
 * frontend needs is available over HTTP, which is what lets the backend move
 * without the frontend changing. See project-overview.md.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [used, isPro] = await Promise.all([
    getMonthlyUsage(session.user.id),
    isProUser(session.user.id),
  ]);

  return NextResponse.json({
    used,
    // null means unlimited. Percentages and "limit reached" are the caller's
    // to derive — SubscriptionStatusCard already does exactly that.
    limit: isPro ? null : FREE_TIER_MONTHLY_LIMIT,
  });
}
