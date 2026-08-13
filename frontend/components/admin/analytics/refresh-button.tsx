'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
      setLastUpdated(new Date());
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground">
        Updated {lastUpdated.toLocaleTimeString()}
      </span>
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isPending}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} />
        Refresh
      </button>
    </div>
  );
}
