import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { DashboardShell } from './DashboardShell';
import { getVenuesForUser } from '@/lib/queries';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  if (!session) redirect('/');

  const venues = await getVenuesForUser(session.userId!);

  return (
    <DashboardShell email={session.email!} venues={venues}>
      {children}
    </DashboardShell>
  );
}
