import Link from 'next/link';
import { LeadForm } from './LeadForm';

export const metadata = {
  title: 'Free 14-allergen matrix template for UK food businesses — AllerSafe',
  description:
    'Download a free, printable 14-allergen matrix template. List your dishes, tick the allergens, and show it to your EHO. No catch — just enter your email.',
  alternates: { canonical: 'https://allersafe.org/free-allergen-matrix' },
};

function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function FreeMatrixPage() {
  return (
    <div className="bg-white min-h-screen text-gray-900">
      <header className="bg-[#0E2A06] border-b border-white/10">
        <div className="max-w-3xl mx-auto px-5 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#9DE26B] text-[#0E2A06]"><Shield className="w-5 h-5" /></span>
            <span className="text-lg font-bold text-white">AllerSafe</span>
          </Link>
          <Link href="/signup" className="ml-auto text-sm font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-lg px-4 py-2">
            Start free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-14">
        <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Free download</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
          Free 14-allergen matrix template
        </h1>
        <p className="mt-3 text-gray-500 leading-relaxed max-w-xl">
          A clean, printable A4 matrix covering all 14 UK regulated allergens. List your dishes down
          the side, tick the allergens each contains, and keep it where your team — and your EHO —
          can see it. We&apos;ll email you the link.
        </p>

        <div className="mt-8">
          <LeadForm source="free-allergen-matrix" />
        </div>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
          {[
            ['All 14 allergens', 'Celery to sulphites, in the order EHOs expect.'],
            ['Print-ready A4', 'Landscape layout with room for 18 dishes per sheet.'],
            ['Guidance included', 'Reminders to verify against supplier specs.'],
          ].map(([t, d]) => (
            <div key={t} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{t}</p>
              <p className="mt-1 text-gray-500 text-xs leading-relaxed">{d}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-[#F6FAF0] border border-[#E3EECF] p-6">
          <h2 className="text-lg font-bold">Tired of filling it in by hand?</h2>
          <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
            AllerSafe builds your allergen matrix, Natasha&apos;s Law PPDS labels and a live QR allergen
            menu from one ingredient list — update an ingredient once and everything stays in sync.
          </p>
          <Link href="/signup" className="inline-block mt-4 text-sm font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-xl px-5 py-2.5">
            Try it free for 14 days — no card
          </Link>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-[#3B6D11] font-semibold hover:underline">Home</Link>
          <Link href="/demo" className="text-[#3B6D11] font-semibold hover:underline">Example menu</Link>
          <Link href="/pricing" className="text-[#3B6D11] font-semibold hover:underline">Pricing</Link>
        </div>
      </main>
    </div>
  );
}
