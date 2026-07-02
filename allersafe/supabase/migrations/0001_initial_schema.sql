-- AllerSafe — initial schema (reconstructed from src/types.ts + src/lib/queries.ts)
-- Safe to run against the existing project: every statement is IF NOT EXISTS,
-- so already-present tables are left untouched.
--
-- Conventions used by the app:
--   * Primary keys are app-generated UUIDs (crypto.randomUUID()), stored as uuid.
--   * Timestamps are unix epoch SECONDS stored as bigint (the app uses unixNow()).
--   * Boolean-ish flags the app writes as 1/0 (allergens, dishes.available,
--     magic_codes.used) are smallint; subscriptions.setup_paid is a real boolean.

-- ── users ──────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id          uuid primary key,
  email       text not null unique,
  created_at  bigint not null
);

-- ── magic_codes (one-time email login codes) ────────────────────────────────
create table if not exists public.magic_codes (
  id          uuid primary key,
  email       text not null,
  code        text not null,
  expires_at  bigint not null,
  used        smallint not null default 0,
  created_at  bigint not null default extract(epoch from now())::bigint
);
create index if not exists magic_codes_email_idx on public.magic_codes (email);
create index if not exists magic_codes_expires_idx on public.magic_codes (expires_at);

-- ── venues ─────────────────────────────────────────────────────────────────
create table if not exists public.venues (
  id          uuid primary key,
  name        text not null,
  slug        text not null unique,
  address     text,
  created_by  uuid not null references public.users (id) on delete cascade,
  created_at  bigint not null
);

-- ── user_venues (membership / ownership) ────────────────────────────────────
create table if not exists public.user_venues (
  user_id   uuid not null references public.users (id) on delete cascade,
  venue_id  uuid not null references public.venues (id) on delete cascade,
  role      text not null default 'owner',
  primary key (user_id, venue_id)
);
create index if not exists user_venues_user_idx on public.user_venues (user_id);
create index if not exists user_venues_venue_idx on public.user_venues (venue_id);

-- ── ingredients (with the 14 UK named allergens) ────────────────────────────
create table if not exists public.ingredients (
  id              uuid primary key,
  venue_id        uuid not null references public.venues (id) on delete cascade,
  name            text not null,
  notes           text,
  created_at      bigint not null,
  celery          smallint not null default 0,
  cereals_gluten  smallint not null default 0,
  crustaceans     smallint not null default 0,
  eggs            smallint not null default 0,
  fish            smallint not null default 0,
  lupin           smallint not null default 0,
  milk            smallint not null default 0,
  molluscs        smallint not null default 0,
  mustard         smallint not null default 0,
  peanuts         smallint not null default 0,
  sesame          smallint not null default 0,
  soybeans        smallint not null default 0,
  sulphites       smallint not null default 0,
  tree_nuts       smallint not null default 0
);
create index if not exists ingredients_venue_idx on public.ingredients (venue_id);

-- ── dishes ─────────────────────────────────────────────────────────────────
create table if not exists public.dishes (
  id           uuid primary key,
  venue_id     uuid not null references public.venues (id) on delete cascade,
  name         text not null,
  description  text,
  available    smallint not null default 1,
  created_at   bigint not null
);
create index if not exists dishes_venue_idx on public.dishes (venue_id);

-- ── dish_ingredients (recipe lines) ─────────────────────────────────────────
create table if not exists public.dish_ingredients (
  id             uuid primary key,
  dish_id        uuid not null references public.dishes (id) on delete cascade,
  ingredient_id  uuid not null references public.ingredients (id) on delete cascade,
  weight_grams   numeric not null default 0
);
create index if not exists dish_ingredients_dish_idx on public.dish_ingredients (dish_id);
create index if not exists dish_ingredients_ingredient_idx on public.dish_ingredients (ingredient_id);

-- ── allersafe_subscriptions (Stripe billing state) ──────────────────────────
create table if not exists public.allersafe_subscriptions (
  user_id                 uuid primary key references public.users (id) on delete cascade,
  stripe_customer_id      text,
  stripe_subscription_id  text,
  plan                    text,
  status                  text not null default 'none',
  venue_limit             integer not null default 0,
  setup_paid              boolean not null default false,
  current_period_end      bigint,
  created_at              bigint not null,
  updated_at              bigint not null
);
create index if not exists subs_customer_idx on public.allersafe_subscriptions (stripe_customer_id);

-- ── Row-Level Security ──────────────────────────────────────────────────────
-- The app connects with the Supabase ANON key from the SERVER only and runs its
-- own auth (iron-session magic codes) — it does NOT use Supabase Auth, so
-- auth.uid() is always null and uid-based RLS policies would block everything.
--
-- Tables created via raw SQL have RLS DISABLED by default, which is what makes
-- the current app work. That is acceptable ONLY because the anon key never
-- reaches the browser (it's SUPABASE_ANON_KEY, not NEXT_PUBLIC_*).
--
-- RECOMMENDED hardening (do this as a follow-up, not required to launch):
--   1. Switch src/lib/db.ts to use the SUPABASE_SERVICE_ROLE key (server-only).
--   2. Enable RLS on every table below so the public anon key can't read/write:
--        alter table public.users                  enable row level security;
--        alter table public.magic_codes            enable row level security;
--        alter table public.venues                 enable row level security;
--        alter table public.user_venues            enable row level security;
--        alter table public.ingredients            enable row level security;
--        alter table public.dishes                 enable row level security;
--        alter table public.dish_ingredients       enable row level security;
--        alter table public.allersafe_subscriptions enable row level security;
--   The service_role key bypasses RLS, so the app keeps working while the public
--   anon key is locked out. Do NOT enable RLS without switching to service_role
--   first, or the live app will break.
