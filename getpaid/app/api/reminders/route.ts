/**
 * Cron route for automated email reminders.
 *
 * Vercel Cron: Add to vercel.json:
 * {
 *   "crons": [{ "path": "/api/reminders", "schedule": "0 9 * * *" }]
 * }
 *
 * Secure with CRON_SECRET: send `Authorization: Bearer <CRON_SECRET>` header,
 * or Vercel automatically adds x-vercel-cron: 1.
 */

import { NextRequest, NextResponse } from 'next/server';
import { dbGetReminders, dbGetInvoice, dbGetInvoices, dbSaveReminder, isTursoConfigured } from '@/lib/db';
import { calculateLatePaymentInterest, formatCurrency, DEFAULT_BOE_BASE_RATE } from '@/lib/interest';
import { generateLetter } from '@/lib/letters';
import type { CompanySettings } from '@/lib/types';

export async function GET(req: NextRequest) {
  // Verify this is a legitimate cron call
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    const vercelCron = req.headers.get('x-vercel-cron');
    if (auth !== `Bearer ${cronSecret}` && vercelCron !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return NextResponse.json({ message: 'Reminders disabled — RESEND_API_KEY not set' });
  }

  if (!isTursoConfigured()) {
    return NextResponse.json({ message: 'Reminders require Turso to be configured (Business plan)' });
  }

  const { Resend } = await import('resend');
  const resend = new Resend(resendApiKey);

  const reminders = await dbGetReminders();
  const enabledReminders = reminders.filter((r) => r.enabled);
  const invoices = await dbGetInvoices();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const settingsPlaceholder: CompanySettings = {
    companyName: process.env.COMPANY_NAME ?? 'Your Company',
    address: process.env.COMPANY_ADDRESS ?? '',
    contactName: process.env.COMPANY_CONTACT ?? '',
    email: process.env.COMPANY_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? '',
    defaultBoeRate: DEFAULT_BOE_BASE_RATE,
    defaultTone: 'professional',
  };

  const sent: string[] = [];

  for (const reminder of enabledReminders) {
    const invoice = invoices.find((inv) => inv.id === reminder.invoiceId);
    if (!invoice || invoice.status !== 'Outstanding') continue;

    const dueDate = new Date(invoice.dueDate);
    const daysSinceDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceDue < reminder.daysAfterDue) continue;

    const lastSent = reminder.lastSentAt ? new Date(reminder.lastSentAt) : null;
    if (lastSent) {
      const daysSinceLastSent = Math.floor((today.getTime() - lastSent.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLastSent < 1) continue;
    }

    const breakdown = calculateLatePaymentInterest(
      invoice.amount,
      dueDate,
      today,
      settingsPlaceholder.defaultBoeRate
    );

    const letterText = generateLetter(reminder.step, {
      invoice,
      settings: settingsPlaceholder,
      breakdown,
    });

    if (invoice.clientEmail) {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'noreply@getpaid.app',
        to: invoice.clientEmail,
        subject: `Invoice ${invoice.invoiceNumber} — Payment Reminder`,
        text: letterText,
      });

      await dbSaveReminder({
        ...reminder,
        lastSentAt: today.toISOString(),
      });

      sent.push(invoice.invoiceNumber);
    }
  }

  return NextResponse.json({ sent, count: sent.length });
}
