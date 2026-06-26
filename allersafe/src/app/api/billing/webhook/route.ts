import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';
import {
  getSubscriptionByCustomerId,
  updateSubscription,
} from '@/lib/queries';

export const runtime = 'nodejs';
// Stripe needs the raw, unparsed request body for signature verification.
export const dynamic = 'force-dynamic';

/** Resolve our internal userId for a Stripe object via metadata or customer lookup. */
async function resolveUserId(
  metadataUserId: string | undefined,
  customerId: string | null
): Promise<string | null> {
  if (metadataUserId) return metadataUserId;
  if (customerId) {
    const sub = await getSubscriptionByCustomerId(customerId);
    if (sub) return sub.user_id;
  }
  return null;
}

function applySubscription(userId: string, sub: Stripe.Subscription) {
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = planForPriceId(priceId);
  const periodEnd =
    (sub as unknown as { current_period_end?: number }).current_period_end ?? null;
  return updateSubscription(userId, {
    plan,
    status: sub.status,
    stripe_subscription_id: sub.id,
    current_period_end: periodEnd,
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 });

  const stripe = getStripe();
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const cs = event.data.object as Stripe.Checkout.Session;
        const customerId = (cs.customer as string) ?? null;
        const userId = await resolveUserId(cs.metadata?.userId, customerId);
        if (!userId) break;

        if (cs.mode === 'payment' && cs.metadata?.product === 'setup') {
          await updateSubscription(userId, { setup_paid: true });
        } else if (cs.mode === 'subscription' && cs.subscription) {
          const sub = await stripe.subscriptions.retrieve(cs.subscription as string);
          await applySubscription(userId, sub);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = (sub.customer as string) ?? null;
        const userId = await resolveUserId(sub.metadata?.userId, customerId);
        if (!userId) break;

        if (event.type === 'customer.subscription.deleted') {
          await updateSubscription(userId, {
            plan: null,
            status: 'canceled',
            stripe_subscription_id: null,
          });
        } else {
          await applySubscription(userId, sub);
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
