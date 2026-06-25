import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { sql } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId
      const plan = subscription.metadata.plan ?? 'starter'
      const status = subscription.status

      if (userId) {
        await sql`
          UPDATE cg_users
          SET
            subscription_tier = ${plan},
            subscription_status = ${status},
            stripe_subscription_id = ${subscription.id}
          WHERE id = ${userId}
        `
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata.userId

      if (userId) {
        await sql`
          UPDATE cg_users
          SET subscription_tier = 'free', subscription_status = 'cancelled'
          WHERE id = ${userId}
        `
      }
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string
      await sql`
        UPDATE cg_users SET subscription_status = 'past_due'
        WHERE stripe_customer_id = ${customerId}
      `
      break
    }
  }

  return NextResponse.json({ received: true })
}
