'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  lsGetInvoices,
  lsGetSettings,
  seedDemoData,
} from '@/lib/localStorage';
import { calculateLatePaymentInterest, formatCurrency } from '@/lib/interest';
import type { Invoice } from '@/lib/types';

function calcInterest(inv: Invoice, boeRate: number) {
  if (inv.status !== 'Outstanding') return null;
  const due = new Date(inv.dueDate);
  const today = new Date();
  if (today <= due) return null;
  return calculateLatePaymentInterest(inv.amount, due, today, boeRate);
}

export default function DashboardClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [boeRate, setBoeRate] = useState(4.25);

  useEffect(() => {
    seedDemoData();
    const settings = lsGetSettings();
    setBoeRate(settings.defaultBoeRate ?? 4.25);
    setInvoices(lsGetInvoices());
  }, []);

  const outstanding = invoices.filter((i) => i.status === 'Outstanding');
  const overdue = outstanding.filter((i) => new Date(i.dueDate) < new Date());
  const totalOutstanding = outstanding.reduce((s, i) => s + i.amount, 0);
  const totalInterest = overdue.reduce((s, i) => {
    const b = calcInterest(i, boeRate);
    return s + (b?.totalInterest ?? 0);
  }, 0);
  const totalOwed = totalOutstanding + totalInterest;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Your outstanding invoices at a glance.</p>
        </div>
        <Link href="/invoices/new" className="btn-primary">
          + New invoice
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard
          label="Outstanding invoices"
          value={String(outstanding.length)}
          sub={`${overdue.length} overdue`}
          color="amber"
        />
        <SummaryCard
          label="Total outstanding"
          value={formatCurrency(totalOutstanding)}
          sub="original invoice amounts"
          color="blue"
        />
        <SummaryCard
          label="Total incl. statutory interest"
          value={formatCurrency(totalOwed)}
          sub={`+${formatCurrency(totalInterest)} interest accrued`}
          color="red"
        />
      </div>

      {/* Overdue table */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Overdue invoices</h2>
          <Link href="/invoices" className="text-sm text-brand-600 hover:underline">
            View all →
          </Link>
        </div>
        {overdue.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-medium">No overdue invoices!</p>
            <p className="text-sm mt-1">Add an invoice to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Client', 'Invoice #', 'Amount', 'Due date', 'Days overdue', 'Interest', 'Total owed', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {overdue.map((inv) => {
                  const b = calcInterest(inv, boeRate);
                  const daysOverdue = b?.daysOverdue ?? 0;
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.clientName}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-900">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">{new Date(inv.dueDate).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${daysOverdue > 30 ? 'text-red-600' : 'text-amber-600'}`}>
                          {daysOverdue}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-red-600 font-medium">
                        {b ? formatCurrency(b.totalInterest) : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-900">
                        {b ? formatCurrency(b.totalOwed) : formatCurrency(inv.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/invoices/${inv.id}`}
                          className="text-brand-600 hover:underline text-xs font-medium"
                        >
                          Chase →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center">
        Interest calculated at 8% + {boeRate}% BoE base rate. Templates and calculations are for
        general guidance only — not legal advice. Verify the current Bank of England base rate and
        seek professional advice before issuing a Letter Before Action.
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: 'amber' | 'blue' | 'red';
}) {
  const borderColor = { amber: 'border-amber-400', blue: 'border-brand-400', red: 'border-red-400' }[color];
  return (
    <div className={`card border-l-4 ${borderColor}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
