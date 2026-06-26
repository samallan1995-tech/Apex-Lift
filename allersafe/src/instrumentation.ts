export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initSchema } = await import('./lib/db');
    try {
      await initSchema();
      console.log('[AllerSafe] Database schema initialised');
    } catch (err) {
      console.warn('[AllerSafe] DB init skipped (no TURSO_DATABASE_URL?):', (err as Error).message);
    }
  }
}
