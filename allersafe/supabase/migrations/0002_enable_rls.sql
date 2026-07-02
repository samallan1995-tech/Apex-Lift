-- Lock the public anon key out of the database.
--
-- The app connects with the Supabase SERVICE ROLE key, which bypasses RLS, so
-- enabling RLS with no policies keeps the app fully working while denying the
-- anon/authenticated roles all direct access.
--
-- ⚠️ ORDER MATTERS — apply this ONLY after:
--   1. SUPABASE_SERVICE_ROLE_KEY is set in the Vercel production environment, and
--   2. the app has been redeployed and verified working on that key.
-- If you enable RLS while the app is still using the anon key, every query
-- returns empty and the live site breaks.

alter table public.users                   enable row level security;
alter table public.magic_codes             enable row level security;
alter table public.venues                  enable row level security;
alter table public.user_venues             enable row level security;
alter table public.ingredients             enable row level security;
alter table public.dishes                  enable row level security;
alter table public.dish_ingredients        enable row level security;
alter table public.allersafe_subscriptions enable row level security;

-- Defense in depth: drop the table-level grants the anon/authenticated roles get
-- by default, so even a future RLS misconfiguration can't expose data via the
-- public key. The service_role retains access (it is not affected by these).
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
