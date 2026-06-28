import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const orgId = session.metadata?.org_id
      const plan = session.metadata?.plan
      const subscriptionId = session.subscription as string

      if (orgId && plan) {
        await supabase.from('orgs').update({
          plan,
          stripe_subscription_id: subscriptionId,
        }).eq('id', orgId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.org_id
      const plan = sub.metadata?.plan

      if (orgId && plan) {
        const status = sub.status
        const activePlan = ['active', 'trialing'].includes(status) ? plan : 'solo'
        await supabase.from('orgs').update({ plan: activePlan }).eq('id', orgId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const orgId = sub.metadata?.org_id
      if (orgId) {
        await supabase.from('orgs').update({
          plan: 'solo',
          stripe_subscription_id: null,
        }).eq('id', orgId)
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      console.warn('Payment failed for customer:', invoice.customer)
      break
    }
  }

  return NextResponse.json({ received: true })
}
