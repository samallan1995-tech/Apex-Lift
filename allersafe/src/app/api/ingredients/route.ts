import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getIngredients, createIngredient, userOwnsVenue } from '@/lib/queries';
import { blockIfNoAccess } from '@/lib/access';
import { ALLERGEN_KEYS } from '@/lib/allergens';

const allergenFields = Object.fromEntries(ALLERGEN_KEYS.map(k => [k, z.boolean().optional()]));

const createSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  notes: z.string().max(500).optional(),
  ...allergenFields,
});

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get('venue_id');
  if (!venueId) return NextResponse.json({ error: 'venue_id required' }, { status: 400 });

  if (!(await userOwnsVenue(session.userId!, venueId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(await getIngredients(venueId));
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const blocked = await blockIfNoAccess(session.userId!);
  if (blocked) return blocked;

  const data = createSchema.parse(await req.json());
  if (!(await userOwnsVenue(session.userId!, data.venue_id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const allergens = Object.fromEntries(ALLERGEN_KEYS.map(k => [k, !!(data as Record<string, unknown>)[k]]));
  const ingredient = await createIngredient(data.venue_id, {
    name: data.name,
    notes: data.notes ?? null,
    ...allergens,
  } as Parameters<typeof createIngredient>[1]);

  return NextResponse.json(ingredient, { status: 201 });
}
