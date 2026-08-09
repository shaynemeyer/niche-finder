import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { TrendsAnalysisResult } from '@/lib/trends/types';
import type { AIMarketInsights } from '@/lib/validations/insights';

// jspdf-autotable augments jsPDF with `lastAutoTable` at runtime but ships no
// type for it.
interface AutoTableDoc extends jsPDF {
  lastAutoTable: { finalY: number };
}

interface Report {
  niche: string;
  keyword: string;
  status: string;
  overallScore: number | null;
  viabilityRating: string | null;
  trendsData: TrendsAnalysisResult | null;
  aiInsights: AIMarketInsights | null;
}

export const exportReportToPDF = (report: Report) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addWrappedText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = 10,
  ) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.35); // Return height used
  };

  // Helper for bulleted list items: measures the wrapped height first so the
  // page-break check reflects the actual space needed, not a fixed guess.
  const addBullet = (text: string, x: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(`• ${text}`, maxWidth);
    const height = lines.length * (fontSize * 0.35);
    checkPageBreak(height);
    doc.text(lines, x, yPosition);
    yPosition += height + 3;
  };

  // ===== HEADER =====
  doc.setFillColor(59, 130, 246); // Blue
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Niche Validation Report', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, 30, {
    align: 'center',
  });

  yPosition = 50;
  doc.setTextColor(0, 0, 0);

  // ===== OVERVIEW SECTION =====
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Overview', 14, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const overviewData = [
    ['Niche', report.niche],
    ['Keyword', report.keyword],
    [
      'Overall Score',
      report.overallScore !== null ? `${report.overallScore}/100` : 'N/A',
    ],
    ['Viability Rating', report.viabilityRating ?? 'N/A'],
    ['Status', report.status],
  ];

  autoTable(doc, {
    startY: yPosition,
    head: [],
    body: overviewData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] },
    margin: { left: 14, right: 14 },
  });

  yPosition = (doc as AutoTableDoc).lastAutoTable.finalY + 15;

  // ===== OPPORTUNITY ASSESSMENT =====
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Opportunity Assessment', 14, yPosition);
  yPosition += 10;

  if (report.aiInsights?.opportunityAssessment) {
    const assessment = report.aiInsights.opportunityAssessment;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const summaryHeight = addWrappedText(
      assessment.reasoning || 'No reasoning provided',
      14,
      yPosition,
      pageWidth - 28,
    );
    yPosition += summaryHeight + 10;

    // Strengths
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Strengths:', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    assessment.strengths?.forEach((strength: string) => {
      addBullet(strength, 20, pageWidth - 34);
    });

    yPosition += 5;

    // Weaknesses
    checkPageBreak(30);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Weaknesses:', 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    assessment.weaknesses?.forEach((weakness: string) => {
      addBullet(weakness, 20, pageWidth - 34);
    });
  }

  yPosition += 10;

  // ===== GOOGLE TRENDS DATA =====
  checkPageBreak(40);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Google Trends Analysis', 14, yPosition);
  yPosition += 10;

  if (report.trendsData) {
    const trendsTableData = [
      ['Average Interest', `${report.trendsData.averageInterest}/100`],
      [
        'Growth Rate',
        `${report.trendsData.growthRate > 0 ? '+' : ''}${report.trendsData.growthRate?.toFixed(1)}%`,
      ],
      ['Trend', report.trendsData.trend],
    ];

    autoTable(doc, {
      startY: yPosition,
      head: [],
      body: trendsTableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as AutoTableDoc).lastAutoTable.finalY + 15;

    // Top Related Queries
    if (report.trendsData.relatedQueries?.top?.length > 0) {
      checkPageBreak(40);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Related Queries:', 14, yPosition);
      yPosition += 10;

      const queriesData = report.trendsData.relatedQueries.top
        .slice(0, 5)
        .map((q) => [q.query, q.value]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Query', 'Value']],
        body: queriesData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
      });

      yPosition = (doc as AutoTableDoc).lastAutoTable.finalY + 15;
    }
  }

  // ===== BUSINESS IDEAS =====
  if (report.aiInsights && report.aiInsights.businessIdeas.length > 0) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Ideas', 14, yPosition);
    yPosition += 10;

    report.aiInsights.businessIdeas.forEach((idea, index) => {
      checkPageBreak(60);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${idea.idea}`, 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const descHeight = addWrappedText(
        idea.description,
        20,
        yPosition,
        pageWidth - 34,
      );
      yPosition += descHeight + 5;

      const detailsData = [
        ['Difficulty', idea.difficulty],
        ['Time to Launch', idea.timeToLaunch],
        ['Estimated Cost', idea.estimatedCost],
        ['Revenue Model', idea.revenueModel],
      ];

      autoTable(doc, {
        startY: yPosition,
        head: [],
        body: detailsData,
        theme: 'plain',
        styles: { fontSize: 9 },
        margin: { left: 20, right: 14 },
      });

      yPosition = (doc as AutoTableDoc).lastAutoTable.finalY + 10;
    });
  }

  // ===== GO-TO-MARKET STRATEGY =====
  if (report.aiInsights?.gtmStrategy) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Go-to-Market Strategy', 14, yPosition);
    yPosition += 10;

    const gtm = report.aiInsights.gtmStrategy;

    // Quick Wins
    if (gtm.quickWins?.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Quick Wins:', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      gtm.quickWins.forEach((win: string) => {
        addBullet(win, 20, pageWidth - 34);
      });
      yPosition += 5;
    }

    // Phase 1
    if (gtm.phase1?.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Phase 1: Foundation (Weeks 1-4)', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      gtm.phase1.forEach((step: string) => {
        addBullet(step, 20, pageWidth - 34);
      });
      yPosition += 5;
    }

    // Phase 2
    if (gtm.phase2?.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Phase 2: Growth (Weeks 5-12)', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      gtm.phase2.forEach((step: string) => {
        addBullet(step, 20, pageWidth - 34);
      });
      yPosition += 5;
    }

    // Phase 3
    if (gtm.phase3?.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Phase 3: Scale (Month 4+)', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      gtm.phase3.forEach((step: string) => {
        addBullet(step, 20, pageWidth - 34);
      });
      yPosition += 5;
    }
  }

  // ===== RISKS & RECOMMENDATIONS =====
  if (
    report.aiInsights &&
    (report.aiInsights.risks.length > 0 ||
      report.aiInsights.recommendations.length > 0)
  ) {
    checkPageBreak(40);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Risks & Recommendations', 14, yPosition);
    yPosition += 10;

    // Risks
    if (report.aiInsights.risks.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Risks:', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.aiInsights.risks.forEach((risk) => {
        addBullet(risk, 20, pageWidth - 34);
      });
      yPosition += 5;
    }

    // Recommendations
    if (report.aiInsights.recommendations.length > 0) {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations:', 14, yPosition);
      yPosition += 7;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      report.aiInsights.recommendations.forEach((rec) => {
        addBullet(rec, 20, pageWidth - 34);
      });
    }
  }

  // ===== FOOTER ON LAST PAGE =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${totalPages} | Generated by NicheFinder`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' },
    );
  }

  // Save the PDF
  const fileName = `${report.keyword.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
