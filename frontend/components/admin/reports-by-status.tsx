import { Activity, CheckCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { ReportStatus } from '@/lib/generated/prisma/client';

type StatusRow = {
  status: ReportStatus;
  label: string;
  icon: LucideIcon;
  className: string;
};

// Status colours are semantic rather than theme tokens, so each needs its own
// dark variant to stay legible on a dark card.
const rows: StatusRow[] = [
  {
    status: 'COMPLETED',
    label: 'Completed',
    icon: CheckCircle,
    className: 'text-green-600 dark:text-green-400',
  },
  {
    status: 'PROCESSING',
    label: 'Processing',
    icon: Activity,
    className: 'text-blue-600 dark:text-blue-400',
  },
  {
    status: 'PENDING',
    label: 'Pending',
    icon: Activity,
    className: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    status: 'FAILED',
    label: 'Failed',
    icon: Activity,
    className: 'text-red-600 dark:text-red-400',
  },
];

export function ReportsByStatus({
  counts,
}: {
  counts: Record<ReportStatus, number>;
}) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">
          Reports by Status
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Current state of all validation reports
        </p>
      </div>
      <div className="px-6 py-4">
        <div className="space-y-4">
          {rows.map(({ status, label, icon: Icon, className }) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${className}`} />
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
              </div>
              <div className={`text-2xl font-bold ${className}`}>
                {counts[status]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
