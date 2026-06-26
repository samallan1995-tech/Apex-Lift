'use client';

import { useState } from 'react';
import type { Invoice } from '@/lib/types';
import type { CompanySettings } from '@/lib/types';
import type { InterestBreakdown } from '@/lib/interest';
import type { LetterStep } from '@/lib/letters';
import { LETTER_LABELS } from '@/lib/letters';

interface Props {
  invoice: Invoice;
  settings: CompanySettings;
  breakdown: InterestBreakdown;
  step: LetterStep;
  letterText: string;
}

export default function PDFDownloadButton({ invoice, settings, breakdown, step, letterText }: Props) {
  const [loading, setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { LetterPDFDocument } = await import('./LetterPDFDocument');
      const React = (await import('react')).default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = React.createElement(LetterPDFDocument as any, {
        invoice,
        settings,
        breakdown,
        step,
        letterText,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(doc as any).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber}-step${step}-${LETTER_LABELS[step].title.replace(/\s+/g, '-')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try copying the letter text instead.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={generatePDF} disabled={loading} className="btn-primary">
      {loading ? 'Generating PDF...' : '↓ Download PDF'}
    </button>
  );
}
