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
- Turso (libSQL) database — zero cold-start, free tier available
- No AI used — near-zero marginal cost

## Tech stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS
- Turso (libSQL) via `@libsql/client`
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

### 1. Turso database

Install the Turso CLI and create a database:

```bash
brew install tursodatabase/tap/turso
turso auth login
turso db create allersafe
turso db show allersafe          # copy the URL
turso db tokens create allersafe # copy the token
```

Set in `.env.local`:
```
TURSO_DATABASE_URL=libsql://allersafe-yourname.turso.io
TURSO_AUTH_TOKEN=your-token-here
```

The database schema is created automatically on first startup via the Next.js instrumentation hook.

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

The `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` must be set in Vercel's project settings.

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
│   │   ├── api/              # API routes (auth, venues, ingredients, dishes, pdf)
│   │   ├── dashboard/        # Protected dashboard pages
│   │   ├── menu/[slug]/      # Public QR allergen menu
│   │   └── page.tsx          # Login page
│   ├── components/
│   │   ├── pdf/              # @react-pdf/renderer documents
│   │   └── ui/               # Reusable UI components
│   └── lib/
│       ├── allergens.ts      # UK FSA 14 allergen definitions
│       ├── db.ts             # Turso client + schema init
│       ├── queries.ts        # Database query helpers
│       ├── session.ts        # iron-session config
│       └── venue-context.tsx # React context for active venue
└── .env.example
```
