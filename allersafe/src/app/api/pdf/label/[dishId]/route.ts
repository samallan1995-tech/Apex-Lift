import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getDishWithAllergens, dishBelongsToUser } from '@/lib/queries';
import { renderToBuffer } from '@react-pdf/renderer';
import { PPDSLabelDocument } from '@/components/pdf/LabelDocument';
import React from 'react';

export async function GET(_req: Request, { params }: { params: { dishId: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await dishBelongsToUser(session.userId!, params.dishId)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dish = await getDishWithAllergens(params.dishId);
  if (!dish) return NextResponse.json({ error: 'Dish not found' }, { status: 404 });

  const elem = React.createElement(PPDSLabelDocument, { dish });
  const buffer = await renderToBuffer(elem as Parameters<typeof renderToBuffer>[0]);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ppds-label-${dish.name.toLowerCase().replace(/\s+/g, '-')}.pdf"`,
    },
  });
}
