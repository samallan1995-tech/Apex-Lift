import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/session';
import { dbGetInvoice, dbSaveInvoice, dbDeleteInvoice, isTursoConfigured } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (!isTursoConfigured()) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const invoice = await dbGetInvoice(params.id);
  if (!invoice) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  if (isTursoConfigured()) {
    const existing = await dbGetInvoice(params.id);
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = {
      ...existing,
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };
    await dbSaveInvoice(updated);
    return NextResponse.json({ invoice: updated });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (isTursoConfigured()) {
    await dbDeleteInvoice(params.id);
  }

  return NextResponse.json({ ok: true });
}
