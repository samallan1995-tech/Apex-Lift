/* eslint-disable @typescript-eslint/no-explicit-any */
import { getDb as _getDb, unixNow } from './db';
import { ALLERGEN_KEYS } from './allergens';
import type { AllergenKey } from './allergens';
import type { Ingredient, Dish, DishIngredient, DishWithAllergens, Venue, User } from '@/types';

// Cast to any so the untyped Supabase client doesn't infer `never` on all DML operations.
function getDb(): any { return _getDb(); }

// ── Helpers ───────────────────────────────────────────────────────────────────

function toInt(val: unknown): boolean {
  return val === 1 || val === true;
}

function rowToIngredient(row: Record<string, unknown>): Ingredient {
  return {
    id: row.id as string,
    venue_id: row.venue_id as string,
    name: row.name as string,
    notes: row.notes as string | null,
    created_at: row.created_at as number,
    ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, toInt(row[k])])),
  } as Ingredient;
}

function rowToDish(row: Record<string, unknown>): Dish {
  return {
    id: row.id as string,
    venue_id: row.venue_id as string,
    name: row.name as string,
    description: row.description as string | null,
    available: toInt(row.available),
    created_at: row.created_at as number,
  };
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function findOrCreateUser(email: string): Promise<User> {
  const db = getDb();
  const { data: existing } = await db.from('users').select().eq('email', email).maybeSingle();
  if (existing) return existing as User;

  const user: User = { id: crypto.randomUUID(), email, created_at: unixNow() };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.from('users').insert(user as any);
  return user;
}

// ── Magic codes ───────────────────────────────────────────────────────────────

export async function createMagicCode(email: string, code: string): Promise<void> {
  const db = getDb();
  await db.from('magic_codes').insert({
    id: crypto.randomUUID(),
    email: email.toLowerCase(),
    code,
    expires_at: unixNow() + 15 * 60,
  } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}

export async function verifyMagicCode(email: string, code: string): Promise<boolean> {
  const db = getDb();
  const { data } = await db
    .from('magic_codes')
    .select()
    .eq('email', email.toLowerCase())
    .eq('code', code)
    .eq('used', 0)
    .gt('expires_at', unixNow())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return false;
  await db.from('magic_codes').update({ used: 1 } as any).eq('id', (data as Record<string, unknown>).id);
  return true;
}

// ── Venues ────────────────────────────────────────────────────────────────────

export async function getVenuesForUser(userId: string): Promise<Venue[]> {
  const db = getDb();
  const { data: uvs } = await db.from('user_venues').select('venue_id').eq('user_id', userId);
  if (!uvs?.length) return [];
  const venueIds = uvs.map((uv: Record<string, unknown>) => uv.venue_id as string);
  const { data } = await db.from('venues').select().in('id', venueIds).order('created_at');
  return (data ?? []) as Venue[];
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const db = getDb();
  const { data } = await db.from('venues').select().eq('id', id).maybeSingle();
  return data as Venue | null;
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const db = getDb();
  const { data } = await db.from('venues').select().eq('slug', slug).maybeSingle();
  return data as Venue | null;
}

export async function userOwnsVenue(userId: string, venueId: string): Promise<boolean> {
  const db = getDb();
  const { data } = await db
    .from('user_venues')
    .select()
    .eq('user_id', userId)
    .eq('venue_id', venueId)
    .maybeSingle();
  return !!data;
}

export async function createVenue(
  userId: string,
  name: string,
  slug: string,
  address?: string
): Promise<Venue> {
  const db = getDb();
  const venue: Venue = { id: crypto.randomUUID(), name, slug, address: address ?? null, created_by: userId, created_at: unixNow() };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.from('venues').insert(venue as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.from('user_venues').insert({ user_id: userId, venue_id: venue.id, role: 'owner' } as any);
  return venue;
}

export async function updateVenue(id: string, name: string, address?: string): Promise<void> {
  const db = getDb();
  await db.from('venues').update({ name, address: address ?? null } as any).eq('id', id);
}

export async function deleteVenue(id: string): Promise<void> {
  const db = getDb();
  await db.from('venues').delete().eq('id', id);
}

// ── Ingredients ───────────────────────────────────────────────────────────────

export async function getIngredients(venueId: string): Promise<Ingredient[]> {
  const db = getDb();
  const { data } = await db.from('ingredients').select().eq('venue_id', venueId).order('name');
  return ((data ?? []) as Record<string, unknown>[]).map(r => rowToIngredient(r));
}

export async function createIngredient(
  venueId: string,
  data: Omit<Ingredient, 'id' | 'venue_id' | 'created_at'>
): Promise<Ingredient> {
  const db = getDb();
  const row = {
    id: crypto.randomUUID(),
    venue_id: venueId,
    name: data.name,
    notes: data.notes ?? null,
    created_at: unixNow(),
    ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, (data as Record<string, unknown>)[k] ? 1 : 0])),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.from('ingredients').insert(row as any);
  return rowToIngredient(row as Record<string, unknown>);
}

export async function updateIngredient(
  id: string,
  data: Omit<Ingredient, 'id' | 'venue_id' | 'created_at'>
): Promise<void> {
  const db = getDb();
  await db.from('ingredients').update({
    name: data.name,
    notes: data.notes ?? null,
    ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, (data as Record<string, unknown>)[k] ? 1 : 0])),
  } as any).eq('id', id);
}

export async function deleteIngredient(id: string): Promise<void> {
  const db = getDb();
  await db.from('ingredients').delete().eq('id', id);
}

// ── Dishes ────────────────────────────────────────────────────────────────────

export async function getDishes(venueId: string): Promise<Dish[]> {
  const db = getDb();
  const { data } = await db.from('dishes').select().eq('venue_id', venueId).order('name');
  return ((data ?? []) as Record<string, unknown>[]).map(r => rowToDish(r));
}

type RawDishIngredient = {
  id: string;
  dish_id: string;
  ingredient_id: string;
  weight_grams: number;
  ingredients: Record<string, unknown>;
};

function buildDishWithAllergens(
  dish: Dish,
  rawIngreds: RawDishIngredient[]
): DishWithAllergens {
  const ingredients: DishIngredient[] = rawIngreds.map(di => ({
    id: di.id,
    dish_id: di.dish_id,
    ingredient_id: di.ingredient_id,
    weight_grams: di.weight_grams,
    ingredient_name: di.ingredients.name as string,
    ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, toInt(di.ingredients[k])])),
  } as DishIngredient));

  const allergens = Object.fromEntries(
    ALLERGEN_KEYS.map(k => [k, ingredients.some(i => i[k as keyof DishIngredient])])
  ) as Record<AllergenKey, boolean>;

  return { ...dish, allergens, ingredients };
}

export async function getDishWithAllergens(dishId: string): Promise<DishWithAllergens | null> {
  const db = getDb();
  const { data: dishRow } = await db.from('dishes').select().eq('id', dishId).maybeSingle();
  if (!dishRow) return null;

  const { data: diRows } = await db
    .from('dish_ingredients')
    .select('*, ingredients(*)')
    .eq('dish_id', dishId)
    .order('weight_grams', { ascending: false });

  const dish = rowToDish(dishRow as Record<string, unknown>);
  return buildDishWithAllergens(dish, ((diRows ?? []) as unknown) as RawDishIngredient[]);
}

export async function getDishesWithAllergens(venueId: string): Promise<DishWithAllergens[]> {
  const db = getDb();
  const { data: dishRows } = await db.from('dishes').select().eq('venue_id', venueId).order('name');
  if (!dishRows?.length) return [];

  const dishes = (dishRows as Record<string, unknown>[]).map(r => rowToDish(r));

  const { data: diRows } = await db
    .from('dish_ingredients')
    .select('*, ingredients(*)')
    .in('dish_id', dishes.map(d => d.id))
    .order('weight_grams', { ascending: false });

  const ingredsByDish: Record<string, RawDishIngredient[]> = {};
  for (const di of ((diRows ?? []) as unknown) as RawDishIngredient[]) {
    if (!ingredsByDish[di.dish_id]) ingredsByDish[di.dish_id] = [];
    ingredsByDish[di.dish_id].push(di);
  }

  return dishes.map(dish => buildDishWithAllergens(dish, ingredsByDish[dish.id] ?? []));
}

export async function createDish(venueId: string, name: string, description?: string): Promise<Dish> {
  const db = getDb();
  const dish: Dish = { id: crypto.randomUUID(), venue_id: venueId, name, description: description ?? null, available: true, created_at: unixNow() };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.from('dishes').insert({ ...dish, available: 1 } as any);
  return dish;
}

export async function updateDish(id: string, name: string, description?: string, available?: boolean): Promise<void> {
  const db = getDb();
  await db.from('dishes').update({
    name,
    description: description ?? null,
    available: available !== false ? 1 : 0,
  } as any).eq('id', id);
}

export async function deleteDish(id: string): Promise<void> {
  const db = getDb();
  await db.from('dishes').delete().eq('id', id);
}

export async function setDishIngredients(
  dishId: string,
  items: Array<{ ingredient_id: string; weight_grams: number }>
): Promise<void> {
  const db = getDb();
  await db.from('dish_ingredients').delete().eq('dish_id', dishId);
  if (items.length > 0) {
    await db.from('dish_ingredients').insert(
      items.map(item => ({ id: crypto.randomUUID(), dish_id: dishId, ...item })) as any // eslint-disable-line @typescript-eslint/no-explicit-any
    );
  }
}

// ── Access checks used by API routes ─────────────────────────────────────────

export async function ingredientBelongsToUser(userId: string, ingredientId: string): Promise<boolean> {
  const db = getDb();
  const { data: ing } = await db.from('ingredients').select('venue_id').eq('id', ingredientId).maybeSingle();
  if (!ing) return false;
  return userOwnsVenue(userId, (ing as Record<string, unknown>).venue_id as string);
}

export async function dishBelongsToUser(userId: string, dishId: string): Promise<boolean> {
  const db = getDb();
  const { data: dish } = await db.from('dishes').select('venue_id').eq('id', dishId).maybeSingle();
  if (!dish) return false;
  return userOwnsVenue(userId, (dish as Record<string, unknown>).venue_id as string);
}
