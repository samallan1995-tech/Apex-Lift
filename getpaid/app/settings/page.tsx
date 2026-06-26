import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import SettingsClient from './SettingsClient';
import AppNav from '@/components/AppNav';

export const metadata: Metadata = { title: 'Settings — GetPaid' };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav email={session.email} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Your company details appear in all chaser letters and PDF downloads.
          </p>
        </div>
        <SettingsClient userEmail={session.email} />
      </main>
    </div>
  );
}
