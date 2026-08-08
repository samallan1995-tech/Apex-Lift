import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
});

export const PLANS = {
  STARTER: {
    name: "Starter",
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: 49,
    currency: "gbp",
    limits: {
      clients: 25,
      contracts: 20,
      teamMembers: 1,
    },
  },
  PROFESSIONAL: {
    name: "Professional",
    priceId: process.env.STRIPE_PROFESSIONAL_PRICE_ID!,
    price: 99,
    currency: "gbp",
    limits: {
      clients: Infinity,
      contracts: Infinity,
      teamMembers: 5,
    },
  },
  AGENCY: {
    name: "Agency",
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    price: 199,
    currency: "gbp",
    limits: {
      clients: Infinity,
      contracts: Infinity,
      teamMembers: Infinity,
    },
    features: ["whiteLabel", "customDomain", "customBranding"],
  },
} as const;

export type PlanKey = keyof typeof PLANS;
