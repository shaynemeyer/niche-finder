import Link from 'next/link';
import { Clock } from 'lucide-react';

import type { PendingPaymentRequest } from '@/lib/data/payments';

export function PendingPaymentNotice({
  paymentRequest,
}: {
  paymentRequest: PendingPaymentRequest;
}) {
  const submittedOn = paymentRequest.createdAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-900 rounded-lg">
      <div className="px-6 py-4">
        <div className="flex items-start gap-3">
          <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
              Payment Request Pending
            </h3>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
              Submitted on {submittedOn}. Your payment request is awaiting
              admin approval. You&apos;ll be automatically upgraded to Pro
              once your payment is approved.
            </p>
            <Link
              href="/dashboard/settings"
              className="text-sm text-yellow-700 dark:text-yellow-300 underline mt-2 inline-block"
            >
              View payment status →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
