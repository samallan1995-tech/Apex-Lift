import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature') ?? ''

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 })
  }

  const { default: Stripe } = await import('stripe')
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '')
  } catch {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as import('stripe').Stripe.PaymentIntent
    await supabase
      .from('invoices')
      .update({ paid_at: new Date().toISOString(), payment_method: 'stripe', stripe_payment_intent_id: pi.id })
      .eq('stripe_payment_intent_id', pi.id)
  }

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const sub = event.data.object as import('stripe').Stripe.Subscription
    const customerId = sub.customer as string
    const status = sub.status === 'active' ? 'pro' : 'trial'
    await supabase
      .from('users')
      .update({ subscription_tier: status })
      .eq('stripe_customer_id', customerId)
  }

  return NextResponse.json({ received: true })
}
