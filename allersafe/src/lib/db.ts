import { createClient } from '@supabase/supabase-js';

let client: ReturnType<typeof createClient> | null = null;

export function getDb() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    // Prefer the service-role key: it bypasses Row-Level Security, which lets us
    // turn RLS ON and lock the public anon key out of the database entirely.
    // Falls back to the anon key when service-role isn't configured yet, so this
    // deploy is a no-op until SUPABASE_SERVICE_ROLE_KEY is set in the environment.
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and a Supabase key (service role or anon) are required');
    }
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

export function unixNow(): number {
  return Math.floor(Date.now() / 1000);
}
