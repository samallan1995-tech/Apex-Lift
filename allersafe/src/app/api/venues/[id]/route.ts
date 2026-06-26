import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { updateVenue, deleteVenue, userOwnsVenue } from '@/lib/queries';

const updateSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await userOwnsVenue(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = updateSchema.parse(await req.json());
  await updateVenue(params.id, data.name, data.address);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await userOwnsVenue(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteVenue(params.id);
  return NextResponse.json({ ok: true });
}
