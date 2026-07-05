# Stripe setup — annual prices

Annual billing (£150/yr Single site, £290/yr Multi-site — "2 months free") is fully
wired in the app but needs two Prices created in Stripe and two env vars set.
Until then, the annual toggle shows prices on /pricing, and an annual checkout
returns a friendly "not available yet" message.

## 1. Create the two annual Prices (Stripe Dashboard, LIVE mode)

1. Go to https://dashboard.stripe.com/products — make sure **Test mode is OFF**.
2. Open the product **"AllerSafe — Single site"** → **Add another price**:
   - Amount: **£150.00**, Billing period: **Yearly** → Save.
   - Copy the new Price ID (starts `price_…`).
3. Open **"AllerSafe — Multi-site"** → **Add another price**:
   - Amount: **£290.00**, Billing period: **Yearly** → Save.
   - Copy that Price ID too.

(Adding prices to the *existing* products keeps reporting tidy — don't create new products.)

## 2. Set the env vars in Vercel

Vercel → project **allersafe** → Settings → Environment Variables (Production):

| Key | Value |
|---|---|
| `STRIPE_PRICE_SINGLE_ANNUAL` | the £150/yr price ID |
| `STRIPE_PRICE_MULTI_ANNUAL`  | the £290/yr price ID |

Then **Deployments → ⋯ → Redeploy**.

## 3. Done — no webhook changes needed

The existing webhook maps both monthly and annual Price IDs back to the same
plan entitlements (`planForPriceId` in `src/lib/stripe.ts`), and trial handling
(`trial_end`) works identically for both intervals.
