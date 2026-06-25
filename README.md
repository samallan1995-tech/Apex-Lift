# ComplianceGuard

UK landlord compliance dashboard built for the Renters' Rights Act 2025.

## Features

- **Property Portfolio Dashboard** — Traffic light system (Red/Amber/Green) for each property
- **Certificate Tracking** — Gas Safety, EPC, EICR, PAT, Legionella with expiry alerts
- **Automated Email Reminders** — 30 and 7-day reminders via Resend
- **Awaab's Law Compliance** — Damp/mould reporting with 7-day assessment, 14-day remediation tracking
- **Tenant Maintenance Portal** — Passwordless portal per property, timestamped audit trail
- **AST Generator** — Compliant 2025 AST PDF with Section 21 abolition & Awaab's Law clauses
- **Compliance Checklist** — Pre-tenancy and ongoing requirements
- **Stripe Subscriptions** — £10/month (3 properties) or £25/month (10 properties), 30-day trial

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Database | Neon (PostgreSQL) |
| Auth | NextAuth v5 (credentials) |
| Email | Resend |
| Payments | Stripe |
| PDF | pdf-lib |
| Styling | Tailwind CSS + shadcn/ui components |

## Setup

### 1. Clone and install

```bash
git clone <repo>
cd complianceguard
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:
- `DATABASE_URL` — Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` — Random secret (`openssl rand -base64 32`)
- `NEXTAUTH_URL` — Your app URL
- `RESEND_API_KEY` — From resend.com
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO` — Stripe price IDs

### 3. Run database migrations

```bash
node scripts/migrate.js
```

### 4. Start development server

```bash
npm run dev
```

### 5. Set up Stripe products (in Stripe Dashboard)

Create two products:
- **Starter**: £10/month, up to 3 properties → copy price ID to `STRIPE_PRICE_STARTER`
- **Pro**: £25/month, up to 10 properties → copy price ID to `STRIPE_PRICE_PRO`

Configure webhook at `/api/stripe/webhook` for events:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

### 6. Set up reminder cron job

Configure a cron job to hit `POST /api/reminders` daily with `Authorization: Bearer <CRON_SECRET>`.

With Vercel Cron (vercel.json):
```json
{
  "crons": [{ "path": "/api/reminders", "schedule": "0 9 * * *" }]
}
```

## Database Schema

```sql
users           -- accounts, subscription tier, Stripe IDs
properties      -- rental properties per user
certificates    -- compliance certs with expiry dates
maintenance_requests  -- tenant maintenance reports with audit trail
ast_agreements  -- generated AST PDFs
compliance_logs -- audit log
```

## Key URLs

| Path | Description |
|------|-------------|
| `/login` | Landlord login |
| `/register` | 30-day free trial signup |
| `/dashboard` | Portfolio overview |
| `/properties/new` | Add property |
| `/properties/[id]` | Property detail + certs + maintenance |
| `/certificates` | All certificates across portfolio |
| `/maintenance` | Maintenance requests + Awaab's Law tracking |
| `/compliance` | Compliance score + matrix |
| `/ast/new` | AST PDF generator |
| `/settings` | Subscription management |
| `/tenant/[token]` | Tenant maintenance portal (no login) |

## Deployment

Deploy to Vercel:

```bash
vercel deploy
```

Set all environment variables in Vercel project settings.

## Awaab's Law Compliance

When a tenant submits a damp/mould report via the tenant portal:
1. Report is timestamped and stored in the database
2. Landlord is emailed with urgent Awaab's Law notification
3. Dashboard shows 7-day assessment deadline and 14-day remediation deadline
4. Overdue deadlines are highlighted in red
5. Resolution notes are recorded for the audit trail

## Renters' Rights Act 2025

The AST generator includes required clauses:
- Section 21 abolition notice
- Awaab's Law obligations
- Deposit protection requirements (30-day window)
- Tenant's right to keep a pet
- Annual rent increase restrictions (2-month notice, once per year)
- Decent Homes Standard obligations
