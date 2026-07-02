import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getStripe, PLANS, SETUP_ADDON } from '@/lib/stripe';
import { getSubscription, setStripeCustomerId, getUserById, trialEndsAtFor } from '@/lib/queries';
import { hasPaidAccess } from '@/lib/plans';

export const runtime = 'nodejs';

const schema = z.object({ product: z.enum(['single', 'multi', 'setup']) });

function appUrl(req: Request): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    new URL(req.url).origin
  );
}

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  try {
    const { product } = schema.parse(await req.json());
    const stripe = getStripe();
    const origin = appUrl(req);

    // Reuse the account's Stripe customer if we already have one.
    const sub = await getSubscription(session.userId!);
    let customerId = sub?.stripe_customer_id ?? undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.email,
        metadata: { userId: session.userId! },
      });
      customerId = customer.id;
      await setStripeCustomerId(session.userId!, customerId);
    }

    const isSetup = product === 'setup';
    const priceEnv = isSetup ? SETUP_ADDON.priceEnv : PLANS[product].priceEnv;
    const priceId = process.env[priceEnv];
    if (!priceId) {
      return NextResponse.json(
        { error: `Missing price configuration (${priceEnv})` },
        { status: 500 }
      );
    }

    // If they're still inside their no-card trial (derived from account age),
    // carry the remaining trial over to Stripe so the first charge lands on the
    // original trial-end date — never earlier. Stripe requires trial_end ≥ ~48h
    // out, so anything sooner just bills now (they've had their free fortnight).
    const now = Math.floor(Date.now() / 1000);
    const user = await getUserById(session.userId!);
    const trialEndsAt = user ? trialEndsAtFor(user.created_at) : 0;
    const trialEnd =
      !hasPaidAccess(sub?.status, sub?.stripe_subscription_id) &&
      trialEndsAt > now + 2 * 24 * 60 * 60
        ? trialEndsAt
        : undefined;

    const checkout = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: isSetup ? 'payment' : 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard/billing?status=success`,
      cancel_url: `${origin}/dashboard/billing?status=cancelled`,
      metadata: { userId: session.userId!, product },
      ...(isSetup
        ? {}
        : {
            payment_method_collection: 'always',
            subscription_data: {
              metadata: { userId: session.userId! },
              ...(trialEnd ? { trial_end: trialEnd } : {}),
            },
          }),
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
