import Link from 'next/link';
import { PLANS, SETUP_ADDON } from '@/lib/plans';

export const metadata = {
  title: 'AllerSafe — allergen labelling UK food businesses can trust',
  description:
    "Turn your ingredients into Natasha's Law PPDS labels, an allergen matrix and a live QR menu. Start free for 14 days — no card required.",
};

function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const ALLERGEN_CHIPS: [string, string, string][] = [
  ['Cereals / gluten', '#854F0B', '#FAEEDA'],
  ['Eggs', '#0C447C', '#E6F1FB'],
  ['Peanuts', '#993C1D', '#FAECE7'],
  ['Soya', '#26215C', '#EEEDFE'],
  ['Milk', '#085041', '#E1F5EE'],
  ['Fish', '#72243E', '#FBEAF0'],
  ['Crustaceans', '#993C1D', '#FAECE7'],
  ['Sesame', '#5F5E5A', '#F1EFE8'],
  ['Mustard', '#854F0B', '#FAEEDA'],
  ['Sulphites', '#26215C', '#EEEDFE'],
];

const FEATURES = [
  {
    title: "Natasha's Law PPDS labels",
    body: 'Print compliant pre-packed-for-direct-sale labels with the full ingredient list and allergens emphasised — straight from your dishes.',
    icon: <path d="M7.5 3.5h6l5 5v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z M13 3.5v5h5 M9 13h6 M9 16h4" />,
  },
  {
    title: 'Allergen matrix',
    body: 'A clean, printable grid of every dish against all 14 UK allergens — the document your EHO actually asks for.',
    icon: <path d="M4 4h16v16H4z M4 9h16 M4 14h16 M9 4v16 M14 4v16" />,
  },
  {
    title: 'Live QR menu',
    body: 'A public allergen menu customers scan at the table. Update a recipe and it changes everywhere instantly.',
    icon: <path d="M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h2v2h-2z M18 14h2v2h-2z M14 18h2v2h-2z M18 18h2v2h-2z" />,
  },
  {
    title: 'One source of truth',
    body: 'Set an ingredient once. Every dish, label, matrix and QR menu that uses it updates automatically — no more clashing spreadsheets.',
    icon: <path d="M12 3v18 M5 8l7-5 7 5 M5 8v8l7 5 7-5V8" />,
  },
  {
    title: 'Multi-venue ready',
    body: 'Run several sites from one login and switch between them in a click. Each venue keeps its own menu and QR code.',
    icon: <path d="M3 21h18 M5 21V7l7-4 7 4v14 M9 9h0 M9 13h0 M9 17h0 M15 9h0 M15 13h0 M15 17h0" />,
  },
  {
    title: 'Built for UK law',
    body: "Designed around FSA guidance and Natasha's Law from day one — with the legal reminders that keep your team honest.",
    icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z M9 12l2 2 4-4" />,
  },
];

const STEPS = [
  { n: 1, title: 'Add your ingredients', body: 'List each ingredient and tick the allergens it contains. Do it once.' },
  { n: 2, title: 'Build your dishes', body: 'Compose menu items from those ingredients — allergens are worked out for you.' },
  { n: 3, title: 'Print & share', body: 'Download labels and the matrix, or share your QR menu. Always in sync.' },
];

export default function HomePage() {
  const plans = Object.values(PLANS);

  return (
    <div className="bg-white text-gray-900">
      <header className="sticky top-0 z-40 bg-[#0E2A06]/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#9DE26B] text-[#0E2A06]">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-lg font-bold text-white">AllerSafe</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 ml-6 text-sm text-[#C0DD97]">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white hover:text-[#9DE26B]">Sign in</Link>
            <Link href="/login" className="text-sm font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-lg px-4 py-2">
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-[#0E2A06] text-white">
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5 text-xs font-medium text-[#C0DD97]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#9DE26B]" /> Natasha&apos;s Law ready · Built for UK food businesses
          </span>
          <h1 className="mt-6 text-4xl sm:text-6xl font-extrabold leading-[1.05] tracking-tight max-w-3xl mx-auto">
            Never fear the <span className="text-[#9DE26B]">allergen folder</span> again
          </h1>
          <p className="mt-5 text-lg text-[#C0DD97] max-w-2xl mx-auto leading-relaxed">
            Turn your ingredients into legal labels, a full allergen matrix and a live QR menu — in one afternoon, not one painful weekend.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="text-base font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-xl px-6 py-3.5 shadow-lg shadow-[#9DE26B]/20">
              Start free — no card
            </Link>
            <Link href="/pricing" className="text-base font-semibold text-white border border-white/25 hover:bg-white/10 rounded-xl px-6 py-3.5">
              See pricing
            </Link>
          </div>
          <p className="mt-4 text-sm text-[#9DE26B]/80">14-day free trial · no card required · cancel anytime</p>

          <div className="mt-12 flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {ALLERGEN_CHIPS.map(([label, fg, bg]) => (
              <span key={label} className="text-xs font-medium rounded-lg px-3 py-1.5" style={{ color: fg, background: bg }}>
                {label}
              </span>
            ))}
            <span className="text-xs font-medium rounded-lg px-3 py-1.5 bg-white/10 text-white">+ 4 more, tracked automatically</span>
          </div>
        </div>
      </section>

      {/* Product proof — real label + live demo menu */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">See it for real</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">
              This is the label your kitchen prints
            </h2>
            <p className="mt-3 text-gray-500 leading-relaxed">
              Enter your ingredients once and AllerSafe produces Natasha&apos;s Law PPDS labels with the
              full ingredient list, allergens emphasised, ready to print and stick on. Your allergen
              matrix and QR menu are generated from the same data — change a recipe and everything
              updates together.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2"><span className="text-[#3B6D11]">✓</span>Ingredients listed in descending weight order</li>
              <li className="flex items-start gap-2"><span className="text-[#3B6D11]">✓</span>All 14 UK allergens emphasised automatically</li>
              <li className="flex items-start gap-2"><span className="text-[#3B6D11]">✓</span>A4 sheets of cut-out labels, ready for the counter</li>
            </ul>
            <Link
              href="/demo"
              className="inline-block mt-6 text-sm font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-xl px-5 py-3"
            >
              See a live example menu →
            </Link>
          </div>

          {/* Example PPDS label, rendered with real CSS */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm rounded-lg border-2 border-[#3B6D11] bg-white p-5 shadow-sm">
              <p className="text-lg font-bold text-gray-900">Chicken &amp; pesto baguette</p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-wide text-gray-500">Ingredients</p>
              <p className="mt-1 text-[13px] leading-relaxed text-gray-800">
                Baguette (<strong className="uppercase">wheat flour</strong>, water, yeast, salt), roast
                chicken (32%), basil pesto (basil, <strong className="uppercase">pine nuts</strong>,{' '}
                <strong className="uppercase">parmesan cheese (milk)</strong>, olive oil, garlic), rocket,{' '}
                <strong className="uppercase">butter (milk)</strong>.
              </p>
              <p className="mt-1.5 text-[10px] italic text-gray-400">Allergens shown in BOLD CAPS</p>
              <div className="mt-3 border-t border-gray-200 pt-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-gray-500">Contains</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {['Cereals / gluten', 'Tree nuts', 'Milk'].map(a => (
                    <span key={a} className="rounded-md bg-[#EAF3DE] px-2 py-0.5 text-[11px] font-semibold text-[#27500A]">{a}</span>
                  ))}
                </div>
              </div>
              <div className="mt-3 border-t border-gray-200 pt-2.5 text-[11px] text-gray-600">
                <p><span className="font-semibold">Use by:</span> 03 July · <span className="font-semibold">Storage:</span> keep refrigerated below 5°C</p>
                <p className="mt-1">Made by The Corner Bakery, 12 Market Street, York</p>
              </div>
              <p className="mt-3 text-[9px] text-gray-400">Printed with AllerSafe · allersafe.org</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-5 py-20 pt-0">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Everything in one place</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Compliance that runs itself</h2>
          <p className="mt-3 text-gray-500">Stop juggling spreadsheets and laminated sheets. AllerSafe keeps every allergen document accurate and in sync.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className="rounded-2xl border border-gray-200 p-6 hover:border-[#9DE26B] hover:shadow-sm transition-all">
              <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[#EAF3DE] text-[#27500A]">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{f.icon}</svg>
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="bg-[#F6FAF0] border-y border-[#E3EECF]">
        <div className="max-w-6xl mx-auto px-5 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Up and running fast</p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Three steps to a compliant menu</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {STEPS.map(s => (
              <div key={s.n} className="rounded-2xl bg-white border border-[#E3EECF] p-6">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#3B6D11] text-white font-bold">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-sm font-bold uppercase tracking-wide text-[#3B6D11]">Simple pricing</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">Start free, pay only if you stay</h2>
          <p className="mt-3 text-gray-500">Every plan starts with a 14-day free trial. No card required — you&apos;re only charged if you choose a plan afterwards.</p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <div key={plan.key} className={'rounded-2xl p-6 flex flex-col ' + (i === 1 ? 'bg-[#0E2A06] text-white' : 'bg-white border border-gray-200')}>
              {i === 1 && <span className="self-start text-xs font-bold text-[#0E2A06] bg-[#9DE26B] px-2.5 py-1 rounded-full mb-3">Most popular</span>}
              <h3 className={'text-lg font-bold ' + (i === 1 ? 'text-white' : 'text-gray-900')}>{plan.name}</h3>
              <p className="mt-2">
                <span className="text-4xl font-extrabold">£{plan.priceGBP}</span>
                <span className={i === 1 ? 'text-[#C0DD97]' : 'text-gray-400'}>/mo</span>
              </p>
              <p className={'text-xs font-semibold mt-1 ' + (i === 1 ? 'text-[#9DE26B]' : 'text-[#3B6D11]')}>14-day free trial · no card</p>
              <ul className={'mt-5 space-y-2 flex-1 text-sm ' + (i === 1 ? 'text-[#C0DD97]' : 'text-gray-600')}>
                {plan.features.slice(0, 4).map(ft => (
                  <li key={ft} className="flex items-start gap-2">
                    <span className={i === 1 ? 'text-[#9DE26B]' : 'text-[#3B6D11]'}>✓</span>{ft}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={'mt-6 text-center rounded-xl px-4 py-3 text-sm font-semibold ' + (i === 1 ? 'bg-[#9DE26B] text-[#0E2A06] hover:bg-[#b6ec90]' : 'bg-gray-900 text-white hover:bg-gray-800')}>
                Start free trial
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 mt-5">
          Short on time? {SETUP_ADDON.name} for a one-off £{SETUP_ADDON.priceGBP} — we&apos;ll set up your menu for you.{' '}
          <Link href="/pricing" className="font-semibold text-[#3B6D11] hover:underline">Compare plans</Link>
        </p>
      </section>

      <section className="bg-[#0E2A06]">
        <div className="max-w-4xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Get your allergens sorted this week</h2>
          <p className="mt-3 text-[#C0DD97]">Set up your menu free, see the labels and matrix for yourself, then decide.</p>
          <Link href="/login" className="inline-block mt-7 text-base font-semibold text-[#0E2A06] bg-[#9DE26B] hover:bg-[#b6ec90] rounded-xl px-7 py-3.5">
            Start your free 14 days
          </Link>
        </div>
      </section>

      <footer className="bg-[#0A1F04] text-[#9DE26B]/70">
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#9DE26B] text-[#0E2A06]"><Shield className="w-4 h-4" /></span>
              <span className="font-bold text-white">AllerSafe</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <Link href="/pricing" className="hover:text-white">Pricing</Link>
              <Link href="/terms" className="hover:text-white">Terms</Link>
              <Link href="/privacy" className="hover:text-white">Privacy</Link>
              <a href="mailto:support@allersafe.org" className="hover:text-white">Support</a>
              <Link href="/login" className="hover:text-white">Sign in</Link>
            </div>
          </div>
          <p className="mt-6 text-xs leading-relaxed max-w-3xl">
            AllerSafe is a management tool. Your business remains legally responsible under UK food law (including Natasha&apos;s Law / PPDS regulations) for verifying all allergen declarations against current supplier specifications before serving.
          </p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} AllerSafe. Payments processed securely by Stripe.</p>
        </div>
      </footer>
    </div>
  );
}
