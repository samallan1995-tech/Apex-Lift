import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import AppNav from '@/components/AppNav';

export const metadata: Metadata = { title: 'Letters — GetPaid' };

export default async function LettersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNav email={session.email} />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chaser letters</h1>
          <p className="text-sm text-gray-500 mt-1">
            Letters are generated per invoice. Open any overdue invoice to create a letter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            {
              step: 1,
              title: 'Step 1 — Friendly Reminder',
              desc: 'Polite first notice. Assumes good faith, requests payment promptly.',
              tone: 'Polite',
              color: 'bg-green-50 border-green-200',
            },
            {
              step: 2,
              title: 'Step 2 — Firm Follow-Up',
              desc: 'Firmer tone. States consequences if unpaid within 7 days.',
              tone: 'Firm',
              color: 'bg-amber-50 border-amber-200',
            },
            {
              step: 3,
              title: 'Step 3 — Letter Before Action',
              desc: 'Formal LBA with full statutory interest + compensation breakdown. Court warning.',
              tone: 'Formal',
              color: 'bg-red-50 border-red-200',
            },
          ].map((s) => (
            <div key={s.step} className={`card border ${s.color}`}>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                {s.tone}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="card text-center py-12">
          <p className="text-3xl mb-3">📄</p>
          <h2 className="font-semibold text-gray-900 mb-2">Open an invoice to generate a letter</h2>
          <p className="text-sm text-gray-600 mb-4">
            Letters are created in the context of a specific invoice so the interest breakdown is accurate.
          </p>
          <Link href="/invoices" className="btn-primary">
            View invoices →
          </Link>
        </div>

        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Reminder:</strong> Templates and calculations are for general guidance, not legal advice.
            Verify the current Bank of England base rate and seek professional advice before issuing a
            Letter Before Action or commencing legal proceedings.
          </p>
        </div>
      </main>
    </div>
  );
}
