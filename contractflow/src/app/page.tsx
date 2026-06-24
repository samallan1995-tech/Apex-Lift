import Link from "next/link";
import {
  FileText,
  PenLine,
  Receipt,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Clock,
  Users,
  BarChart3,
  ChevronRight,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Contract Builder",
    description:
      "Build professional contracts from customisable templates. Add variables, clauses, and milestones in minutes.",
  },
  {
    icon: PenLine,
    title: "Legally Binding E-Signatures",
    description:
      "Clients sign directly in their browser. Every signature is timestamped, IP-logged, and legally enforceable.",
  },
  {
    icon: Receipt,
    title: "Automatic Invoice Generation",
    description:
      "Contracts trigger invoices automatically at every milestone. No more manual billing errors or forgotten payments.",
  },
  {
    icon: CreditCard,
    title: "Integrated Payment Collection",
    description:
      "Accept cards, bank transfers, and more via Stripe. Funds land in your account — fast.",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description:
      "Track outstanding invoices, monthly recurring revenue, and payment velocity in one live dashboard.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Invite team members, assign clients, and manage permissions so everyone works from the same source of truth.",
  },
];

const steps = [
  {
    number: "01",
    title: "Build your contract",
    description:
      "Choose a template or start from scratch. Fill in client details, scope of work, payment schedule, and milestones.",
  },
  {
    number: "02",
    title: "Client signs instantly",
    description:
      "Send a secure link. Your client reviews and e-signs from any device. You get notified the moment they sign.",
  },
  {
    number: "03",
    title: "Get paid automatically",
    description:
      "Invoices generate at each milestone and payment reminders go out automatically. Chase nothing ever again.",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "£49",
    period: "/mo",
    description: "Perfect for freelancers and solo operators.",
    highlight: false,
    features: [
      "25 active clients",
      "20 contracts per month",
      "E-signatures included",
      "Automatic invoicing",
      "Stripe payment integration",
      "Email support",
    ],
    cta: "Start free trial",
    href: "/sign-up",
  },
  {
    name: "Professional",
    price: "£99",
    period: "/mo",
    description: "Built for growing agencies and consultancies.",
    highlight: true,
    features: [
      "Unlimited clients",
      "Unlimited contracts",
      "5 team members",
      "Priority support",
      "Custom contract templates",
      "Revenue analytics",
      "Automated reminders",
    ],
    cta: "Start free trial",
    href: "/sign-up",
  },
  {
    name: "Agency",
    price: "£199",
    period: "/mo",
    description: "For large agencies that need full control.",
    highlight: false,
    features: [
      "Everything in Professional",
      "Unlimited team members",
      "White-label branding",
      "Custom domain",
      "API access",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    href: "/sign-up",
  },
];

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Bright Pixel Studio",
    avatar: "SM",
    content:
      "ContractFlow cut our time-to-signed from a week to under two hours. We've stopped losing deals to slow paperwork and started getting paid on time, every time.",
    rating: 5,
  },
  {
    name: "James Thornton",
    role: "Managing Director, Thornton Consulting",
    avatar: "JT",
    content:
      "The automatic invoice-from-milestone feature alone is worth the subscription. Our accounts team no longer has to cross-reference contracts manually.",
    rating: 5,
  },
  {
    name: "Priya Sharma",
    role: "Head of Ops, Nova Agency",
    avatar: "PS",
    content:
      "We manage 40+ active clients. ContractFlow gives us one clean view of what's signed, what's outstanding, and what's overdue. It's indispensable.",
    rating: 5,
  },
];

function NavBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileText className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight">ContractFlow</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/sign-in"
            className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background pb-24 pt-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              Trusted by 2,000+ service businesses
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Close deals faster with{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                ContractFlow
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
              Create professional contracts, collect legally binding e-signatures,
              auto-generate invoices at every milestone, and get paid — all from
              one beautifully simple platform.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 hover:shadow-xl"
              >
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border bg-background px-8 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-muted"
              >
                See how it works
              </Link>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>

          {/* Feature pills */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {[
              { icon: FileText, label: "Contract Builder" },
              { icon: PenLine, label: "E-Signatures" },
              { icon: Receipt, label: "Auto Invoicing" },
              { icon: CreditCard, label: "Payment Collection" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-border bg-muted/30 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              GDPR compliant
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-500" />
              Bank-grade encryption
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-500" />
              Used in 30+ countries
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              99.9% uptime SLA
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything your business needs to get paid
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              ContractFlow replaces five separate tools with one integrated
              platform built specifically for service businesses.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-gradient-to-b from-muted/30 to-background py-24"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              From contract to payment in three steps
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We've removed every friction point between winning a client and
              getting paid.
            </p>
          </div>
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute right-0 top-6 hidden h-px w-full translate-x-1/2 border-t border-dashed border-border md:block" />
                )}
                <div className="relative">
                  <span className="mb-4 inline-block text-5xl font-black text-primary/20">
                    {step.number}
                  </span>
                  <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free for 14 days. No credit card required.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                  tier.highlight
                    ? "border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-1 text-xs font-bold text-white shadow">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold ${
                      tier.highlight ? "text-primary-foreground" : "text-foreground"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`mt-1 text-sm ${
                      tier.highlight
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    {tier.description}
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span
                      className={`text-4xl font-extrabold ${
                        tier.highlight ? "text-primary-foreground" : "text-foreground"
                      }`}
                    >
                      {tier.price}
                    </span>
                    <span
                      className={`text-sm ${
                        tier.highlight
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tier.period}
                    </span>
                  </div>
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          tier.highlight ? "text-primary-foreground" : "text-primary"
                        }`}
                      />
                      <span
                        className={
                          tier.highlight
                            ? "text-primary-foreground/90"
                            : "text-foreground"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-semibold transition-colors ${
                    tier.highlight
                      ? "bg-white text-primary hover:bg-white/90"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans include a 14-day free trial. No credit card required.{" "}
            <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
              Compare all features
            </Link>
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by service businesses
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Don't take our word for it — hear from businesses already using
              ContractFlow.
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <blockquote className="flex-1 text-sm leading-6 text-foreground">
                  &ldquo;{t.content}&rdquo;
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-12 shadow-2xl shadow-primary/30">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Start your free trial today
            </h2>
            <p className="mt-4 text-lg text-white/80">
              Join 2,000+ service businesses. Set up in minutes. Cancel anytime.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-8 text-base font-semibold text-primary shadow transition-all hover:bg-white/90"
              >
                Get started free
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-8 text-base font-semibold text-white transition-colors hover:bg-white/20"
              >
                View pricing
              </Link>
            </div>
            <p className="mt-4 text-sm text-white/60">
              14-day free trial · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-bold">ContractFlow</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground">
                Professional contract and invoice management for modern service
                businesses.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="hover:text-foreground">
                    How it works
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ContractFlow. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground">
              Made with care in the United Kingdom 🇬🇧
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
