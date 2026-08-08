import Link from "next/link";
import { CheckCircle2, X, FileText, HelpCircle } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, transparent pricing for ContractFlow. Start free for 14 days.",
};

interface FeatureRow {
  label: string;
  starter: string | boolean;
  professional: string | boolean;
  agency: string | boolean;
  tooltip?: string;
}

const featureRows: FeatureRow[] = [
  { label: "Active clients", starter: "25", professional: "Unlimited", agency: "Unlimited" },
  { label: "Contracts per month", starter: "20", professional: "Unlimited", agency: "Unlimited" },
  { label: "E-signatures", starter: true, professional: true, agency: true },
  { label: "Automatic invoicing", starter: true, professional: true, agency: true },
  { label: "Stripe payment integration", starter: true, professional: true, agency: true },
  { label: "Custom contract templates", starter: false, professional: true, agency: true },
  { label: "Team members", starter: "1", professional: "5", agency: "Unlimited" },
  { label: "Revenue analytics dashboard", starter: false, professional: true, agency: true },
  { label: "Automated payment reminders", starter: false, professional: true, agency: true },
  { label: "Client portal", starter: false, professional: true, agency: true },
  { label: "API access", starter: false, professional: false, agency: true },
  { label: "White-label branding", starter: false, professional: false, agency: true },
  { label: "Custom domain", starter: false, professional: false, agency: true },
  { label: "Dedicated account manager", starter: false, professional: false, agency: true },
  { label: "SLA guarantee", starter: false, professional: false, agency: true },
  { label: "Support", starter: "Email", professional: "Priority email", agency: "Phone & email" },
];

const faqs = [
  {
    question: "Can I try ContractFlow before paying?",
    answer:
      "Yes. Every plan comes with a 14-day free trial. No credit card is required to start. At the end of the trial, you can choose the plan that fits your business or cancel with no charge.",
  },
  {
    question: "Can I change my plan at any time?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at the end of your current billing period.",
  },
  {
    question: "What counts as an 'active client'?",
    answer:
      "An active client is any client record in your account with at least one contract or invoice created in the last 90 days. Archived clients don't count toward your limit.",
  },
  {
    question: "Is there a setup fee?",
    answer:
      "No setup fees, ever. The price you see is the price you pay. Stripe payment processing fees (typically 1.4% + 20p for European cards) are charged separately by Stripe.",
  },
  {
    question: "How do e-signatures work legally?",
    answer:
      "ContractFlow e-signatures are compliant with the UK Electronic Communications Act 2000 and the EU eIDAS Regulation. Each signature captures timestamp, IP address, and email verification, creating a complete audit trail.",
  },
  {
    question: "Can I white-label ContractFlow for my clients?",
    answer:
      "White-labelling is available on the Agency plan. You can use your own logo, brand colours, and a custom domain so your clients see your brand throughout the entire contract and payment journey.",
  },
  {
    question: "Do you offer annual billing?",
    answer:
      "Yes. Annual billing gives you two months free (equivalent to a ~17% discount). Switch to annual billing any time from your account settings.",
  },
  {
    question: "What happens to my data if I cancel?",
    answer:
      "Your data remains accessible for 30 days after cancellation so you can export everything. After 30 days, data is securely deleted. We never hold your data hostage.",
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <CheckCircle2 className="mx-auto h-5 w-5 text-primary" />;
  }
  if (value === false) {
    return <X className="mx-auto h-4 w-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm font-medium text-foreground">{value}</span>;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ContractFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-primary/5 to-background pb-16 pt-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-4 text-xl text-muted-foreground">
            Start free for 14 days. No credit card required.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="pb-16 pt-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Starter</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  For freelancers and solo operators.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">£49</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {["25 active clients", "20 contracts/month", "E-signatures", "Auto invoicing", "Stripe payments", "Email support"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-6 text-sm font-semibold transition-colors hover:bg-muted"
              >
                Start free trial
              </Link>
            </div>

            {/* Professional */}
            <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-primary p-8 shadow-xl shadow-primary/20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-1 text-xs font-bold text-white shadow">
                  MOST POPULAR
                </span>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-primary-foreground">Professional</h2>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  For growing agencies and consultancies.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-primary-foreground">£99</span>
                  <span className="text-primary-foreground/70">/mo</span>
                </div>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {[
                  "Unlimited clients",
                  "Unlimited contracts",
                  "5 team members",
                  "Custom templates",
                  "Revenue analytics",
                  "Automated reminders",
                  "Client portal",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary-foreground" />
                    <span className="text-primary-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-6 text-sm font-semibold text-primary transition-colors hover:bg-white/90"
              >
                Start free trial
              </Link>
            </div>

            {/* Agency */}
            <div className="flex flex-col rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-6">
                <h2 className="text-xl font-bold">Agency</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  For large agencies that need full control.
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold">£199</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {[
                  "Everything in Pro",
                  "Unlimited team members",
                  "White-label branding",
                  "Custom domain",
                  "API access",
                  "Dedicated account manager",
                  "SLA guarantee",
                  "Phone & email support",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Contact sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-2xl font-bold">Full feature comparison</h2>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-6 py-4 text-left font-semibold text-foreground">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">
                    Starter
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-primary">
                    Professional
                  </th>
                  <th className="px-6 py-4 text-center font-semibold text-foreground">
                    Agency
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {featureRows.map((row, i) => (
                  <tr
                    key={row.label}
                    className={i % 2 === 0 ? "bg-background" : "bg-muted/20"}
                  >
                    <td className="px-6 py-3.5 font-medium text-foreground">
                      <span className="flex items-center gap-1.5">
                        {row.label}
                        {row.tooltip && (
                          <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <FeatureValue value={row.starter} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <FeatureValue value={row.professional} />
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <FeatureValue value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-10 text-center text-2xl font-bold">
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <h3 className="mb-2 font-semibold text-foreground">
                  {faq.question}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold">Ready to get started?</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Join 2,000+ service businesses. 14-day free trial. No credit card.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/sign-up"
              className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-8 text-base font-semibold text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Start free trial
            </Link>
            <Link
              href="/"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border bg-background px-8 text-base font-semibold transition-colors hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold">ContractFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ContractFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
