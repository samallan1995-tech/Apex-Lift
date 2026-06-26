import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { updateDish, deleteDish } from '@/lib/queries';
import { getDb } from '@/lib/db';

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional().nullable(),
  available: z.boolean().optional(),
});

async function checkAccess(userId: string, dishId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT 1 FROM dishes d JOIN user_venues uv ON uv.venue_id = d.venue_id WHERE d.id = ? AND uv.user_id = ?`,
    args: [dishId, userId],
  });
  return result.rows.length > 0;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await checkAccess(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = updateSchema.parse(await req.json());
  await updateDish(params.id, data.name, data.description ?? undefined, data.available);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await checkAccess(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteDish(params.id);
  return NextResponse.json({ ok: true });
}
