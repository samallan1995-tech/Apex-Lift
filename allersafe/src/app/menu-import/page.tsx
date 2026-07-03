import Link from 'next/link';
import { EnquiryForm } from './EnquiryForm';

export const metadata = {
  title: 'Menu import service — we set up your allergen menu for you — AllerSafe',
  description:
    "Short on time? For a one-off £49 we'll import your menu into AllerSafe: ingredients, dishes and allergen mapping, ready for you to review and verify.",
  alternates: { canonical: 'https://allersafe.org/menu-import' },
};

function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function MenuImportPage() {
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
        <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Done-for-you setup</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
          We&apos;ll import your menu for you
        </h1>
        <p className="mt-3 text-gray-500 leading-relaxed max-w-xl">
          Short on time? For a one-off <strong className="text-gray-700">£49</strong>, send us your menu
          and supplier allergen information and we&apos;ll build out your ingredients, dishes and allergen
          mapping in AllerSafe — ready for you to review, verify and print.
        </p>

        <ol className="mt-6 space-y-3 text-sm text-gray-600">
          {[
            'Send this enquiry — no payment now.',
            'We reply to arrange your menu and supplier specs (email or a quick call).',
            'We build your account; you review and verify every allergen before going live.',
          ].map((s, i) => (
            <li key={s} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#3B6D11] text-white text-xs font-bold">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <EnquiryForm />
        </div>

        <p className="mt-6 text-xs text-gray-400 leading-relaxed">
          The final allergen check is always yours: we set up the data, and you verify it against your
          supplier specifications before use. Payment (£49) is taken later from your billing page —
          this enquiry doesn&apos;t commit you to anything.
        </p>
      </main>
    </div>
  );
}
