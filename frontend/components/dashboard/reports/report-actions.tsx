'use client';

import { Download, Share2 } from 'lucide-react';

import { exportReportToPDF } from '@/lib/pdf/exportPDF';
import type { TrendsAnalysisResult } from '@/lib/trends/types';
import type { AIMarketInsights } from '@/lib/validations/insights';

interface ReportActionsProps {
  niche: string;
  keyword: string;
  status: string;
  overallScore: number | null;
  viabilityRating: string | null;
  trends: TrendsAnalysisResult;
  insights: AIMarketInsights;
}

/**
 * Export/share controls. Sharing is planned but not built - see
 * context/current-feature.md. PDF export runs client-side (jsPDF needs the
 * DOM to save a file), so this component is 'use client' while the page
 * around it stays a server component.
 */
export function ReportActions({
  niche,
  keyword,
  status,
  overallScore,
  viabilityRating,
  trends,
  insights,
}: ReportActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() =>
          exportReportToPDF({
            niche,
            keyword,
            status,
            overallScore,
            viabilityRating,
            trendsData: trends,
            aiInsights: insights,
          })
        }
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border hover:bg-accent rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-colors"
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
