#!/usr/bin/env bash
#
# AllerSafe → Vercel one-shot production deploy.
#
# Creates/links the Vercel project, sets all environment variables, and deploys
# to production. Designed to run from a Claude Code web session whose network
# policy permits api.vercel.com (or from any machine with the Vercel CLI).
#
# Required environment variables (no secrets are committed to git):
#   VERCEL_TOKEN            - Vercel API token (vercel.com/account/tokens)
#   SUPABASE_URL           - Supabase project URL
#   SUPABASE_ANON_KEY      - Supabase anon key
#   IRON_SESSION_PASSWORD  - 32+ char random secret for the session cookie
#   RESEND_API_KEY         - Resend API key
#   RESEND_FROM_EMAIL      - From address for magic-code emails
#   STRIPE_SECRET_KEY      - Stripe secret key
#   STRIPE_WEBHOOK_SECRET  - Stripe webhook signing secret
#   STRIPE_PRICE_SINGLE    - Price ID for Single site (£15/mo)
#   STRIPE_PRICE_MULTI     - Price ID for Multi-site (£29/mo)
#   STRIPE_PRICE_SETUP     - Price ID for the one-off setup add-on (£49)
#
# Optional:
#   NEXT_PUBLIC_APP_URL    - production URL for Stripe checkout redirects
#   VERCEL_TEAM            - team slug (default: samallan1995-6674s-projects)
#   VERCEL_PROJECT         - project name (default: allersafe)
#
# Usage:
#   cd allersafe && bash scripts/deploy.sh
#
set -euo pipefail

TEAM="${VERCEL_TEAM:-samallan1995-6674s-projects}"
PROJECT="${VERCEL_PROJECT:-allersafe}"

# ── Preflight: required secrets must be present ─────────────────────────────
missing=()
for v in VERCEL_TOKEN SUPABASE_URL SUPABASE_ANON_KEY IRON_SESSION_PASSWORD \
         RESEND_API_KEY RESEND_FROM_EMAIL STRIPE_SECRET_KEY STRIPE_WEBHOOK_SECRET \
         STRIPE_PRICE_SINGLE STRIPE_PRICE_MULTI STRIPE_PRICE_SETUP; do
  [ -n "${!v:-}" ] || missing+=("$v")
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "ERROR: missing required env vars: ${missing[*]}" >&2
  exit 1
fi

# ── Run from the allersafe app directory ────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."

# ── Tooling ─────────────────────────────────────────────────────────────────
command -v vercel >/dev/null 2>&1 || npm install -g vercel

VC=(vercel --token "$VERCEL_TOKEN" --scope "$TEAM")

# ── Link (creates the project if it doesn't exist) ──────────────────────────
"${VC[@]}" link --yes --project "$PROJECT"

# ── Env vars (production) — idempotent ──────────────────────────────────────
set_env () {
  "${VC[@]}" env rm "$1" production --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | "${VC[@]}" env add "$1" production
}
set_env SUPABASE_URL          "$SUPABASE_URL"
set_env SUPABASE_ANON_KEY     "$SUPABASE_ANON_KEY"
set_env IRON_SESSION_PASSWORD "$IRON_SESSION_PASSWORD"
set_env RESEND_API_KEY        "$RESEND_API_KEY"
set_env RESEND_FROM_EMAIL     "$RESEND_FROM_EMAIL"
set_env STRIPE_SECRET_KEY     "$STRIPE_SECRET_KEY"
set_env STRIPE_WEBHOOK_SECRET "$STRIPE_WEBHOOK_SECRET"
set_env STRIPE_PRICE_SINGLE   "$STRIPE_PRICE_SINGLE"
set_env STRIPE_PRICE_MULTI    "$STRIPE_PRICE_MULTI"
set_env STRIPE_PRICE_SETUP    "$STRIPE_PRICE_SETUP"
[ -n "${NEXT_PUBLIC_APP_URL:-}" ] && set_env NEXT_PUBLIC_APP_URL "$NEXT_PUBLIC_APP_URL"

# ── Deploy ──────────────────────────────────────────────────────────────────
"${VC[@]}" deploy --prod --yes

echo
echo "✅ AllerSafe deployed to production. Live URL printed above."
