# Deploying AllerSafe to Vercel

The Supabase database is already provisioned and migrated. Deployment just needs
a Vercel project with the right environment variables.

## Fully automated (recommended)

From a Claude Code web session whose **network policy allows `api.vercel.com`**
(or any machine with the Vercel CLI), set the environment variables below and run:

```bash
cd allersafe
bash scripts/deploy.sh
```

The script creates/links the Vercel project, sets all env vars on production,
and deploys. It is idempotent — safe to re-run.

### Required environment variables

| Variable | Notes |
|---|---|
| `VERCEL_TOKEN` | From https://vercel.com/account/tokens |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `IRON_SESSION_PASSWORD` | 32+ random chars for the session cookie |
| `RESEND_API_KEY` | Resend API key |
| `RESEND_FROM_EMAIL` | From address for login emails (e.g. `onboarding@resend.dev`, or your verified domain) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_live_…` / `sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret (`whsec_…`) |
| `STRIPE_PRICE_SINGLE` | Price ID for Single site — £15/mo |
| `STRIPE_PRICE_MULTI` | Price ID for Multi-site — £29/mo |
| `STRIPE_PRICE_SETUP` | Price ID for the one-off setup add-on — £49 |

Optional: `NEXT_PUBLIC_APP_URL` (production URL for Stripe redirects),
`VERCEL_TEAM` (default `samallan1995-6674s-projects`), `VERCEL_PROJECT` (default `allersafe`).

## Stripe setup (one-time)

1. In the [Stripe Dashboard](https://dashboard.stripe.com) → **Products**, create:
   - **Single site** — recurring £15/month → copy its **Price ID** → `STRIPE_PRICE_SINGLE`
   - **Multi-site** — recurring £29/month → copy its **Price ID** → `STRIPE_PRICE_MULTI`
   - **Menu import setup** — one-off £49 → copy its **Price ID** → `STRIPE_PRICE_SETUP`
2. **Developers → Webhooks → Add endpoint**:
   - URL: `https://<your-app>/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`,
     `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`
3. Redeploy (or re-run `scripts/deploy.sh`) so the new env vars take effect.

### Plan → venue limits

| Plan | Price | Venues |
|---|---|---|
| Free / no subscription | — | 1 |
| Single site | £15/mo | 1 |
| Multi-site | £29/mo | 5 |

Venue creation is blocked with HTTP 402 once the limit is reached, and the UI
prompts the user to upgrade. Limits are recomputed from the live Stripe
subscription status on every webhook.

> Secrets are **never** committed to this repo. Provide them via the environment
> (the Claude Code web environment config can store them, or export them in your shell).

## Manual (Vercel dashboard)

1. https://vercel.com/new → Import Git Repository → **Apex-Lift**
2. **Root Directory** → `allersafe`
3. Add the environment variables from the table above
4. **Deploy**

## Runtime config notes

- The Supabase anon key is used **server-side only** (no `NEXT_PUBLIC_` prefix),
  and RLS is disabled because authorization is enforced by `iron-session` in the
  API routes. Do not expose this key to the browser.
- `RESEND_FROM_EMAIL` must be on a domain verified in Resend, or use
  `onboarding@resend.dev` for testing.
