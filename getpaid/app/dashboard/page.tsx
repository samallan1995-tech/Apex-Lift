import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import DashboardClient from './DashboardClient';
import AppNav from '@/components/AppNav';

export const metadata: Metadata = {
  title: 'Dashboard — GetPaid',
};

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav email={session.email} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardClient />
      </main>
    </div>
  );
}
