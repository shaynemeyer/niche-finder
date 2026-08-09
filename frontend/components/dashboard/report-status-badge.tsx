import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { ReportStatus } from '@/lib/generated/prisma/client';

const statusStyles: Record<ReportStatus, string> = {
  PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  PROCESSING: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
  COMPLETED: 'bg-muted text-muted-foreground',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

const statusLabels: Record<ReportStatus, string> = {
  PENDING: 'Queued',
  PROCESSING: 'Analyzing',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export function isRunning(status: ReportStatus) {
  return status === 'PENDING' || status === 'PROCESSING';
}

/** Spins while the analysis is still running, so an active report reads as busy. */
export function ReportStatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        statusStyles[status],
      )}
    >
      {isRunning(status) && <Loader2 className="size-3 animate-spin" />}
      {statusLabels[status]}
    </span>
  );
}

const viabilityStyles: Record<string, string> = {
  HIGH: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200',
  MEDIUM:
    'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  LOW: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
};

export function ViabilityBadge({ rating }: { rating: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        viabilityStyles[rating] ?? 'bg-muted text-muted-foreground',
      )}
    >
      {/* "HIGH" alone reads as a score; the noun says what is high. */}
      {rating} Viability
    </span>
  );
}
