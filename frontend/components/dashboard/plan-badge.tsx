import Link from 'next/link';
import { Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

/**
 * Plan status in the sidebar.
 *
 * On the free tier it doubles as the upgrade CTA — the usage figure is the
 * reason to upgrade, so the two belong together rather than in a full-width
 * card above the fold.
 */
export function PlanBadge({
  isPro,
  used,
  limit,
  onNavigate,
}: {
  isPro: boolean;
  used: number;
  limit: number | null;
  onNavigate?: () => void;
}) {
  const percentage =
    limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const limitReached = limit !== null && used >= limit;

  return (
    <div className="shrink-0 border-t border-border p-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-purple-600 dark:text-purple-400" />
        <span className="text-sm font-medium text-foreground">
          {isPro ? 'Pro' : 'Free'}
        </span>
        {/* Only the free tier gets a figure. A bare count on PRO has no
            reference point — see docs/todos.md for what to show instead. */}
        {!isPro && (
          <span className="ml-auto text-xs text-muted-foreground">
            {used}/{limit}
          </span>
        )}
      </div>

      {!isPro && (
        <>
          <div
            role="progressbar"
            aria-label="Monthly validation usage"
            aria-valuenow={used}
            aria-valuemax={limit ?? undefined}
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
          >
            <div
              className={cn(
                'h-full rounded-full transition-all',
                limitReached ? 'bg-red-600' : 'bg-blue-600',
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>

          <Link
            href="/dashboard/settings"
            onClick={onNavigate}
            className="mt-3 flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-medium text-white rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
          >
            Upgrade to Pro
          </Link>
        </>
      )}
    </div>
  );
}
