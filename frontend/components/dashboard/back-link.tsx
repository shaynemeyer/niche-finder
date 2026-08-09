'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * Returns to the previous page.
 *
 * history.back() is exact — it handles origins no server-rendered link could
 * know about, including arrivals from outside the app. It cannot name its
 * destination, and on a cold arrival (a shared link opened in a new tab) there
 * is nothing to return to; detecting that case is not possible with the
 * signals a browser exposes, so the label stays generic.
 */
export function BackLink() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <ArrowLeft className="size-4" />
      Back
    </button>
  );
}
