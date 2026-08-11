'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, Clock, CreditCard, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { BankTransferForm } from '@/components/dashboard/settings/bank-transfer-form';
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants';
import type { PaymentRequestListItem } from '@/lib/data/payments';
import type { PlanType } from '@/lib/generated/prisma/client';

type SubscriptionSectionProps = {
  subscription: {
    planType: PlanType;
    isActive: boolean;
    endDate: Date | null;
  } | null;
  paymentRequests: PaymentRequestListItem[];
};

const statusBadge: Record<
  PaymentRequestListItem['status'],
  React.ReactNode
> = {
  PENDING: (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
      <Clock className="w-3 h-3" />
      Pending
    </span>
  ),
  APPROVED: (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-600 text-white">
      <CheckCircle className="w-3 h-3" />
      Approved
    </span>
  ),
  REJECTED: (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-200">
      <XCircle className="w-3 h-3" />
      Rejected
    </span>
  ),
};

export function SubscriptionSection({
  subscription,
  paymentRequests,
}: SubscriptionSectionProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const [showBankTransferForm, setShowBankTransferForm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const planType = subscription?.planType ?? 'FREE';
  const isPro = planType === 'PRO' && (subscription?.isActive ?? false);
  const hasPending = paymentRequests.some((r) => r.status === 'PENDING');
  const hasApproved = paymentRequests.some((r) => r.status === 'APPROVED');

  // Subscription plan is baked into the JWT and only re-read from the
  // database on a session update trigger, so a plain router.refresh() alone
  // would keep showing the stale plan after an admin approves payment.
  async function handleRefreshStatus() {
    setIsRefreshing(true);
    try {
      const updated = await updateSession();
      const nowPro =
        updated?.user?.subscription?.planType === 'PRO' &&
        updated.user.subscription.isActive &&
        !isPro;

      toast.success(nowPro ? "You're now on Pro!" : 'Status refreshed');
      router.refresh();
    } catch {
      toast.error('Could not refresh status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="text-lg font-semibold text-foreground">
            Subscription
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your subscription and billing
        </p>
      </div>
      <div className="px-6 py-4 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground">
            Current Plan
          </label>
          <div className="flex items-center gap-2 mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-200">
              {planType}
            </span>
            <span className="text-sm text-muted-foreground">
              {planType === 'PRO'
                ? 'Unlimited validations'
                : `${FREE_TIER_MONTHLY_LIMIT} validations/month`}
            </span>
          </div>
        </div>

        {hasPending ? (
          <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Payment Pending
                  </h4>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    Your payment request is awaiting admin approval. You&apos;ll
                    be upgraded to Pro once approved.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        ) : null}

        {hasApproved && !isPro ? (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Payment Approved!
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mt-1">
                    Your payment has been approved. Click &quot;Refresh
                    Status&quot; to update your plan to Pro.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRefreshStatus}
                disabled={isRefreshing}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
              </button>
            </div>
          </div>
        ) : null}

        {isPro ? (
          <>
            <p className="text-sm text-muted-foreground">
              Your Pro plan is active
              {subscription?.endDate
                ? ` until ${subscription.endDate.toLocaleDateString()}`
                : ''}
            </p>

            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Pro Plan Benefits
              </h4>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>✓ Unlimited niche validations</li>
                <li>✓ Deep AI-powered analysis</li>
                <li>✓ Export reports to PDF</li>
                <li>✓ Priority support</li>
                <li>✓ Trending niches alerts</li>
              </ul>
            </div>
            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              Downgrade to Free
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Upgrade to Pro for unlimited validations, deep analysis, and
              export features
            </p>
            <div className="bg-muted border border-border rounded-lg p-4">
              <h4 className="font-semibold text-foreground mb-2">
                Pro Plan Includes:
              </h4>
              <ul className="text-sm text-foreground space-y-1">
                <li>✓ Unlimited niche validations</li>
                <li>✓ Deep AI-powered analysis</li>
                <li>✓ Export reports to PDF</li>
                <li>✓ Priority support</li>
                <li>✓ Trending niches alerts</li>
              </ul>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-lg font-bold text-foreground">$29/month</p>
              </div>
            </div>

            {!showBankTransferForm ? (
              <button
                type="button"
                onClick={() => setShowBankTransferForm(true)}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all"
              >
                Upgrade via Bank Transfer
              </button>
            ) : (
              <BankTransferForm
                onCancel={() => setShowBankTransferForm(false)}
                onSubmitted={() => {
                  setShowBankTransferForm(false);
                  router.refresh();
                }}
              />
            )}
          </>
        )}

        {paymentRequests.length > 0 ? (
          <div className="border-t border-border pt-4">
            <h4 className="font-semibold text-foreground mb-3">
              Payment Requests
            </h4>
            <div className="space-y-2">
              {paymentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      Transaction: {request.transactionId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge[request.status]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
