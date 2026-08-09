import Link from 'next/link';
import { Filter } from 'lucide-react';

import { cn } from '@/lib/utils';
import { ReportStatus } from '@/lib/generated/prisma/client';

const FILTERS = [
  { label: 'All', status: undefined },
  { label: 'Completed', status: ReportStatus.COMPLETED },
  { label: 'Processing', status: ReportStatus.PROCESSING },
  { label: 'Pending', status: ReportStatus.PENDING },
  { label: 'Failed', status: ReportStatus.FAILED },
] as const;

/**
 * Links rather than buttons: the page is a server component and the filter is
 * a URL parameter, so this needs no client state and survives a refresh or a
 * shared link.
 */
export function ReportFilter({ active }: { active?: ReportStatus }) {
  return (
    <div className="bg-card rounded-lg border border-border shadow-sm px-6 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground mr-1">
          Filter:
        </span>

        {FILTERS.map(({ label, status }) => {
          const isActive = active === status;
          return (
            <Link
              key={label}
              href={status ? `/dashboard/reports?status=${status}` : '/dashboard/reports'}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'px-3 py-1 text-sm rounded-lg transition',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
