'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Refreshes the dashboard while any report is still being analysed.
 *
 * The analysis runs in the background after /api/validate returns 202, so a
 * freshly submitted report renders as PENDING and would otherwise sit there
 * until the user reloaded the page.
 */
export function ReportStatusPoller({
  hasUnsettledReports,
  intervalMs = 2000,
}: {
  hasUnsettledReports: boolean;
  intervalMs?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!hasUnsettledReports) return;

    const id = setInterval(() => router.refresh(), intervalMs);
    return () => clearInterval(id);
  }, [hasUnsettledReports, intervalMs, router]);

  return null;
}
