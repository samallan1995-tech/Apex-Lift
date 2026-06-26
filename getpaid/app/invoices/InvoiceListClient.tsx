'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { lsGetInvoices, lsDeleteInvoice, lsGetSettings, seedDemoData } from '@/lib/localStorage';
import { calculateLatePaymentInterest, formatCurrency } from '@/lib/interest';
import type { Invoice, InvoiceStatus } from '@/lib/types';

const STATUS_FILTERS: (InvoiceStatus | 'All')[] = ['All', 'Outstanding', 'Paid', 'Disputed'];

export default function InvoiceListClient() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<InvoiceStatus | 'All'>('All');
  const [boeRate, setBoeRate] = useState(4.25);

  useEffect(() => {
    seedDemoData();
    const settings = lsGetSettings();
    setBoeRate(settings.defaultBoeRate ?? 4.25);
    setInvoices(lsGetInvoices());
  }, []);

  function deleteInvoice(id: string) {
    if (!confirm('Delete this invoice? This cannot be undone.')) return;
    lsDeleteInvoice(id);
    setInvoices(lsGetInvoices());
  }

  const filtered = filter === 'All' ? invoices : invoices.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link href="/invoices/new" className="btn-primary">
          + New invoice
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === s
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s}
            <span className="ml-1.5 text-xs opacity-70">
              ({s === 'All' ? invoices.length : invoices.filter((i) => i.status === s).length})
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-500">
            <p className="text-3xl mb-3">📄</p>
            <p className="font-medium">No invoices yet</p>
            <p className="text-sm mt-1">
              <Link href="/invoices/new" className="text-brand-600 hover:underline">
                Add your first invoice →
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Client', 'Invoice #', 'Amount', 'Due date', 'Status', 'Interest', 'Total owed', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => {
                  const isOverdue = inv.status === 'Outstanding' && new Date(inv.dueDate) < new Date();
                  const breakdown = isOverdue
                    ? calculateLatePaymentInterest(inv.amount, new Date(inv.dueDate), new Date(), boeRate)
                    : null;

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{inv.clientName}</td>
                      <td className="px-4 py-3 text-gray-600">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{formatCurrency(inv.amount)}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(inv.dueDate).toLocaleDateString('en-GB')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge-${inv.status.toLowerCase()}`}>{inv.status}</span>
                        {isOverdue && (
                          <span className="ml-1 text-xs text-red-500 font-medium">
                            ({breakdown?.daysOverdue}d)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-red-600 font-medium">
                        {breakdown ? formatCurrency(breakdown.totalInterest) : '—'}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {breakdown
                          ? formatCurrency(breakdown.totalOwed)
                          : formatCurrency(inv.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3">
                          <Link
                            href={`/invoices/${inv.id}`}
                            className="text-brand-600 hover:underline text-xs font-medium"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => deleteInvoice(inv.id)}
                            className="text-red-500 hover:underline text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Interest calculated at 8% + {boeRate}% BoE base rate. For general guidance only — not legal advice.
      </p>
    </div>
  );
}
