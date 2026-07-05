import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { DashboardShell } from './DashboardShell';
import { Paywall } from '@/components/Paywall';
import { getVenuesForUser, getBillingState } from '@/lib/queries';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (!session) redirect('/login');

  const [venues, billing] = await Promise.all([
    getVenuesForUser(session.userId!),
    getBillingState(session.userId!),
  ]);

  // Trial lapsed and no paid plan — hard paywall in front of the whole app.
  if (!billing.hasAccess) {
    return <Paywall email={session.email!} />;
  }

  return (
    <DashboardShell email={session.email!} venues={venues} billing={billing}>
      {children}
    </DashboardShell>
  );
}
