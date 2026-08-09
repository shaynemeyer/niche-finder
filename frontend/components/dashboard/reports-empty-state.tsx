import Link from 'next/link';
import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function ReportsEmptyState({
  title = 'No reports yet',
  description = 'Start validating your first niche to see reports here',
  action,
}: {
  title?: string;
  description?: string;
  /** Omitted when the caller is already the page that creates reports. */
  action?: { href: string; label: string };
}) {
  return (
    <div className="text-center py-12">
      <FileText className="size-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {action && (
        <Button asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
