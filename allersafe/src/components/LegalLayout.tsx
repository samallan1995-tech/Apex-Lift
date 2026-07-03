import Link from 'next/link';

function Shield({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-gray-900 mt-9 mb-2">{children}</h2>;
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] text-gray-600 leading-relaxed mb-3">{children}</p>;
}
export function UL({ children }: { children: React.ReactNode }) {
  return <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-gray-600 leading-relaxed mb-3">{children}</ul>;
}

export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-gray-900 min-h-screen">
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
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="text-sm text-gray-400 mt-2">Last updated: {updated}</p>
        <div className="mt-6">{children}</div>

        <div className="mt-12 border-t border-gray-200 pt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="text-[#3B6D11] font-semibold hover:underline">Home</Link>
          <Link href="/pricing" className="text-[#3B6D11] font-semibold hover:underline">Pricing</Link>
          <Link href="/terms" className="text-[#3B6D11] font-semibold hover:underline">Terms</Link>
          <Link href="/privacy" className="text-[#3B6D11] font-semibold hover:underline">Privacy</Link>
        </div>
      </main>
    </div>
  );
}
