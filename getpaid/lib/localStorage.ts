/**
 * Client-side localStorage helpers — mirrors the db.ts server API so
 * components can use the same shape regardless of storage backend.
 */

import type { Invoice, CompanySettings, ReminderSchedule } from './types';

const KEYS = {
  invoices: 'getpaid:invoices',
  settings: 'getpaid:settings',
  reminders: 'getpaid:reminders',
  session: 'getpaid:session',
} as const;

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ---------------------------------------------------------------------------
// Invoices
// ---------------------------------------------------------------------------

export function lsGetInvoices(): Invoice[] {
  return read<Invoice[]>(KEYS.invoices, []);
}

export function lsGetInvoice(id: string): Invoice | null {
  return lsGetInvoices().find((i) => i.id === id) ?? null;
}

export function lsSaveInvoice(invoice: Invoice): void {
  const invoices = lsGetInvoices();
  const idx = invoices.findIndex((i) => i.id === invoice.id);
  if (idx >= 0) {
    invoices[idx] = invoice;
  } else {
    invoices.unshift(invoice);
  }
  write(KEYS.invoices, invoices);
}

export function lsDeleteInvoice(id: string): void {
  const invoices = lsGetInvoices().filter((i) => i.id !== id);
  write(KEYS.invoices, invoices);
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export const DEFAULT_SETTINGS: CompanySettings = {
  companyName: '',
  address: '',
  contactName: '',
  email: '',
  defaultBoeRate: 4.25,
  defaultTone: 'professional',
};

export function lsGetSettings(): CompanySettings {
  return { ...DEFAULT_SETTINGS, ...read<Partial<CompanySettings>>(KEYS.settings, {}) };
}

export function lsSaveSettings(settings: CompanySettings): void {
  write(KEYS.settings, settings);
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export function lsGetReminders(invoiceId?: string): ReminderSchedule[] {
  const all = read<ReminderSchedule[]>(KEYS.reminders, []);
  return invoiceId ? all.filter((r) => r.invoiceId === invoiceId) : all;
}

export function lsSaveReminder(reminder: ReminderSchedule): void {
  const all = lsGetReminders();
  const idx = all.findIndex((r) => r.id === reminder.id);
  if (idx >= 0) {
    all[idx] = reminder;
  } else {
    all.push(reminder);
  }
  write(KEYS.reminders, all);
}

export function lsDeleteReminder(id: string): void {
  const all = lsGetReminders().filter((r) => r.id !== id);
  write(KEYS.reminders, all);
}

// ---------------------------------------------------------------------------
// Seed demo data on first load
// ---------------------------------------------------------------------------

export function seedDemoData(): void {
  if (typeof window === 'undefined') return;
  const invoices = lsGetInvoices();
  if (invoices.length > 0) return; // already seeded

  const now = new Date();
  const issueDate = new Date(now);
  issueDate.setDate(issueDate.getDate() - 45);
  const dueDate = new Date(now);
  dueDate.setDate(dueDate.getDate() - 15);

  const demo: Invoice = {
    id: 'demo-001',
    clientName: 'Acme Trading Ltd',
    clientAddress: '12 Business Park, London, EC1A 1BB',
    clientEmail: 'accounts@acme-trading.co.uk',
    invoiceNumber: 'INV-2024-001',
    amount: 5000,
    issueDate: issueDate.toISOString().split('T')[0],
    dueDate: dueDate.toISOString().split('T')[0],
    status: 'Outstanding',
    notes: 'Web design project — final milestone payment.',
    createdAt: issueDate.toISOString(),
    updatedAt: now.toISOString(),
  };

  lsSaveInvoice(demo);
}
