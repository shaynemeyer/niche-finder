import { CheckCircle, Clock, Eye, Loader2, XCircle } from 'lucide-react';

import type { PaymentStatus } from '@/lib/generated/prisma/client';

type PaymentRequestCardProps = {
  name: string;
  email: string;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
  invoiceUrl: string;
  rejectedReason?: string | null;
  approvedOn?: string | null;
  onApprove?: () => void;
  isApproving?: boolean;
  onReject?: () => void;
  isRejecting?: boolean;
};

// Status colours are semantic rather than theme tokens, so each needs its own
// dark variant to stay legible on a dark card. See PendingPaymentNotice for
// the same pattern applied to a single-status banner.
const STATUS_BADGE: Record<
  PaymentStatus,
  { label: string; icon: typeof Clock; className: string }
> = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-muted text-muted-foreground',
  },
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle,
    className: 'bg-green-600 dark:bg-green-500 text-white',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    className:
      'bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300',
  },
};

export function PaymentRequestCard({
  name,
  email,
  status,
  transactionId,
  createdAt,
  invoiceUrl,
  rejectedReason,
  approvedOn,
  onApprove,
  isApproving = false,
  onReject,
  isRejecting = false,
}: PaymentRequestCardProps) {
  const badge = STATUS_BADGE[status];
  const BadgeIcon = badge.icon;

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}
          >
            <BadgeIcon className="w-3 h-3" />
            {badge.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground/80">
              Transaction ID
            </label>
            <p className="text-sm text-foreground mt-1 font-mono">
              {transactionId}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground/80">
              Submitted On
            </label>
            <p className="text-sm text-foreground mt-1">{createdAt}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground/80 mb-2 block">
            Payment Proof
          </label>
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-muted hover:bg-muted/70 text-foreground rounded-md transition"
          >
            <Eye className="w-4 h-4" />
            View Invoice
          </a>
        </div>

        {status === 'REJECTED' && rejectedReason && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg p-3">
            <p className="text-sm font-medium text-red-900 dark:text-red-100">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-800 dark:text-red-200 mt-1">
              {rejectedReason}
            </p>
          </div>
        )}

        {status === 'APPROVED' && approvedOn && (
          <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-200">
              Approved on {approvedOn}
            </p>
          </div>
        )}

        {status === 'PENDING' && (
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onApprove}
              disabled={isApproving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isApproving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isApproving ? 'Processing...' : 'Approve & Upgrade to Pro'}
            </button>
            <button
              type="button"
              onClick={onReject}
              disabled={isRejecting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRejecting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              {isRejecting ? 'Processing...' : 'Reject'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
