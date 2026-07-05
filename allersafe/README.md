# AllerSafe

UK allergen labelling tool for food businesses. Manage your ingredient library, build dishes, auto-roll-up allergen profiles, and generate:

- **Allergen Matrix PDF** — all dishes × 14 UK FSA allergens (printable A4 landscape)
- **PPDS Labels PDF** — Natasha's Law compliant labels with ingredients in descending weight order and allergens in bold/caps
- **Public QR Allergen Menu** — a scannable URL per venue that lets customers filter dishes by allergen

## Features

- UK FSA 14 allergens (celery, cereals containing gluten, crustaceans, eggs, fish, lupin, milk, molluscs, mustard, tree nuts, peanuts, sesame, soybeans, sulphur dioxide & sulphites)
- Ingredient library with allergen tagging
- Dish builder with ingredient quantities (for descending-weight ordering)
- Automatic allergen rollup from ingredients to dishes
- Multi-venue support with a venue switcher
- Magic-code (email OTP) login via Resend — no password required
- Stripe subscription billing with per-tier venue limits
- Supabase (PostgreSQL) database
- No AI used — near-zero marginal cost

## Pricing

| Tier | Price | Venues |
|---|---|---|
| **Single site** | £15/mo | 1 venue |
| **Multi-site** | £29/mo | Up to 5 venues |
| **Setup add-on** | £49 one-off | "We'll import your menu" |

Billing is handled by Stripe Checkout; subscription status is synced via a Stripe
webhook (`/api/billing/webhook`). Venue creation is gated by the active plan's
limit. See [`DEPLOY.md`](./DEPLOY.md) for the one-time Stripe product/webhook setup.

## Tech stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Supabase (PostgreSQL) via `@supabase/supabase-js`
- Stripe for subscriptions & one-off payments
- Resend for transactional email
- iron-session for cookie-based sessions
- @react-pdf/renderer for PDF generation
- qrcode.react for QR codes

---

## Environment setup

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

### 1. Supabase database

Create a project at [supabase.com](https://supabase.com), then apply the schema
(see the migrations in the project, or run the SQL for the `users`, `magic_codes`,
`venues`, `user_venues`, `ingredients`, `dishes`, `dish_ingredients`, and
`allersafe_subscriptions` tables). RLS is disabled — authorization is enforced by
iron-session in the API routes, so the anon key is used **server-side only**.

Set in `.env.local`:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 2. Resend (email)

1. Sign up at [resend.com](https://resend.com)
2. Add and verify your sending domain
3. Create an API key

```
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 3. Session secret

Generate a strong secret (minimum 32 characters):

```bash
openssl rand -base64 32
```

```
IRON_SESSION_PASSWORD=your-generated-secret
```

### 4. Stripe (billing)

Create the three products in the [Stripe Dashboard](https://dashboard.stripe.com)
and a webhook endpoint — full steps in [`DEPLOY.md`](./DEPLOY.md). Then set:

```
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_SINGLE=price_xxx
STRIPE_PRICE_MULTI=price_xxx
STRIPE_PRICE_SETUP=price_xxx
```

---

## Running locally

```bash
cd allersafe
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Set **Root Directory** to `allersafe`
4. Add the environment variables from `.env.local`
5. Deploy

All variables from `.env.example` must be set in Vercel's project settings. For a
fully-scripted deploy, see [`DEPLOY.md`](./DEPLOY.md) and `scripts/deploy.sh`.

> **Stripe webhook:** after the first deploy, add a webhook endpoint pointing at
> `https://<your-app>/api/billing/webhook` and put its signing secret in
> `STRIPE_WEBHOOK_SECRET`. See [`DEPLOY.md`](./DEPLOY.md).

---

## Legal disclaimer

> **AllerSafe is a management aid, not a legal guarantee.**
>
> Your food business remains legally responsible under UK food information legislation (including Regulation (EU) No 1169/2011 as retained in UK law, and the PPDS/Natasha's Law requirements in force from October 2021) for:
>
> - Verifying all allergen declarations against **current supplier specifications** before serving food
> - Checking and managing **cross-contamination risks**
> - Ensuring labels are **accurate and up to date**
> - Staff training and allergen management procedures
>
> Never rely solely on this software. Review your labels against supplier data regularly and consult the [UK Food Standards Agency](https://www.food.gov.uk/business-guidance/allergen-guidance-for-food-businesses) for guidance.

---

## Project structure

```
allersafe/
├── src/
│   ├── app/
│   │   ├── api/              # API routes (auth, venues, ingredients, dishes, pdf, billing)
│   │   ├── dashboard/        # Protected dashboard pages
│   │   ├── menu/[slug]/      # Public QR allergen menu
│   │   └── page.tsx          # Login page
│   ├── components/
│   │   ├── pdf/              # @react-pdf/renderer documents
│   │   └── ui/               # Reusable UI components
│   └── lib/
│       ├── allergens.ts      # UK FSA 14 allergen definitions
│       ├── db.ts             # Supabase client
│       ├── queries.ts        # Database query helpers
│       ├── plans.ts          # Pricing tiers + venue-limit helpers
│       ├── stripe.ts         # Stripe client
│       ├── session.ts        # iron-session config
│       └── venue-context.tsx # React context for active venue
├── scripts/deploy.sh         # Scripted Vercel deploy
└── .env.example
```
