import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { setDishIngredients, getDishWithAllergens, dishBelongsToUser } from '@/lib/queries';

const setSchema = z.object({
  ingredients: z.array(z.object({
    ingredient_id: z.string().uuid(),
    weight_grams: z.number().min(0),
  })),
});

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await dishBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dish = await getDishWithAllergens(params.id);
  return NextResponse.json(dish);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
  if (!(await dishBelongsToUser(session.userId!, params.id)))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { ingredients } = setSchema.parse(await req.json());
  await setDishIngredients(params.id, ingredients);
  const dish = await getDishWithAllergens(params.id);
  return NextResponse.json(dish);
}
