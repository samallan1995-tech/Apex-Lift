"use client";

import { useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon, ZapIcon } from "lucide-react";
import { PLANS } from "@/lib/stripe";
import { useToast } from "@/components/ui/use-toast";

interface BillingSectionProps {
  org: {
    id: string;
    plan: string;
    stripeCustomerId: string | null;
    subscriptionId: string | null;
  };
}

const PLAN_FEATURES = {
  STARTER: ["25 clients", "20 contracts/month", "E-signatures", "Auto invoicing", "Stripe payments"],
  PROFESSIONAL: ["Unlimited clients", "Unlimited contracts", "5 team members", "Revenue forecasting", "Priority support"],
  AGENCY: ["Everything in Professional", "Unlimited team members", "White label branding", "Custom domain", "Custom email sender"],
};

export function BillingSection({ org }: BillingSectionProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  async function handleUpgrade(priceId: string) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priceId, organizationId: org.id }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch {
        toast({ title: "Error", description: "Failed to start checkout", variant: "destructive" });
      }
    });
  }

  async function handleManageBilling() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/stripe/portal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ organizationId: org.id }),
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch {
        toast({ title: "Error", description: "Failed to open billing portal", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You&apos;re on the{" "}
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {org.plan}
            </Badge>{" "}
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {PLAN_FEATURES[org.plan as keyof typeof PLAN_FEATURES]?.map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
          {org.stripeCustomerId && (
            <Button variant="outline" onClick={handleManageBilling} disabled={isPending}>
              Manage Billing & Invoices
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Upgrade Plans */}
      <div className="grid md:grid-cols-3 gap-4">
        {(Object.entries(PLANS) as [string, typeof PLANS[keyof typeof PLANS]][]).map(([key, plan]) => {
          const isCurrent = org.plan === key;
          return (
            <Card
              key={key}
              className={isCurrent ? "border-indigo-500 dark:border-indigo-400" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  {isCurrent && <Badge className="bg-indigo-100 text-indigo-700 text-xs">Current</Badge>}
                </div>
                <div className="text-2xl font-bold">
                  £{plan.price}
                  <span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 mb-4">
                  {PLAN_FEATURES[key as keyof typeof PLAN_FEATURES]?.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
                {!isCurrent && (
                  <Button
                    className="w-full"
                    variant={key === "PROFESSIONAL" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleUpgrade(plan.priceId)}
                    disabled={isPending}
                  >
                    <ZapIcon className="w-3.5 h-3.5 mr-1.5" />
                    Upgrade to {plan.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
