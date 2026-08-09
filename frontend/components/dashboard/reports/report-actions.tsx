import { Download, Share2 } from 'lucide-react';

/**
 * Export/share controls. Both are disabled: PDF export (jspdf) and sharing
 * are planned but not built - see context/current-feature.md.
 */
export function ReportActions() {
  return (
    <div className="flex gap-2">
      <button
        disabled
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg cursor-not-allowed"
      >
        <Download className="w-4 h-4 mr-2" />
        Export PDF
      </button>
      <button
        disabled
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg cursor-not-allowed"
      >
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </button>
    </div>
  );
}
