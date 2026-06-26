/**
 * Storage abstraction — uses Turso (libSQL) when TURSO_DATABASE_URL +
 * TURSO_AUTH_TOKEN are set, falls back to localStorage in the browser.
 *
 * Server-side API routes always use Turso when available; client components
 * call through the /api/* layer so they never need to touch libSQL directly.
 */

import type { Invoice, CompanySettings, ReminderSchedule } from './types';

// ---------------------------------------------------------------------------
// Turso helpers (server-only)
// ---------------------------------------------------------------------------

let _tursoClient: import('@libsql/client').Client | null = null;

async function getTursoClient() {
  if (_tursoClient) return _tursoClient;
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;
  if (!url || !token) return null;

  const { createClient } = await import('@libsql/client');
  _tursoClient = createClient({ url, authToken: token });
  await migrateDb(_tursoClient);
  return _tursoClient;
}

async function migrateDb(client: import('@libsql/client').Client) {
  await client.batch([
    {
      sql: `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS reminders (
        id TEXT PRIMARY KEY,
        invoice_id TEXT NOT NULL,
        data TEXT NOT NULL
      )`,
      args: [],
    },
    {
      sql: `CREATE TABLE IF NOT EXISTS magic_codes (
        email TEXT PRIMARY KEY,
        code TEXT NOT NULL,
        expires_at INTEGER NOT NULL
      )`,
      args: [],
    },
  ], 'write');
}

// ---------------------------------------------------------------------------
// Invoice CRUD
// ---------------------------------------------------------------------------

export async function dbGetInvoices(): Promise<Invoice[]> {
  const db = await getTursoClient();
  if (!db) return [];
  const result = await db.execute('SELECT data FROM invoices ORDER BY created_at DESC');
  return result.rows.map((r) => JSON.parse(r.data as string) as Invoice);
}

export async function dbGetInvoice(id: string): Promise<Invoice | null> {
  const db = await getTursoClient();
  if (!db) return null;
  const result = await db.execute({ sql: 'SELECT data FROM invoices WHERE id = ?', args: [id] });
  if (!result.rows[0]) return null;
  return JSON.parse(result.rows[0].data as string) as Invoice;
}

export async function dbSaveInvoice(invoice: Invoice): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({
    sql: `INSERT INTO invoices (id, data, created_at, updated_at)
          VALUES (?, ?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
    args: [invoice.id, JSON.stringify(invoice), invoice.createdAt, invoice.updatedAt],
  });
}

export async function dbDeleteInvoice(id: string): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({ sql: 'DELETE FROM invoices WHERE id = ?', args: [id] });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function dbGetSettings(): Promise<Partial<CompanySettings>> {
  const db = await getTursoClient();
  if (!db) return {};
  const result = await db.execute("SELECT value FROM settings WHERE key = 'company'");
  if (!result.rows[0]) return {};
  return JSON.parse(result.rows[0].value as string);
}

export async function dbSaveSettings(settings: CompanySettings): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES ('company', ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    args: [JSON.stringify(settings)],
  });
}

// ---------------------------------------------------------------------------
// Magic codes (auth)
// ---------------------------------------------------------------------------

export async function dbSaveMagicCode(email: string, code: string, expiresAt: number): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({
    sql: `INSERT INTO magic_codes (email, code, expires_at) VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET code = excluded.code, expires_at = excluded.expires_at`,
    args: [email, code, expiresAt],
  });
}

export async function dbGetMagicCode(email: string): Promise<{ code: string; expiresAt: number } | null> {
  const db = await getTursoClient();
  if (!db) return null;
  const result = await db.execute({
    sql: 'SELECT code, expires_at FROM magic_codes WHERE email = ?',
    args: [email],
  });
  if (!result.rows[0]) return null;
  return { code: result.rows[0].code as string, expiresAt: result.rows[0].expires_at as number };
}

export async function dbDeleteMagicCode(email: string): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({ sql: 'DELETE FROM magic_codes WHERE email = ?', args: [email] });
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

export async function dbGetReminders(invoiceId?: string): Promise<ReminderSchedule[]> {
  const db = await getTursoClient();
  if (!db) return [];
  const result = invoiceId
    ? await db.execute({ sql: 'SELECT data FROM reminders WHERE invoice_id = ?', args: [invoiceId] })
    : await db.execute('SELECT data FROM reminders');
  return result.rows.map((r) => JSON.parse(r.data as string) as ReminderSchedule);
}

export async function dbSaveReminder(reminder: ReminderSchedule): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({
    sql: `INSERT INTO reminders (id, invoice_id, data) VALUES (?, ?, ?)
          ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
    args: [reminder.id, reminder.invoiceId, JSON.stringify(reminder)],
  });
}

export async function dbDeleteReminder(id: string): Promise<void> {
  const db = await getTursoClient();
  if (!db) return;
  await db.execute({ sql: 'DELETE FROM reminders WHERE id = ?', args: [id] });
}

export function isTursoConfigured(): boolean {
  return !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);
}
