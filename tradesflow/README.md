# TradesFlow

Job management PWA for small UK trades businesses (plumbers, electricians, gas engineers).

## Features

- **Drag-drop calendar** — Weekly view, drag jobs between engineers and days, conflict detection
- **Job management** — Auto-reference (JOB-001), status tracking, notes
- **SMS reminders** — Twilio integration, automatic 30-min ahead notifications
- **One-click quoting** — PDF generation, Stripe payment links, VAT calculation
- **Customer database** — Search by name/postcode, repeat customer tracking
- **Gas Safe / NICEIC compliance** — Certificate tracking with expiry alerts
- **Offline mode** — Service Worker + IndexedDB, works in areas with poor signal
- **Engineer mobile view** — Simplified today's jobs, mark complete on-site

## Tech Stack

- **Next.js 14** (App Router, PWA)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Twilio** (SMS)
- **Stripe** (Payments + Subscriptions)
- **dnd-kit** (Drag and drop)
- **jsPDF** (PDF generation)

## Setup

### 1. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

### 2. Supabase

1. Create a project at supabase.com
2. Run the migration: `supabase/migrations/001_initial_schema.sql`
3. Copy your project URL and anon key to `.env.local`

### 3. Twilio (SMS)

1. Create account at twilio.com
2. Buy a UK phone number (+44...)
3. Add credentials to `.env.local`

### 4. Stripe (Payments)

1. Create account at stripe.com
2. Get API keys from dashboard
3. Set up webhook endpoint: `https://your-app.vercel.app/api/stripe/webhook`
4. Add credentials to `.env.local`

### 5. Install and Run

```bash
npm install
npm run dev
```

## Deployment (Vercel)

```bash
vercel --prod
```

Add all environment variables in the Vercel dashboard.

## Database Schema

See `supabase/migrations/001_initial_schema.sql` for the full schema with RLS policies.

| Table | Description |
|-------|-------------|
| `users` | Business accounts |
| `engineers` | Field engineers with colour coding |
| `customers` | Customer database |
| `jobs` | Job records with status tracking |
| `quotes` | Quotes with labour/materials/VAT |
| `invoices` | Invoice records |
| `certificates` | Gas Safe / NICEIC certificates |
| `sms_logs` | SMS send history |

## Pricing

- £25/month flat (up to 3 users)
- £10/user/month for additional users
- 14-day free trial, no card required

## Offline Mode

The service worker caches the app shell and static assets. Jobs loaded while online are stored in IndexedDB and remain accessible offline. Changes made offline are queued and synced when connectivity is restored.
