import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'placeholder', {
      apiVersion: '2024-06-20',
    })
  }
  return _stripe
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 1000,
    interval: 'month' as const,
    properties: 3,
    priceId: process.env.STRIPE_PRICE_STARTER!,
    description: 'Perfect for accidental landlords with 1–3 properties',
    features: [
      'Up to 3 properties',
      'Certificate tracking & reminders',
      'Awaab\'s Law compliance',
      'AST generator',
      'Tenant maintenance portal',
      'Email reminders',
    ],
  },
  pro: {
    name: 'Pro',
    price: 2500,
    interval: 'month' as const,
    properties: 10,
    priceId: process.env.STRIPE_PRICE_PRO!,
    description: 'For landlords managing up to 10 properties',
    features: [
      'Up to 10 properties',
      'Everything in Starter',
      'Bulk CSV upload',
      'EPC API integration',
      'Compliance reports',
      'Priority support',
    ],
  },
} as const

export type PlanKey = keyof typeof PLANS
