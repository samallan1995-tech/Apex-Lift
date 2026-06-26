'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { lsGetInvoice, lsSaveInvoice, lsDeleteInvoice, lsGetSettings } from '@/lib/localStorage';
import { calculateLatePaymentInterest, formatCurrency, formatDate } from '@/lib/interest';
import { generateLetter, LETTER_LABELS } from '@/lib/letters';
import type { Invoice, InvoiceStatus, CompanySettings } from '@/lib/types';
import type { LetterStep } from '@/lib/letters';

const PDFDownloadButton = dynamic(() => import('@/components/PDFDownloadButton'), { ssr: false });

export default function InvoiceDetailClient({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [activeStep, setActiveStep] = useState<LetterStep>(1);
  const [copied, setCopied] = useState(false);
  const [editStatus, setEditStatus] = useState<InvoiceStatus | null>(null);

  useEffect(() => {
    const inv = lsGetInvoice(invoiceId);
    if (!inv) return;
    setInvoice(inv);
    setEditStatus(inv.status);
    setSettings(lsGetSettings());
  }, [invoiceId]);

  function saveStatus() {
    if (!invoice || !editStatus) return;
    const updated = { ...invoice, status: editStatus, updatedAt: new Date().toISOString() };
    lsSaveInvoice(updated);
    setInvoice(updated);
  }

  function deleteInvoice() {
    if (!confirm('Delete this invoice?')) return;
    lsDeleteInvoice(invoiceId);
    router.push('/invoices');
  }

  if (!invoice) {
    return (
      <div className="text-center py-24 text-gray-500">
        <p className="text-3xl mb-3">📄</p>
        <p className="font-medium">Invoice not found.</p>
        <Link href="/invoices" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          ← Back to invoices
        </Link>
      </div>
    );
  }

  const dueDate = new Date(invoice.dueDate);
  const today = new Date();
  const isOverdue = invoice.status === 'Outstanding' && today > dueDate;
  const breakdown = isOverdue ? calculateLatePaymentInterest(invoice.amount, dueDate, today, settings?.defaultBoeRate ?? 4.25) : null;

  const defaultSettings: CompanySettings = {
    companyName: 'Your Company Ltd',
    address: 'Your Address',
    contactName: 'Your Name',
    email: 'you@yourcompany.co.uk',
    defaultBoeRate: 4.25,
    defaultTone: 'professional',
    ...settings,
  };

  const letterText = breakdown
    ? generateLetter(activeStep, { invoice, settings: defaultSettings, breakdown })
    : null;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/invoices" className="hover:text-gray-700">Invoices</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{invoice.invoiceNumber}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{invoice.clientName}</h1>
          <p className="text-sm text-gray-500 mt-1">Invoice {invoice.invoiceNumber}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={editStatus ?? invoice.status}
            onChange={(e) => setEditStatus(e.target.value as InvoiceStatus)}
            className="input w-auto"
          >
            <option>Outstanding</option>
            <option>Paid</option>
            <option>Disputed</option>
          </select>
          {editStatus !== invoice.status && (
            <button onClick={saveStatus} className="btn-primary">Save</button>
          )}
          <button onClick={deleteInvoice} className="btn-danger">Delete</button>
        </div>
      </div>

      {/* Invoice details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-3">Invoice details</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Amount" value={formatCurrency(invoice.amount)} />
            <Row label="Issue date" value={formatDate(new Date(invoice.issueDate))} />
            <Row label="Due date" value={formatDate(dueDate)} />
            <Row label="Status">
              <span className={`badge-${invoice.status.toLowerCase()}`}>{invoice.status}</span>
            </Row>
            {invoice.clientAddress && <Row label="Client address" value={invoice.clientAddress} />}
            {invoice.clientEmail && <Row label="Client email" value={invoice.clientEmail} />}
            {invoice.notes && <Row label="Notes" value={invoice.notes} />}
          </dl>
        </div>

        {/* Interest breakdown */}
        {breakdown ? (
          <div className="card border-red-200 bg-red-50/30">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <span>⚠️</span> Statutory interest breakdown
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Days overdue" value={`${breakdown.daysOverdue} days`} highlight />
              <Row label="Annual rate" value={`${breakdown.annualRate.toFixed(2)}% (8% + ${breakdown.boeBaseRate}% BoE)`} />
              <Row label="Daily interest" value={formatCurrency(breakdown.dailyInterestAmount)} />
              <Row label="Total interest" value={formatCurrency(breakdown.totalInterest)} highlight />
              <Row label="Fixed compensation" value={formatCurrency(breakdown.fixedCompensation)} highlight />
              <div className="border-t border-red-200 pt-2 mt-2">
                <Row label="TOTAL NOW OWED" value={formatCurrency(breakdown.totalOwed)} bold />
              </div>
            </dl>
          </div>
        ) : (
          <div className="card flex items-center justify-center text-center text-gray-400 py-8">
            {invoice.status === 'Outstanding'
              ? <p className="text-sm">Invoice is not yet overdue.</p>
              : <p className="text-sm">No interest applies — invoice is {invoice.status.toLowerCase()}.</p>}
          </div>
        )}
      </div>

      {/* Letter generator */}
      {breakdown && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Generate chaser letter</h2>

          {/* Step selector */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {([1, 2, 3] as LetterStep[]).map((step) => {
              const meta = LETTER_LABELS[step];
              return (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${
                    activeStep === step
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      activeStep === step ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Step {step}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      step === 1 ? 'bg-green-100 text-green-700'
                      : step === 2 ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                    }`}>
                      {meta.tone}
                    </span>
                  </div>
                  <p className="font-medium text-sm text-gray-900">{meta.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.description}</p>
                </button>
              );
            })}
          </div>

          {/* Letter preview */}
          {letterText && (
            <div className="space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-xs whitespace-pre-wrap max-h-96 overflow-y-auto text-gray-800">
                {letterText}
              </div>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(letterText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="btn-secondary"
                >
                  {copied ? '✓ Copied!' : 'Copy letter'}
                </button>
                <PDFDownloadButton
                  invoice={invoice}
                  settings={defaultSettings}
                  breakdown={breakdown}
                  step={activeStep}
                  letterText={letterText}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!breakdown && invoice.status === 'Outstanding' && (
        <div className="card text-center py-8">
          <p className="text-gray-500 text-sm">
            This invoice is not yet overdue — chaser letters will be available once it passes the due date.
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">
        Templates and calculations are for general guidance, not legal advice. Verify the current Bank of
        England base rate and seek professional advice before issuing a Letter Before Action.
      </p>
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
  bold = false,
  children,
}: {
  label: string;
  value?: string;
  highlight?: boolean;
  bold?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-gray-500 flex-shrink-0">{label}</dt>
      <dd className={`text-right ${highlight ? 'text-red-600' : 'text-gray-900'} ${bold ? 'font-bold' : ''}`}>
        {children ?? value}
      </dd>
    </div>
  );
}
