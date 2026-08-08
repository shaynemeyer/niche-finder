import Link from 'next/link';
import { CheckCircle, Sparkles } from 'lucide-react';
import type { PlanType } from '@/lib/generated/prisma/client';

type SubscriptionStatusCardProps = {
  planType: PlanType;
  used: number;
  limit: number | null;
};

export function SubscriptionStatusCard({
  planType,
  used,
  limit,
}: SubscriptionStatusCardProps) {
  const isPro = planType === 'PRO';
  // limit is null on PRO (unlimited), so a percentage only exists on FREE
  const percentage = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const limitReached = limit !== null && used >= limit;

  return (
    <div className="rounded-lg border border-purple-200 dark:border-purple-900 bg-card shadow-sm">
      <div className="px-6 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-600 text-white">
                  ACTIVE
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {limit === null
                  ? `${used} validations used this month`
                  : `${used} of ${limit} validations used this month`}
              </p>
            </div>
          </div>

          {!isPro && (
            <Link href="/dashboard/settings">
              <button className="px-4 py-2 text-sm font-medium text-white rounded-lg bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
                Upgrade to Pro
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="px-6 pb-4">
        {isPro ? (
          <div className="p-4 bg-muted/50 rounded-lg border border-purple-100 dark:border-purple-900">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-100">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="font-medium">Unlimited access to all features</p>
            </div>
            <p className="text-sm text-purple-700 dark:text-purple-300 mt-1 ml-7">
              Enjoy unlimited niche validations with advanced AI insights
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground font-medium">
                  Usage Progress
                </span>
                <span className="text-foreground font-semibold">
                  {percentage}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    limitReached ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {used === 0 ? 'No validations' : `${used} used`}
              </p>
            </div>

            {limitReached && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  Monthly limit reached. Upgrade to Pro for unlimited
                  validations.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
