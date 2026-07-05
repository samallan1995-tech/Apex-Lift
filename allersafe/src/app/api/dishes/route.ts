import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getDishesWithAllergens, createDish, userOwnsVenue } from '@/lib/queries';
import { blockIfNoAccess } from '@/lib/access';

const createSchema = z.object({
  venue_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
});

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get('venue_id');
  if (!venueId) return NextResponse.json({ error: 'venue_id required' }, { status: 400 });

  if (!(await userOwnsVenue(session.userId!, venueId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  return NextResponse.json(await getDishesWithAllergens(venueId));
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const blocked = await blockIfNoAccess(session.userId!);
  if (blocked) return blocked;

  const data = createSchema.parse(await req.json());
  if (!(await userOwnsVenue(session.userId!, data.venue_id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dish = await createDish(data.venue_id, data.name, data.description);
  return NextResponse.json(dish, { status: 201 });
}
