import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { updateIngredient, deleteIngredient, ingredientBelongsToUser } from '@/lib/queries';
import { blockIfNoAccess } from '@/lib/access';
import { ALLERGEN_KEYS } from '@/lib/allergens';

const allergenFields = Object.fromEntries(ALLERGEN_KEYS.map(k => [k, z.boolean().optional()]));
const updateSchema = z.object({
  name: z.string().min(1).max(200),
  notes: z.string().max(500).optional().nullable(),
  ...allergenFields,
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const blocked = await blockIfNoAccess(session.userId!);
  if (blocked) return blocked;
  if (!(await ingredientBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const data = updateSchema.parse(await req.json());
  const allergens = Object.fromEntries(ALLERGEN_KEYS.map(k => [k, !!(data as Record<string, unknown>)[k]]));
  await updateIngredient(params.id, {
    name: data.name,
    notes: data.notes ?? null,
    ...allergens,
  } as Parameters<typeof updateIngredient>[1]);

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await ingredientBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await deleteIngredient(params.id);
  return NextResponse.json({ ok: true });
}
