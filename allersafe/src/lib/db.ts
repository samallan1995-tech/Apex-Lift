import { createClient } from '@libsql/client';

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!client) {
    if (!process.env.TURSO_DATABASE_URL) {
      throw new Error('TURSO_DATABASE_URL is not set');
    }
    client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function initSchema() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS magic_codes (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      used INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      address TEXT,
      created_by TEXT NOT NULL REFERENCES users(id),
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS user_venues (
      user_id TEXT NOT NULL REFERENCES users(id),
      venue_id TEXT NOT NULL REFERENCES venues(id),
      role TEXT NOT NULL DEFAULT 'owner',
      PRIMARY KEY (user_id, venue_id)
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      venue_id TEXT NOT NULL REFERENCES venues(id),
      name TEXT NOT NULL,
      celery INTEGER NOT NULL DEFAULT 0,
      cereals_gluten INTEGER NOT NULL DEFAULT 0,
      crustaceans INTEGER NOT NULL DEFAULT 0,
      eggs INTEGER NOT NULL DEFAULT 0,
      fish INTEGER NOT NULL DEFAULT 0,
      lupin INTEGER NOT NULL DEFAULT 0,
      milk INTEGER NOT NULL DEFAULT 0,
      molluscs INTEGER NOT NULL DEFAULT 0,
      mustard INTEGER NOT NULL DEFAULT 0,
      tree_nuts INTEGER NOT NULL DEFAULT 0,
      peanuts INTEGER NOT NULL DEFAULT 0,
      sesame INTEGER NOT NULL DEFAULT 0,
      soybeans INTEGER NOT NULL DEFAULT 0,
      sulphites INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS dishes (
      id TEXT PRIMARY KEY,
      venue_id TEXT NOT NULL REFERENCES venues(id),
      name TEXT NOT NULL,
      description TEXT,
      available INTEGER NOT NULL DEFAULT 1,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS dish_ingredients (
      id TEXT PRIMARY KEY,
      dish_id TEXT NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
      ingredient_id TEXT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
      weight_grams REAL NOT NULL DEFAULT 0,
      UNIQUE(dish_id, ingredient_id)
    );
  `);
}
