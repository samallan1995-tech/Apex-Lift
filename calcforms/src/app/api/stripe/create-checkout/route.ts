import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const PRICE_IDS: Record<string, string> = {
  solo: process.env.STRIPE_PRICE_SOLO || '',
  team: process.env.STRIPE_PRICE_TEAM || '',
  firm: process.env.STRIPE_PRICE_FIRM || '',
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan } = await request.json()
  const priceId = PRICE_IDS[plan]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

  // Get or create stripe customer
  const { data: org } = await supabase
    .from('orgs')
    .select('id, stripe_customer_id, name')
    .eq('owner_id', user.id)
    .single()

  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 })

  let customerId = org.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.name,
      metadata: { org_id: org.id, user_id: user.id },
    })
    customerId = customer.id
    await supabase.from('orgs').update({ stripe_customer_id: customerId }).eq('id', org.id)
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?cancelled=1`,
    metadata: { org_id: org.id, plan },
    subscription_data: {
      trial_period_days: 14,
      metadata: { org_id: org.id, plan },
    },
  })

  return NextResponse.json({ url: session.url })
}
