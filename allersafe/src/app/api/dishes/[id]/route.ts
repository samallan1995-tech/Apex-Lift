import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { updateDish, deleteDish, dishBelongsToUser } from '@/lib/queries';
import { blockIfNoAccess } from '@/lib/access';

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  available: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const blocked = await blockIfNoAccess(session.userId!);
  if (blocked) return blocked;
  if (!(await dishBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = updateSchema.parse(await req.json());
  await updateDish(params.id, data.name, data.description ?? undefined, data.available);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await dishBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteDish(params.id);
  return NextResponse.json({ ok: true });
}
