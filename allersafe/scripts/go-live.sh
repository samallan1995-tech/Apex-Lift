#!/usr/bin/env bash
#
# AllerSafe — full go-live in one shot:
#   1. Creates the three Stripe products/prices (£15/mo, £29/mo, £49 one-off)
#   2. Links the Vercel project and sets every environment variable
#   3. Deploys to production
#   4. Creates the Stripe webhook against the live URL and redeploys with its secret
#
# Secret-free: every credential is read from the environment. Run from any
# machine (or a Claude Code session) whose network can reach Stripe + Vercel.
#
# Required env:
#   VERCEL_TOKEN, STRIPE_SECRET_KEY,
#   SUPABASE_URL, SUPABASE_ANON_KEY, IRON_SESSION_PASSWORD,
#   RESEND_API_KEY, RESEND_FROM_EMAIL
# Optional env:
#   VERCEL_TEAM (default samallan1995-6674s-projects), VERCEL_PROJECT (default allersafe)
#
# Usage:  cd allersafe && bash scripts/go-live.sh
#
set -euo pipefail

TEAM="${VERCEL_TEAM:-samallan1995-6674s-projects}"
PROJECT="${VERCEL_PROJECT:-allersafe}"

missing=()
for v in VERCEL_TOKEN STRIPE_SECRET_KEY SUPABASE_URL SUPABASE_ANON_KEY \
         IRON_SESSION_PASSWORD RESEND_API_KEY RESEND_FROM_EMAIL; do
  [ -n "${!v:-}" ] || missing+=("$v")
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "ERROR: missing required env vars: ${missing[*]}" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/.."
command -v vercel >/dev/null 2>&1 || npm install -g vercel

sk ()  { curl -fsS https://api.stripe.com/v1/"$1" -u "$STRIPE_SECRET_KEY": "${@:2}"; }
jget () { python3 -c "import sys,json;print(json.load(sys.stdin)$1)"; }

# Reuse pre-created Price IDs if supplied (STRIPE_PRICE_*), otherwise create them.
if [ -n "${STRIPE_PRICE_SINGLE:-}" ] && [ -n "${STRIPE_PRICE_MULTI:-}" ] && [ -n "${STRIPE_PRICE_SETUP:-}" ]; then
  PRICE_SINGLE="$STRIPE_PRICE_SINGLE"
  PRICE_MULTI="$STRIPE_PRICE_MULTI"
  PRICE_SETUP="$STRIPE_PRICE_SETUP"
  echo "▶ Using existing Stripe prices: single=$PRICE_SINGLE multi=$PRICE_MULTI setup=$PRICE_SETUP"
else
  echo "▶ Creating Stripe products & prices…"
  PRICE_SINGLE=$(sk prices -d "unit_amount=1500" -d "currency=gbp" \
    -d "recurring[interval]=month" -d "product_data[name]=AllerSafe — Single site" | jget "['id']")
  PRICE_MULTI=$(sk prices -d "unit_amount=2900" -d "currency=gbp" \
    -d "recurring[interval]=month" -d "product_data[name]=AllerSafe — Multi-site" | jget "['id']")
  PRICE_SETUP=$(sk prices -d "unit_amount=4900" -d "currency=gbp" \
    -d "product_data[name]=AllerSafe — Menu import setup" | jget "['id']")
  echo "  single=$PRICE_SINGLE  multi=$PRICE_MULTI  setup=$PRICE_SETUP"
fi

VC=(vercel --token "$VERCEL_TOKEN" --scope "$TEAM")
echo "▶ Linking Vercel project…"
"${VC[@]}" link --yes --project "$PROJECT" >/dev/null

set_env () {
  "${VC[@]}" env rm "$1" production --yes >/dev/null 2>&1 || true
  printf '%s' "$2" | "${VC[@]}" env add "$1" production >/dev/null
  echo "  set $1"
}
echo "▶ Setting environment variables…"
set_env SUPABASE_URL          "$SUPABASE_URL"
set_env SUPABASE_ANON_KEY     "$SUPABASE_ANON_KEY"
set_env IRON_SESSION_PASSWORD "$IRON_SESSION_PASSWORD"
set_env RESEND_API_KEY        "$RESEND_API_KEY"
set_env RESEND_FROM_EMAIL     "$RESEND_FROM_EMAIL"
set_env STRIPE_SECRET_KEY     "$STRIPE_SECRET_KEY"
set_env STRIPE_PRICE_SINGLE   "$PRICE_SINGLE"
set_env STRIPE_PRICE_MULTI    "$PRICE_MULTI"
set_env STRIPE_PRICE_SETUP    "$PRICE_SETUP"

echo "▶ First production deploy…"
"${VC[@]}" deploy --prod --yes >/dev/null

# Resolve the stable production alias (what the webhook must target — not a
# per-deploy URL, so it keeps pointing at the newest production deployment).
PROD_HOST=$(curl -fsS "https://api.vercel.com/v9/projects/$PROJECT?teamId=$TEAM" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | python3 -c "import sys,json
d=json.load(sys.stdin)
t=(d.get('targets') or {}).get('production') or {}
al=[a for a in (t.get('alias') or []) if a.endswith('.vercel.app')]
print(sorted(al,key=len)[0] if al else d['name']+'.vercel.app')")
APP_URL="https://$PROD_HOST"
echo "  production URL: $APP_URL"

echo "▶ Creating Stripe webhook…"
WHSEC=$(sk webhook_endpoints \
  -d "url=$APP_URL/api/billing/webhook" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.created" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=customer.subscription.deleted" | jget "['secret']")

set_env STRIPE_WEBHOOK_SECRET "$WHSEC"
set_env NEXT_PUBLIC_APP_URL   "$APP_URL"

echo "▶ Redeploying with webhook secret…"
"${VC[@]}" deploy --prod --yes >/dev/null

echo
echo "✅ AllerSafe is live: $APP_URL"
echo "   Pricing: $APP_URL/pricing — test checkout with card 4242 4242 4242 4242"
