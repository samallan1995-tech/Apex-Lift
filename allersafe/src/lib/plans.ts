// Client-safe plan/pricing constants and helpers (no Stripe SDK import).

export type PlanKey = 'single' | 'multi';
export type BillingInterval = 'month' | 'year';

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceGBP: number;
  /** Annual price ("2 months free" vs 12 × monthly). */
  annualPriceGBP: number;
  venueLimit: number;
  blurb: string;
  /** Env var holding the Stripe recurring monthly Price ID. */
  priceEnv: 'STRIPE_PRICE_SINGLE' | 'STRIPE_PRICE_MULTI';
  /** Env var holding the Stripe recurring annual Price ID. */
  priceEnvAnnual: 'STRIPE_PRICE_SINGLE_ANNUAL' | 'STRIPE_PRICE_MULTI_ANNUAL';
  features: string[];
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  single: {
    key: 'single',
    name: 'Single site',
    priceGBP: 15,
    annualPriceGBP: 150,
    venueLimit: 1,
    blurb: 'One venue',
    priceEnv: 'STRIPE_PRICE_SINGLE',
    priceEnvAnnual: 'STRIPE_PRICE_SINGLE_ANNUAL',
    features: [
      '1 venue',
      'Unlimited ingredients & dishes',
      'Allergen matrix PDF',
      "Natasha's Law PPDS labels",
      'Public QR allergen menu',
    ],
  },
  multi: {
    key: 'multi',
    name: 'Multi-site',
    priceGBP: 29,
    annualPriceGBP: 290,
    venueLimit: 5,
    blurb: 'Up to 5 venues',
    priceEnv: 'STRIPE_PRICE_MULTI',
    priceEnvAnnual: 'STRIPE_PRICE_MULTI_ANNUAL',
    features: [
      'Up to 5 venues',
      'Everything in Single site',
      'Per-venue QR menus',
      'Switch venues in one click',
      'Priority email support',
    ],
  },
};

/** One-off "we'll import your menu" onboarding add-on. */
export const SETUP_ADDON = {
  key: 'setup' as const,
  name: 'Menu import setup',
  priceGBP: 49,
  blurb: "We'll import your menu",
  priceEnv: 'STRIPE_PRICE_SETUP' as const,
};

/** Baseline venue allowance for an account with no active subscription.
 *  0 = no free tier; a paid plan is required before any venue can be created. */
export const FREE_VENUE_LIMIT = 0;

/** Length of the no-card free trial every new account gets at first sign-in. */
export const TRIAL_DAYS = 14;

/** Plan whose limits a trial account gets (1 venue, full feature access). */
export const TRIAL_PLAN: PlanKey = 'single';

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function isActiveStatus(status: string | null | undefined): boolean {
  return !!status && ACTIVE_STATUSES.has(status);
}

/**
 * True when the account has a real, Stripe-backed subscription that grants
 * access (active, in a Stripe-managed trial, or past_due in grace). When this is
 * false the account falls back to the no-card free trial, which is derived from
 * the account's age — so an `incomplete`/abandoned checkout or a missing row
 * never locks a new user out during their first {@link TRIAL_DAYS} days.
 */
export function hasPaidAccess(
  status: string | null | undefined,
  stripeSubscriptionId: string | null | undefined
): boolean {
  return !!stripeSubscriptionId && isActiveStatus(status);
}

/** Venue allowance for a given plan + status. */
export function venueLimitFor(
  plan: string | null | undefined,
  status: string | null | undefined
): number {
  if (isActiveStatus(status) && plan && plan in PLANS) {
    return PLANS[plan as PlanKey].venueLimit;
  }
  return FREE_VENUE_LIMIT;
}
