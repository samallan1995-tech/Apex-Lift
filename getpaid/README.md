# GetPaid

**UK late-payment chaser and statutory interest calculator for B2B small businesses.**

GetPaid helps freelancers, agencies, trades, and consultants calculate statutory interest under the **Late Payment of Commercial Debts (Interest) Act 1998**, generate professional demand letters, and track overdue invoices.

---

## Features

- **Free public calculator** — `/calculator`, no login, no database, works offline
- **Invoice tracker** — add and track invoices (Outstanding / Paid / Disputed)
- **Three-step chaser ladder** — Friendly Reminder → Firm Follow-Up → Formal Letter Before Action
- **PDF downloads** — branded PDFs via `@react-pdf/renderer`
- **Statutory interest** — 8% + BoE base rate, daily accrual, fixed-sum compensation per Act
- **Passwordless auth** — magic 6-digit code via Resend, signed httpOnly session cookie
- **localStorage by default** — zero infra required; optional Turso sync for Business plan
- **Auto email reminders** — via Vercel Cron + Resend (optional, Business plan)

---

## Required Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | **YES** | JWT signing secret — min 32 chars. Generate: `openssl rand -base64 32` |
| `RESEND_API_KEY` | Recommended | Resend API key for magic-code emails. Without it, codes are logged to console (dev only). |
| `RESEND_FROM_EMAIL` | Recommended | Verified "From" address in Resend, e.g. `noreply@yourapp.com` |

## Optional Environment Variables

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso libSQL URL — activates server-side persistence and auto-reminders |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `CRON_SECRET` | Secret for `/api/reminders` cron endpoint (optional extra security) |
| `COMPANY_NAME` | Used in cron-triggered emails when Settings aren't accessible server-side |
| `COMPANY_ADDRESS` | Company address for cron emails |
| `COMPANY_CONTACT` | Contact name for cron emails |
| `COMPANY_EMAIL` | Company email for cron emails |
| `ANTHROPIC_API_KEY` | Future: enables AI letter tailoring via `/api/ai` (stub currently) |

---

## Running Locally

```bash
# 1. Clone and install
git clone <repo>
cd getpaid
npm install

# 2. Set up environment
cp .env.example .env.local
# Edit .env.local — set SESSION_SECRET at minimum

# 3. Start dev server
npm run dev
# → http://localhost:3000

# 4. Open the calculator (no login needed)
# → http://localhost:3000/calculator
```

### Dev-mode auth (no Resend)

If `RESEND_API_KEY` is not set, the 6-digit code is printed to your terminal:

```
[GetPaid Auth] Code for you@example.com: 482917 (expires 2024-01-15T10:30:00.000Z)
```

Copy it from the terminal and enter it on the login screen.

---

## Deploying to Vercel

```bash
# 1. Install Vercel CLI (optional but handy)
npm i -g vercel

# 2. Deploy
vercel

# 3. Set environment variables in Vercel dashboard
# → Settings → Environment Variables
# At minimum: SESSION_SECRET
# Add RESEND_API_KEY + RESEND_FROM_EMAIL for email auth
# Add TURSO_* for cloud sync (Business plan)
```

### Required Vercel settings

- **Framework preset**: Next.js (auto-detected)
- **Build command**: `npm run build`
- **Output directory**: `.next`

### Optional: Vercel Cron for auto-reminders

`vercel.json` is pre-configured to run `/api/reminders` daily at 09:00 UTC:

```json
{
  "crons": [
    { "path": "/api/reminders", "schedule": "0 9 * * *" }
  ]
}
```

This requires:
1. A **Vercel Pro** plan (Cron Jobs are a Pro feature)
2. `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` set (reminders need server storage)
3. `RESEND_API_KEY` set
4. Client emails entered on each invoice

Optionally set `CRON_SECRET` and add it as `Authorization: Bearer <secret>` if you want to manually trigger the cron.

---

## Storage Architecture

```
Without Turso:                    With Turso:
┌──────────────────────┐          ┌──────────────────────┐
│ Browser localStorage │          │ Turso (libSQL cloud) │
│ - Invoices           │          │ - Invoices           │
│ - Settings           │          │ - Settings           │
│ - Reminders          │          │ - Reminders          │
└──────────────────────┘          │ - Magic codes        │
(single device, instant,          └──────────────────────┘
 zero cost, fully private)        (multi-device, server-side,
                                   required for auto-reminders)
```

The app detects `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` at startup. If both are present, Turso is used for all server-side storage; otherwise, the client falls back to localStorage.

---

## Statutory Interest Calculation

Implements the **Late Payment of Commercial Debts (Interest) Act 1998** (as amended):

- **Annual rate**: 8% + Bank of England base rate (user-editable, defaults to recent value)
- **Daily interest**: `(amount × annualRate%) / 365`
- **Accrual**: From the day **after** the payment due date
- **Fixed-sum compensation** (one-off per invoice, s.5A):
  - < £1,000 → **£40**
  - £1,000–£9,999.99 → **£70**
  - ≥ £10,000 → **£100**

> **Important**: Always verify the current Bank of England base rate at [bankofengland.co.uk](https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate) before issuing a formal demand. Statutory interest rates change when the BoE base rate changes.

---

## Pricing Tiers

| Tier | Price | Features |
|---|---|---|
| Calculator | Free | Public calculator, no login |
| Solo | £12/mo | + Invoice tracker, chaser letters, PDF downloads |
| Business | £19/mo | + Auto email reminders, Turso cloud sync, multi-device |
| One-off | £29 | Single formal demand pack |

License keys are activated in **Settings → License**. Keys begin with `SOLO-`, `BIZ-`, or `ONE-`.

---

## Disclaimer

Templates and calculations are for **general guidance only — not legal advice**. Always verify the current Bank of England base rate and seek professional legal advice before issuing a Letter Before Action or commencing court proceedings.
