import Stripe from 'stripe';
import { PLANS } from './plans';

let stripe: Stripe | null = null;

/** Lazily-initialised Stripe client (server-side only). */
export function getStripe(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

/** Map a Stripe Price ID (monthly or annual) back to one of our plan keys. */
export function planForPriceId(priceId: string | null | undefined): keyof typeof PLANS | null {
  if (!priceId) return null;
  if (priceId === process.env.STRIPE_PRICE_SINGLE) return 'single';
  if (priceId === process.env.STRIPE_PRICE_SINGLE_ANNUAL) return 'single';
  if (priceId === process.env.STRIPE_PRICE_MULTI) return 'multi';
  if (priceId === process.env.STRIPE_PRICE_MULTI_ANNUAL) return 'multi';
  return null;
}

export { PLANS, SETUP_ADDON } from './plans';
