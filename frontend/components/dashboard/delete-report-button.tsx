'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

/**
 * Deleting a report is irreversible and the button sits beside a link on a row
 * people scan quickly, so it confirms in a dialog that names the report.
 */
export function DeleteReportButton({
  reportId,
  niche,
}: {
  reportId: string;
  niche: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    let response: Response;
    try {
      response = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    } catch {
      // fetch only rejects on a network failure, never on a 4xx/5xx.
      toast.error('Could not delete the report. Please try again.');
      return;
    }

    if (!response.ok) {
      toast.error('Could not delete the report. Please try again.');
      return;
    }

    setOpen(false);
    toast.success('Report deleted', { description: niche });
    startTransition(() => router.refresh());
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          aria-label={`Delete ${niche}`}
          // Not variant="destructive": that renders the destructive colour as
          // text on a destructive/20 tint, which measures 1.54:1 in dark mode
          // against a 4.5:1 requirement. Solid on white is 10:1.
          className="bg-destructive text-white hover:bg-destructive/90"
        >
          <Trash2 data-icon="inline-start" />
          Delete
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this report?</AlertDialogTitle>
          <AlertDialogDescription>
            {/* Naming it guards against deleting the wrong row from a list
                where every row looks alike. */}
            &ldquo;{niche}&rdquo; and its analysis will be permanently removed.
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            // Not the default action: destructive confirmations should not be
            // the button a stray Enter lands on.
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            // Solid rather than the tinted destructive variant: this is the
            // button that actually destroys something.
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending && (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            )}
            Delete report
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
