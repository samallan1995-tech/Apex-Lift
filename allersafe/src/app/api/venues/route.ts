import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getVenuesForUser, createVenue, getVenueBySlug } from '@/lib/queries';
import { slugify } from '@/lib/utils';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  return NextResponse.json(await getVenuesForUser(session.userId!));
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const data = createSchema.parse(await req.json());

  let slug = slugify(data.name);
  let attempt = 0;
  while (attempt < 10) {
    const candidate = attempt === 0 ? slug : `${slug}-${attempt}`;
    const existing = await getVenueBySlug(candidate);
    if (!existing) { slug = candidate; break; }
    attempt++;
  }

  const venue = await createVenue(session.userId!, data.name, slug, data.address);
  return NextResponse.json(venue, { status: 201 });
}
