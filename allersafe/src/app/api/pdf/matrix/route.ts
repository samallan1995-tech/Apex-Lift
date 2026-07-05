import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getDishesWithAllergens, getVenueById, userOwnsVenue } from '@/lib/queries';
import { blockIfNoAccess } from '@/lib/access';
import { ALLERGENS } from '@/lib/allergens';
import { renderToBuffer } from '@react-pdf/renderer';
import { AllergenMatrixDocument } from '@/components/pdf/MatrixDocument';
import React from 'react';

export async function GET(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  const blocked = await blockIfNoAccess(session.userId!);
  if (blocked) return blocked;

  const { searchParams } = new URL(req.url);
  const venueId = searchParams.get('venue_id');
  if (!venueId) return NextResponse.json({ error: 'venue_id required' }, { status: 400 });

  if (!(await userOwnsVenue(session.userId!, venueId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const [venue, dishes] = await Promise.all([
    getVenueById(venueId),
    getDishesWithAllergens(venueId),
  ]);

  const elem = React.createElement(AllergenMatrixDocument, { venue: venue!, dishes, allergens: ALLERGENS });
  // @react-pdf/renderer types are incompatible with React's generic JSX types; cast required
  const buffer = await renderToBuffer(elem as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="allergen-matrix-${venue?.slug ?? 'venue'}.pdf"`,
    },
  });
}
