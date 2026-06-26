'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { lsSaveInvoice } from '@/lib/localStorage';
import type { Invoice, InvoiceStatus } from '@/lib/types';
import { randomUUID } from '@/lib/utils';

export default function InvoiceForm({ existing }: { existing?: Invoice }) {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: existing?.clientName ?? '',
    clientAddress: existing?.clientAddress ?? '',
    clientEmail: existing?.clientEmail ?? '',
    invoiceNumber: existing?.invoiceNumber ?? '',
    amount: existing?.amount ? String(existing.amount) : '',
    issueDate: existing?.issueDate ?? new Date().toISOString().split('T')[0],
    dueDate: existing?.dueDate ?? '',
    status: (existing?.status ?? 'Outstanding') as InvoiceStatus,
    notes: existing?.notes ?? '',
  });
  const [error, setError] = useState('');

  function set(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.clientName.trim()) return setError('Client name is required.');
    if (!form.invoiceNumber.trim()) return setError('Invoice number is required.');
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) return setError('Please enter a valid invoice amount.');
    if (!form.dueDate) return setError('Due date is required.');

    const now = new Date().toISOString();
    const invoice: Invoice = {
      id: existing?.id ?? randomUUID(),
      clientName: form.clientName.trim(),
      clientAddress: form.clientAddress.trim() || undefined,
      clientEmail: form.clientEmail.trim() || undefined,
      invoiceNumber: form.invoiceNumber.trim(),
      amount,
      issueDate: form.issueDate,
      dueDate: form.dueDate,
      status: form.status,
      notes: form.notes.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    lsSaveInvoice(invoice);
    router.push(`/invoices/${invoice.id}`);
  }

  return (
    <form onSubmit={save} className="card space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="clientName">Client / company name <span className="text-red-500">*</span></label>
          <input id="clientName" className="input" placeholder="Acme Trading Ltd" value={form.clientName} onChange={(e) => set('clientName', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="clientAddress">Client address</label>
          <textarea id="clientAddress" className="input" rows={2} placeholder="12 Business Park, London, EC1A 1BB" value={form.clientAddress} onChange={(e) => set('clientAddress', e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="clientEmail">Client email (for auto-reminders)</label>
          <input id="clientEmail" className="input" type="email" placeholder="accounts@client.co.uk" value={form.clientEmail} onChange={(e) => set('clientEmail', e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="invoiceNumber">Invoice number <span className="text-red-500">*</span></label>
          <input id="invoiceNumber" className="input" placeholder="INV-2024-001" value={form.invoiceNumber} onChange={(e) => set('invoiceNumber', e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="amount">Invoice amount (£) <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
            <input id="amount" className="input pl-7" type="number" min="0.01" step="0.01" placeholder="5000.00" value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="status">Status</label>
          <select id="status" className="input" value={form.status} onChange={(e) => set('status', e.target.value as InvoiceStatus)}>
            <option>Outstanding</option>
            <option>Paid</option>
            <option>Disputed</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="issueDate">Invoice date <span className="text-red-500">*</span></label>
          <input id="issueDate" className="input" type="date" value={form.issueDate} onChange={(e) => set('issueDate', e.target.value)} />
        </div>

        <div>
          <label className="label" htmlFor="dueDate">Payment due date <span className="text-red-500">*</span></label>
          <input id="dueDate" className="input" type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
        </div>

        <div className="sm:col-span-2">
          <label className="label" htmlFor="notes">Notes</label>
          <textarea id="notes" className="input" rows={2} placeholder="Web design project — final milestone" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary">
          {existing ? 'Save changes' : 'Add invoice →'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancel
        </button>
      </div>
    </form>
  );
}
