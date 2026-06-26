import { getDb } from './db';
import { ALLERGEN_KEYS } from './allergens';
import type { AllergenKey } from './allergens';
import type { Ingredient, Dish, DishIngredient, DishWithAllergens, Venue, User } from '@/types';

function boolRow(row: Record<string, unknown>, key: string): boolean {
  return row[key] === 1 || row[key] === true;
}

function rowToIngredient(row: Record<string, unknown>): Ingredient {
  const allergens = Object.fromEntries(
    ALLERGEN_KEYS.map(k => [k, boolRow(row, k)])
  ) as Record<AllergenKey, boolean>;
  return {
    id: row.id as string,
    venue_id: row.venue_id as string,
    name: row.name as string,
    notes: row.notes as string | null,
    created_at: row.created_at as number,
    ...allergens,
  } as Ingredient;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function findOrCreateUser(email: string): Promise<User> {
  const db = getDb();
  const existing = await db.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  if (existing.rows.length > 0) {
    const r = existing.rows[0] as unknown as Record<string, unknown>;
    return { id: r.id as string, email: r.email as string, created_at: r.created_at as number };
  }
  const id = crypto.randomUUID();
  await db.execute({
    sql: 'INSERT INTO users (id, email) VALUES (?, ?)',
    args: [id, email],
  });
  return { id, email, created_at: Math.floor(Date.now() / 1000) };
}

// ── Magic codes ───────────────────────────────────────────────────────────────

export async function createMagicCode(email: string, code: string): Promise<void> {
  const db = getDb();
  const id = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + 15 * 60; // 15 minutes
  await db.execute({
    sql: `INSERT INTO magic_codes (id, email, code, expires_at) VALUES (?, ?, ?, ?)`,
    args: [id, email.toLowerCase(), code, expiresAt],
  });
}

export async function verifyMagicCode(email: string, code: string): Promise<boolean> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const result = await db.execute({
    sql: `SELECT id FROM magic_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > ? ORDER BY created_at DESC LIMIT 1`,
    args: [email.toLowerCase(), code, now],
  });
  if (result.rows.length === 0) return false;
  const id = (result.rows[0] as unknown as Record<string, unknown>).id as string;
  await db.execute({ sql: 'UPDATE magic_codes SET used = 1 WHERE id = ?', args: [id] });
  return true;
}

// ── Venues ────────────────────────────────────────────────────────────────────

export async function getVenuesForUser(userId: string): Promise<Venue[]> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT v.* FROM venues v JOIN user_venues uv ON uv.venue_id = v.id WHERE uv.user_id = ? ORDER BY v.created_at`,
    args: [userId],
  });
  return result.rows.map(r => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      address: row.address as string | null,
      created_by: row.created_by as string,
      created_at: row.created_at as number,
    };
  });
}

export async function getVenueById(id: string): Promise<Venue | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM venues WHERE id = ?', args: [id] });
  if (!result.rows.length) return null;
  const row = result.rows[0] as unknown as Record<string, unknown>;
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    address: row.address as string | null,
    created_by: row.created_by as string,
    created_at: row.created_at as number,
  };
}

export async function getVenueBySlug(slug: string): Promise<Venue | null> {
  const db = getDb();
  const result = await db.execute({ sql: 'SELECT * FROM venues WHERE slug = ?', args: [slug] });
  if (!result.rows.length) return null;
  const row = result.rows[0] as unknown as Record<string, unknown>;
  return {
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    address: row.address as string | null,
    created_by: row.created_by as string,
    created_at: row.created_at as number,
  };
}

export async function userOwnsVenue(userId: string, venueId: string): Promise<boolean> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT 1 FROM user_venues WHERE user_id = ? AND venue_id = ?',
    args: [userId, venueId],
  });
  return result.rows.length > 0;
}

export async function createVenue(
  userId: string,
  name: string,
  slug: string,
  address?: string
): Promise<Venue> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: 'INSERT INTO venues (id, name, slug, address, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, name, slug, address ?? null, userId, now],
  });
  await db.execute({
    sql: 'INSERT INTO user_venues (user_id, venue_id, role) VALUES (?, ?, ?)',
    args: [userId, id, 'owner'],
  });
  return { id, name, slug, address: address ?? null, created_by: userId, created_at: now };
}

export async function updateVenue(id: string, name: string, address?: string): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'UPDATE venues SET name = ?, address = ? WHERE id = ?',
    args: [name, address ?? null, id],
  });
}

export async function deleteVenue(id: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM venues WHERE id = ?', args: [id] });
}

// ── Ingredients ───────────────────────────────────────────────────────────────

export async function getIngredients(venueId: string): Promise<Ingredient[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM ingredients WHERE venue_id = ? ORDER BY name COLLATE NOCASE',
    args: [venueId],
  });
  return result.rows.map(r => rowToIngredient(r as unknown as Record<string, unknown>));
}

export async function createIngredient(
  venueId: string,
  data: Omit<Ingredient, 'id' | 'venue_id' | 'created_at'>
): Promise<Ingredient> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const cols = ['id', 'venue_id', 'name', 'notes', 'created_at', ...ALLERGEN_KEYS];
  const vals = [id, venueId, data.name, data.notes ?? null, now, ...ALLERGEN_KEYS.map(k => (data[k as keyof typeof data] ? 1 : 0))];
  await db.execute({
    sql: `INSERT INTO ingredients (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`,
    args: vals,
  });
  return { ...data, id, venue_id: venueId, created_at: now };
}

export async function updateIngredient(
  id: string,
  data: Omit<Ingredient, 'id' | 'venue_id' | 'created_at'>
): Promise<void> {
  const db = getDb();
  const setCols = ['name', 'notes', ...ALLERGEN_KEYS].map(c => `${c} = ?`).join(', ');
  const vals = [data.name, data.notes ?? null, ...ALLERGEN_KEYS.map(k => (data[k as keyof typeof data] ? 1 : 0)), id];
  await db.execute({ sql: `UPDATE ingredients SET ${setCols} WHERE id = ?`, args: vals });
}

export async function deleteIngredient(id: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM ingredients WHERE id = ?', args: [id] });
}

// ── Dishes ────────────────────────────────────────────────────────────────────

export async function getDishes(venueId: string): Promise<Dish[]> {
  const db = getDb();
  const result = await db.execute({
    sql: 'SELECT * FROM dishes WHERE venue_id = ? ORDER BY name COLLATE NOCASE',
    args: [venueId],
  });
  return result.rows.map(r => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      venue_id: row.venue_id as string,
      name: row.name as string,
      description: row.description as string | null,
      available: boolRow(row, 'available'),
      created_at: row.created_at as number,
    };
  });
}

export async function getDishWithAllergens(dishId: string): Promise<DishWithAllergens | null> {
  const db = getDb();
  const dishRes = await db.execute({ sql: 'SELECT * FROM dishes WHERE id = ?', args: [dishId] });
  if (!dishRes.rows.length) return null;
  const dishRow = dishRes.rows[0] as unknown as Record<string, unknown>;

  const ingredRes = await db.execute({
    sql: `SELECT di.*, i.name as ingredient_name, ${ALLERGEN_KEYS.map(k => `i.${k}`).join(', ')}
          FROM dish_ingredients di
          JOIN ingredients i ON i.id = di.ingredient_id
          WHERE di.dish_id = ?
          ORDER BY di.weight_grams DESC`,
    args: [dishId],
  });

  const ingredients: DishIngredient[] = ingredRes.rows.map(r => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      dish_id: row.dish_id as string,
      ingredient_id: row.ingredient_id as string,
      weight_grams: row.weight_grams as number,
      ingredient_name: row.ingredient_name as string,
      ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, boolRow(row, k)])),
    } as DishIngredient;
  });

  const allergens = Object.fromEntries(
    ALLERGEN_KEYS.map(k => [k, ingredients.some(i => i[k as keyof DishIngredient])])
  ) as Record<AllergenKey, boolean>;

  return {
    id: dishRow.id as string,
    venue_id: dishRow.venue_id as string,
    name: dishRow.name as string,
    description: dishRow.description as string | null,
    available: boolRow(dishRow, 'available'),
    created_at: dishRow.created_at as number,
    allergens,
    ingredients,
  };
}

export async function getDishesWithAllergens(venueId: string): Promise<DishWithAllergens[]> {
  const db = getDb();
  const dishesRes = await db.execute({
    sql: 'SELECT * FROM dishes WHERE venue_id = ? ORDER BY name COLLATE NOCASE',
    args: [venueId],
  });
  const dishes = dishesRes.rows.map(r => {
    const row = r as unknown as Record<string, unknown>;
    return {
      id: row.id as string,
      venue_id: row.venue_id as string,
      name: row.name as string,
      description: row.description as string | null,
      available: boolRow(row, 'available'),
      created_at: row.created_at as number,
    };
  });

  if (dishes.length === 0) return [];

  const ingredRes = await db.execute({
    sql: `SELECT di.*, i.name as ingredient_name, ${ALLERGEN_KEYS.map(k => `i.${k}`).join(', ')}
          FROM dish_ingredients di
          JOIN ingredients i ON i.id = di.ingredient_id
          WHERE di.dish_id IN (${dishes.map(() => '?').join(',')})
          ORDER BY di.weight_grams DESC`,
    args: dishes.map(d => d.id),
  });

  const ingredsByDish: Record<string, DishIngredient[]> = {};
  for (const r of ingredRes.rows) {
    const row = r as unknown as Record<string, unknown>;
    const dishId = row.dish_id as string;
    if (!ingredsByDish[dishId]) ingredsByDish[dishId] = [];
    ingredsByDish[dishId].push({
      id: row.id as string,
      dish_id: dishId,
      ingredient_id: row.ingredient_id as string,
      weight_grams: row.weight_grams as number,
      ingredient_name: row.ingredient_name as string,
      ...Object.fromEntries(ALLERGEN_KEYS.map(k => [k, boolRow(row, k)])),
    } as DishIngredient);
  }

  return dishes.map(dish => {
    const ingredients = ingredsByDish[dish.id] ?? [];
    const allergens = Object.fromEntries(
      ALLERGEN_KEYS.map(k => [k, ingredients.some(i => i[k as keyof DishIngredient])])
    ) as Record<AllergenKey, boolean>;
    return { ...dish, allergens, ingredients };
  });
}

export async function createDish(venueId: string, name: string, description?: string): Promise<Dish> {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: 'INSERT INTO dishes (id, venue_id, name, description, available, created_at) VALUES (?, ?, ?, ?, 1, ?)',
    args: [id, venueId, name, description ?? null, now],
  });
  return { id, venue_id: venueId, name, description: description ?? null, available: true, created_at: now };
}

export async function updateDish(id: string, name: string, description?: string, available?: boolean): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: 'UPDATE dishes SET name = ?, description = ?, available = ? WHERE id = ?',
    args: [name, description ?? null, available !== false ? 1 : 0, id],
  });
}

export async function deleteDish(id: string): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM dishes WHERE id = ?', args: [id] });
}

export async function setDishIngredients(
  dishId: string,
  items: Array<{ ingredient_id: string; weight_grams: number }>
): Promise<void> {
  const db = getDb();
  await db.execute({ sql: 'DELETE FROM dish_ingredients WHERE dish_id = ?', args: [dishId] });
  for (const item of items) {
    await db.execute({
      sql: 'INSERT INTO dish_ingredients (id, dish_id, ingredient_id, weight_grams) VALUES (?, ?, ?, ?)',
      args: [crypto.randomUUID(), dishId, item.ingredient_id, item.weight_grams],
    });
  }
}
