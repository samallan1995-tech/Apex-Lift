import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { getStripe } from '@/lib/stripe';
import { getSubscription } from '@/lib/queries';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });

  const sub = await getSubscription(session.userId!);
  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No billing account yet' }, { status: 400 });
  }

  try {
    const origin =
      process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? new URL(req.url).origin;
    const portal = await getStripe().billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${origin}/dashboard/billing`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    console.error('portal error', err);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 });
  }
}
