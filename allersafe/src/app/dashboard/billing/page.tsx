import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { getBillingState } from '@/lib/queries';
import { BillingClient } from './BillingClient';

export const dynamic = 'force-dynamic';

export default async function BillingPage() {
  const session = await requireAuth();
  if (!session) redirect('/');

  const billing = await getBillingState(session.userId!);
  return <BillingClient billing={billing} />;
}
