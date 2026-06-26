import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { dbGetInvoices, dbSaveInvoice, isTursoConfigured } from '@/lib/db';
import type { Invoice } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!isTursoConfigured()) {
    return NextResponse.json({ invoices: [], source: 'localStorage' });
  }

  const invoices = await dbGetInvoices();
  return NextResponse.json({ invoices, source: 'turso' });
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();

  const invoice: Invoice = {
    id: body.id ?? randomUUID(),
    clientName: String(body.clientName ?? ''),
    clientAddress: body.clientAddress,
    clientEmail: body.clientEmail,
    invoiceNumber: String(body.invoiceNumber ?? ''),
    amount: Number(body.amount),
    issueDate: String(body.issueDate),
    dueDate: String(body.dueDate),
    status: body.status ?? 'Outstanding',
    notes: body.notes,
    createdAt: body.createdAt ?? now,
    updatedAt: now,
  };

  if (!invoice.clientName || !invoice.invoiceNumber || !invoice.amount || !invoice.dueDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (isTursoConfigured()) {
    await dbSaveInvoice(invoice);
  }

  return NextResponse.json({ invoice });
}
