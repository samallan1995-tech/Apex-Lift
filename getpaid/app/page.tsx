import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GetPaid — Chase Late Invoices & Calculate Statutory Interest',
  description:
    'Stop chasing invoices manually. GetPaid calculates UK statutory late payment interest, generates professional demand letters, and helps you get paid faster.',
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-brand-700">
            GetPaid
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/calculator" className="text-sm text-gray-600 hover:text-gray-900 font-medium">
              Calculator
            </Link>
            <Link href="/login" className="btn-secondary text-sm">
              Sign in
            </Link>
            <Link href="/login" className="btn-primary text-sm">
              Start free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span>🇬🇧</span>
          <span>Built for UK small businesses</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get paid what you're owed —{' '}
          <span className="text-brand-600">with interest</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Calculate UK statutory late payment interest in seconds, generate professional
          demand letters, and track overdue invoices — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/calculator" className="btn-primary text-base px-6 py-3">
            Try the free calculator →
          </Link>
          <Link href="/login" className="btn-secondary text-base px-6 py-3">
            Sign up free
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required. Calculator always free.</p>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">
            Everything you need to chase late payments
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How it works</h2>
        <div className="space-y-8">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center">
                {i + 1}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{s.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-center text-gray-600 mb-12">The calculator is always free. Upgrade when you need more.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {pricing.map((p) => (
              <div key={p.name} className={`card ${p.featured ? 'border-brand-500 ring-2 ring-brand-500' : ''}`}>
                {p.featured && (
                  <div className="text-xs font-semibold text-brand-600 bg-brand-50 px-2 py-1 rounded-full inline-block mb-3">
                    Most popular
                  </div>
                )}
                <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                <div className="text-3xl font-bold text-gray-900 mt-2 mb-1">
                  {p.price}
                  {p.period && <span className="text-base font-normal text-gray-500">{p.period}</span>}
                </div>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-0.5">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/login" className={`mt-6 block text-center ${p.featured ? 'btn-primary' : 'btn-secondary'}`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="border-t border-gray-100 bg-amber-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
          <p className="text-sm text-amber-800">
            <strong>Disclaimer:</strong> Templates and calculations are for general guidance, not legal advice.
            Always verify the current Bank of England base rate and seek professional advice before issuing a
            Letter Before Action or commencing legal proceedings.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} GetPaid. Built for UK small businesses.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/calculator" className="hover:text-gray-700">Calculator</Link>
            <Link href="/login" className="hover:text-gray-700">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '🧮',
    title: 'Statutory Interest Calculator',
    description: 'Calculates exact interest under the Late Payment of Commercial Debts Act 1998 — including fixed-sum compensation. Always free.',
  },
  {
    icon: '📄',
    title: 'Three-Step Chaser Letters',
    description: 'Friendly reminder → firm follow-up → formal Letter Before Action. All in professional British English with your branding.',
  },
  {
    icon: '📊',
    title: 'Invoice Tracker',
    description: 'Track all your outstanding invoices in one place. See running interest totals and get alerted as debts escalate.',
  },
  {
    icon: '📧',
    title: 'Automated Reminders',
    description: 'Schedule email reminders that fire automatically after your chosen intervals. Never forget to chase again.',
  },
  {
    icon: '📑',
    title: 'PDF Demand Letters',
    description: 'Download professionally formatted PDF letters ready to post or email, with your company branding.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    description: 'Your data stays in your browser by default (localStorage). Optional Turso cloud sync for multi-device access.',
  },
];

const steps = [
  {
    title: 'Add your overdue invoice',
    description: 'Enter the client name, invoice amount, and due date.',
  },
  {
    title: 'See exactly what you\'re owed',
    description: 'GetPaid instantly calculates statutory interest and fixed-sum compensation under the 1998 Act.',
  },
  {
    title: 'Generate your chaser letter',
    description: 'Pick Step 1, 2, or 3 of the escalation ladder. Download as PDF or copy the text to send.',
  },
  {
    title: 'Get paid',
    description: 'Most debtors pay within 14 days of receiving a formal Letter Before Action.',
  },
];

const pricing = [
  {
    name: 'Calculator',
    price: 'Free',
    period: '',
    featured: false,
    features: [
      'Statutory interest calculator',
      'No login required',
      'Works offline',
      'Unlimited calculations',
    ],
  },
  {
    name: 'Solo',
    price: '£12',
    period: '/mo',
    featured: true,
    features: [
      'Everything in Free',
      'Invoice tracker',
      'Chaser letter generator',
      'PDF downloads',
      'Company branding',
    ],
  },
  {
    name: 'Business',
    price: '£19',
    period: '/mo',
    featured: false,
    features: [
      'Everything in Solo',
      'Auto email reminders',
      'Turso cloud sync',
      'Multi-device access',
      'Priority support',
    ],
  },
];
