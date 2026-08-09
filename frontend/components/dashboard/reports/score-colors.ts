/**
 * Shared score/viability color thresholds for the report detail page.
 *
 * Kept separate from ViabilityBadge in report-status-badge.tsx: that one
 * renders a pill for the list view, this one classes a raw numeric score.
 */
export function getScoreColor(score: number | null): string {
  if (score === null) return 'text-muted-foreground';
  if (score >= 70) return 'text-green-600 dark:text-green-400';
  if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

export function getViabilityColor(rating: string | null): string {
  switch (rating) {
    case 'HIGH':
      return 'text-green-600 dark:text-green-400 border-green-600 dark:border-green-400';
    case 'MEDIUM':
      return 'text-yellow-600 dark:text-yellow-400 border-yellow-600 dark:border-yellow-400';
    case 'LOW':
      return 'text-red-600 dark:text-red-400 border-red-600 dark:border-red-400';
    default:
      return 'text-muted-foreground border-border';
  }
}
