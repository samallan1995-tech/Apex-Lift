// Client-safe plan/pricing constants and helpers (no Stripe SDK import).

export type PlanKey = 'single' | 'multi';

export interface PlanConfig {
  key: PlanKey;
  name: string;
  priceGBP: number;
  venueLimit: number;
  blurb: string;
  /** Env var holding the Stripe recurring Price ID. */
  priceEnv: 'STRIPE_PRICE_SINGLE' | 'STRIPE_PRICE_MULTI';
  features: string[];
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  single: {
    key: 'single',
    name: 'Single site',
    priceGBP: 15,
    venueLimit: 1,
    blurb: 'One venue',
    priceEnv: 'STRIPE_PRICE_SINGLE',
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
    venueLimit: 5,
    blurb: 'Up to 5 venues',
    priceEnv: 'STRIPE_PRICE_MULTI',
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

const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);

export function isActiveStatus(status: string | null | undefined): boolean {
  return !!status && ACTIVE_STATUSES.has(status);
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
