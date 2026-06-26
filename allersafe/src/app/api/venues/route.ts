import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getVenuesForUser, createVenue } from '@/lib/queries';
import { slugify } from '@/lib/utils';
import { getDb } from '@/lib/db';

const createSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().max(200).optional(),
});

export async function GET() {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const venues = await getVenuesForUser(session.userId!);
  return NextResponse.json(venues);
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const body = await req.json();
  const data = createSchema.parse(body);

  // Generate unique slug
  const db = getDb();
  let slug = slugify(data.name);
  let attempt = 0;
  while (attempt < 10) {
    const suffix = attempt === 0 ? '' : `-${attempt}`;
    const candidate = slug + suffix;
    const exists = await db.execute({ sql: 'SELECT id FROM venues WHERE slug = ?', args: [candidate] });
    if (exists.rows.length === 0) { slug = candidate; break; }
    attempt++;
  }

  const venue = await createVenue(session.userId!, data.name, slug, data.address);
  return NextResponse.json(venue, { status: 201 });
}
