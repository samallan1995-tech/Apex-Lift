import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { getStripe, PLANS, SETUP_ADDON } from '@/lib/stripe';
import { getSubscription, setStripeCustomerId } from '@/lib/queries';

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
        : { subscription_data: { metadata: { userId: session.userId! } } }),
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('checkout error', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
