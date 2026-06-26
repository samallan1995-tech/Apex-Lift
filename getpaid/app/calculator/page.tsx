import type { Metadata } from 'next';
import Link from 'next/link';
import CalculatorClient from './CalculatorClient';

export const metadata: Metadata = {
  title: 'UK Late Payment Interest Calculator — Free B2B Statutory Interest Tool',
  description:
    'Calculate UK statutory late payment interest under the Late Payment of Commercial Debts (Interest) Act 1998. Free, instant, no login required. Includes fixed-sum compensation.',
  keywords: [
    'UK late payment interest calculator',
    'statutory interest calculator',
    'late payment act 1998',
    'B2B invoice interest',
    'commercial debt interest UK',
    'fixed sum compensation',
  ],
  openGraph: {
    title: 'UK Late Payment Interest Calculator',
    description:
      'Instantly calculate statutory interest on overdue B2B invoices. Free, no login required.',
  },
};

export default function CalculatorPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-700">
            GetPaid
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Sign in
            </Link>
            <Link href="/login" className="btn-primary text-sm">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* SEO heading */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            UK Late Payment Interest Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Calculate statutory interest on overdue B2B invoices under the{' '}
            <strong>Late Payment of Commercial Debts (Interest) Act 1998</strong> — free,
            instant, no account needed.
          </p>
        </div>

        {/* Calculator (client component) */}
        <CalculatorClient />

        {/* Explainer */}
        <div className="mt-12 prose prose-sm max-w-none">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              About the Late Payment of Commercial Debts Act 1998
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                The <strong>Late Payment of Commercial Debts (Interest) Act 1998</strong> (as amended by the
                Late Payment of Commercial Debts Regulations 2002) gives businesses the statutory right to
                charge interest on unpaid commercial debts. It applies to <strong>business-to-business (B2B)
                transactions</strong> where payment is overdue.
              </p>
              <p>
                <strong>Who can use it?</strong> Any business owed money by another business for goods or
                services supplied under a commercial contract. It does <em>not</em> apply to consumer debts
                (B2C), or where a contract specifically excludes or replaces statutory interest with a
                &ldquo;substantial remedy&rdquo;.
              </p>
              <p>
                <strong>How is the rate set?</strong> The statutory interest rate is always{' '}
                <strong>8% above the Bank of England base rate</strong>. As the base rate changes, so does
                the effective rate — which is why this calculator lets you enter the current base rate
                directly. Always check the{' '}
                <span className="font-medium text-brand-600">
                  current BoE rate at bankofengland.co.uk
                </span>{' '}
                before issuing a formal demand.
              </p>
              <p>
                <strong>Fixed-sum compensation</strong> is a one-off statutory payment (per invoice) on
                top of interest: £40 for debts under £1,000; £70 for £1,000–£9,999.99; £100 for £10,000
                and above. This is automatic — you do not need to negotiate it.
              </p>
              <p>
                <strong>When does interest start?</strong> From the day <em>after</em> the contractual (or
                statutory) payment due date. If no due date was agreed, the default under the Act is 30
                days after the invoice date or delivery of goods/services, whichever is later.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm text-amber-800">
              <strong>Not legal advice:</strong> Templates and calculations are for general guidance only.
              Always verify the current Bank of England base rate and seek professional legal advice before
              issuing a Letter Before Action or commencing legal proceedings. The Act contains specific
              provisions and exceptions not covered here.
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 card text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to send a formal demand?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Sign up free to generate a professional three-step chaser letter — including a
              court-ready Letter Before Action with the full interest breakdown.
            </p>
            <Link href="/login" className="btn-primary">
              Generate a demand letter →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
