import { Progress } from '@/components/ui/progress';

/**
 * Indeterminate bar. The pipeline exposes no sub-step progress, so this shows
 * that work is happening rather than how much is left.
 *
 * value={null} puts the Radix primitive in its indeterminate state; the sweep
 * is ours because the shadcn indicator only translates by a numeric value.
 */
export function ReportProgressBar() {
  return (
    <Progress value={null} aria-label="Analysis in progress" className="mt-2" />
  );
}
