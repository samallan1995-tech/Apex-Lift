import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { setDishIngredients, getDishWithAllergens } from '@/lib/queries';
import { getDb } from '@/lib/db';

const setSchema = z.object({
  ingredients: z.array(z.object({
    ingredient_id: z.string().uuid(),
    weight_grams: z.number().min(0),
  })),
});

async function checkAccess(userId: string, dishId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT 1 FROM dishes d JOIN user_venues uv ON uv.venue_id = d.venue_id WHERE d.id = ? AND uv.user_id = ?`,
    args: [dishId, userId],
  });
  return result.rows.length > 0;
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await checkAccess(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dish = await getDishWithAllergens(params.id);
  return NextResponse.json(dish);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await checkAccess(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { ingredients } = setSchema.parse(await req.json());
  await setDishIngredients(params.id, ingredients);

  const dish = await getDishWithAllergens(params.id);
  return NextResponse.json(dish);
}
