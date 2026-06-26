import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import InvoiceDetailClient from './InvoiceDetailClient';
import AppNav from '@/components/AppNav';

export const metadata: Metadata = { title: 'Invoice — GetPaid' };

export default async function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav email={session.email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InvoiceDetailClient invoiceId={params.id} />
      </main>
    </div>
  );
}
