import Link from 'next/link'

const features = [
  {
    icon: '⚡',
    title: 'Live Formula Engine',
    desc: 'Write expressions like fee = hours × rate × multiplier or vat = subtotal × 0.2. Cross-field references, IF/ELSE logic, rounding — all evaluated instantly as clients type.',
  },
  {
    icon: '🔀',
    title: 'Conditional Logic',
    desc: 'Show or hide fields based on other field values. Clients only see what\'s relevant — no confusing irrelevant questions.',
  },
  {
    icon: '📄',
    title: 'Branded PDF Output',
    desc: 'Every submission generates a beautiful, branded PDF with all responses and calculated values. Download instantly or email to clients.',
  },
  {
    icon: '🤖',
    title: 'AI Form Generation',
    desc: 'Describe your form in plain English — "conveyancing quote intake" — and Claude builds the complete field schema and formula set in seconds.',
  },
  {
    icon: '🔗',
    title: 'Embed & Share',
    desc: 'Embed on your website with a single script snippet or share a direct link. Works on any site, no dev required.',
  },
  {
    icon: '📊',
    title: 'Submissions Dashboard',
    desc: 'See every response with computed values side-by-side. Filter, export, and download PDFs for any submission.',
  },
]

const templates = [
  { cat: 'Accounting', label: 'bg-blue-100 text-blue-700', items: ['Tax Return Fee Estimator', 'Payroll Quote Builder', 'VAT Registration Assessment', 'Audit Readiness Checker'] },
  { cat: 'Legal', label: 'bg-purple-100 text-purple-700', items: ['Conveyancing Quote Calculator', 'Employment Tribunal Eligibility', 'Will & Probate Fee Estimator', 'Litigation Cost Forecast'] },
  { cat: 'Consulting', label: 'bg-green-100 text-green-700', items: ['Project Proposal Fee Calculator', 'ROI Calculator', 'Change Readiness Assessment', 'Digital Maturity Score'] },
]

const pricing = [
  {
    name: 'Solo',
    price: '£49',
    period: '/mo',
    desc: 'Perfect for sole practitioners',
    features: ['3 active forms', 'Unlimited submissions', 'PDF generation', 'Template library', 'Email support'],
    cta: 'Start Solo',
    highlight: false,
  },
  {
    name: 'Team',
    price: '£99',
    period: '/mo',
    desc: 'For growing practices',
    features: ['Unlimited forms', 'Remove CalcForms branding', 'Up to 10 team members', 'AI form generation', 'Priority support'],
    cta: 'Start Team',
    highlight: true,
  },
  {
    name: 'Firm',
    price: '£199',
    period: '/mo',
    desc: 'For established firms',
    features: ['Everything in Team', 'White-label domain', 'Unlimited team seats', 'Custom branding & logo', 'Dedicated account manager'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CF</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">CalcForms</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Templates</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Sign in</Link>
            <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-20 px-6 bg-gradient-to-b from-indigo-50/60 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span>✦</span>
            Built for accountants, lawyers & consultants
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            The form builder that
            <span className="text-indigo-600"> actually calculates.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Quotes, intake, and eligibility forms with real formulas and conditional logic — built for accountants, lawyers, and consultants. No developer required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-indigo-200">
              Start building for free →
            </Link>
            <Link href="/dashboard/templates" className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold px-8 py-4 rounded-xl text-base transition-colors">
              Browse templates
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-4">No credit card required · 14-day free trial on all plans</p>
        </div>

        {/* Hero UI preview */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <div className="ml-4 bg-white rounded border border-gray-200 text-xs text-gray-400 px-3 py-1 flex-1 max-w-xs">
                calcforms.io/f/conveyancing-quote
              </div>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-6">Conveyancing Quote</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white">
                      <option>Purchase</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Value (£)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">£</span>
                      <input type="text" defaultValue="350,000" className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2.5 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white">
                      <option>Freehold</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wide">Calculated Results</h4>
                <div className="space-y-3">
                  {[['Legal Fees', '£1,100'], ['Disbursements', '£350'], ['VAT (20%)', '£220'], ['Total Estimate', '£1,670']].map(([k, v], i) => (
                    <div key={i} className={`flex justify-between items-center py-2 ${i === 3 ? 'border-t border-indigo-200 mt-2 pt-4' : ''}`}>
                      <span className={`text-sm ${i === 3 ? 'font-bold text-gray-900' : 'text-gray-600'}`}>{k}</span>
                      <span className={`font-bold ${i === 3 ? 'text-indigo-600 text-lg' : 'text-gray-900'}`}>{v}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-lg">
                  Get My Quote →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything professional services firms need</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">No spreadsheets. No developers. Just forms that do the maths for you.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formula showcase */}
      <section className="py-20 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-indigo-400 text-sm font-semibold uppercase tracking-wide mb-3">Formula Engine</div>
            <h2 className="text-3xl font-bold mb-4">Write real formulas.<br />Get instant results.</h2>
            <p className="text-gray-400 leading-relaxed mb-6">
              Reference any field by ID. Use IF/ELSE conditions. Round, min, max, absolute values. Chain formulas together. The engine evaluates everything in real time as clients complete the form.
            </p>
            <div className="space-y-3">
              {[
                'fee = hours × rate × multiplier',
                'vat = subtotal × 0.2',
                'total = IF(client_type == "vat_registered", subtotal + vat, subtotal)',
                'discount = IF(value > 100000, total × 0.1, 0)',
              ].map((ex, i) => (
                <div key={i} className="bg-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm text-green-400">
                  {ex}
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-6">
            <div className="text-gray-400 text-xs uppercase tracking-wide mb-4">Live preview</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Hours worked</span>
                <span className="bg-gray-700 rounded px-3 py-1 text-white text-sm font-mono">40</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">Day rate (£)</span>
                <span className="bg-gray-700 rounded px-3 py-1 text-white text-sm font-mono">1,800</span>
              </div>
              <div className="border-t border-gray-700 pt-4 space-y-2">
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Consulting fee</span><span className="text-white font-mono text-sm">£72,000</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">Travel & expenses</span><span className="text-white font-mono text-sm">£1,500</span></div>
                <div className="flex justify-between"><span className="text-gray-400 text-sm">VAT (20%)</span><span className="text-white font-mono text-sm">£14,700</span></div>
                <div className="flex justify-between border-t border-gray-700 pt-2 mt-2">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-indigo-400 font-bold font-mono text-lg">£88,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Start from a template</h2>
            <p className="text-lg text-gray-500">Built for the real workflows of professional services firms.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {templates.map((t, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-50">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${t.label}`}>{t.cat}</span>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {t.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-700">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 pb-6">
                  <Link href="/dashboard/templates" className="w-full block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700 border border-indigo-200 hover:border-indigo-300 rounded-lg py-2.5 transition-colors">
                    Browse {t.cat} templates →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-gray-500">Pay monthly, cancel anytime. All plans include a 14-day free trial.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((p, i) => (
              <div key={i} className={`relative bg-white rounded-2xl p-8 ${p.highlight ? 'ring-2 ring-indigo-600 shadow-xl' : 'border border-gray-200'}`}>
                {p.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="mb-6">
                  <div className="font-bold text-gray-900 text-lg mb-1">{p.name}</div>
                  <div className="text-gray-500 text-sm mb-4">{p.desc}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{p.price}</span>
                    <span className="text-gray-400">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`block text-center font-semibold py-3 rounded-xl transition-colors text-sm ${p.highlight ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-indigo-600">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to stop doing fee quotes in spreadsheets?</h2>
          <p className="text-indigo-200 mb-8 text-lg">Join hundreds of accountants, lawyers, and consultants already using CalcForms.</p>
          <Link href="/auth/signup" className="inline-block bg-white text-indigo-600 font-bold px-8 py-4 rounded-xl text-base hover:bg-indigo-50 transition-colors">
            Start your free trial →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">CF</span>
            </div>
            <span className="font-semibold text-gray-900">CalcForms</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
          <div className="text-sm text-gray-400">© 2025 CalcForms Ltd. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
