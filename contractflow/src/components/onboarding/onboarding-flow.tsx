"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, BuildingIcon, CreditCardIcon, UsersIcon, RocketIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { createOrganization, completeOnboarding } from "@/app/actions/organizations";
import { inviteTeamMember } from "@/app/actions/team";

const orgSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const detailsSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

const inviteSchema = z.object({
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

type OrgInput = z.infer<typeof orgSchema>;
type DetailsInput = z.infer<typeof detailsSchema>;
type InviteInput = z.infer<typeof inviteSchema>;

interface OnboardingFlowProps {
  existingOrg: { id: string; companyName: string } | null;
  userId: string;
}

const STEPS = [
  { id: 1, title: "Create Organization", icon: BuildingIcon },
  { id: 2, title: "Business Details", icon: BuildingIcon },
  { id: 3, title: "Connect Stripe", icon: CreditCardIcon },
  { id: 4, title: "Invite Team", icon: UsersIcon },
  { id: 5, title: "Complete Setup", icon: RocketIcon },
];

export function OnboardingFlow({ existingOrg, userId }: OnboardingFlowProps) {
  const router = useRouter();
  const [step, setStep] = useState(existingOrg ? 2 : 1);
  const [orgId, setOrgId] = useState(existingOrg?.id || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const orgForm = useForm<OrgInput>({
    resolver: zodResolver(orgSchema),
    defaultValues: { companyName: existingOrg?.companyName || "" },
  });

  const detailsForm = useForm<DetailsInput>({ resolver: zodResolver(detailsSchema) });
  const inviteForm = useForm<InviteInput>({ resolver: zodResolver(inviteSchema) });

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  async function handleCreateOrg(data: OrgInput) {
    setIsLoading(true);
    setError("");
    try {
      const org = await createOrganization({ companyName: data.companyName, logo: data.logo });
      setOrgId(org.id);
      setStep(2);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create organization");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDetails() {
    setStep(3);
  }

  async function handleStripeSkip() {
    setStep(4);
  }

  async function handleInvite(data: InviteInput) {
    setIsLoading(true);
    setError("");
    try {
      if (data.email) {
        await inviteTeamMember(data.email);
      }
      setStep(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send invite");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleComplete() {
    setIsLoading(true);
    try {
      if (orgId) await completeOnboarding(orgId);
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to complete onboarding");
      setIsLoading(false);
    }
  }

  return (
    <div>
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          {STEPS.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  step > s.id
                    ? "bg-indigo-600 text-white"
                    : step === s.id
                    ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                }`}
              >
                {step > s.id ? <CheckCircleIcon className="w-4 h-4" /> : s.id}
              </div>
              <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">{s.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Step 1: Organization */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Create your organization</CardTitle>
            <CardDescription>This is how your business will appear on contracts and invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={orgForm.handleSubmit(handleCreateOrg)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company / Business Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Acme Design Studio"
                  {...orgForm.register("companyName")}
                />
                {orgForm.formState.errors.companyName && (
                  <p className="text-sm text-red-500">{orgForm.formState.errors.companyName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL (optional)</Label>
                <Input id="logo" placeholder="https://yoursite.com/logo.png" {...orgForm.register("logo")} />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating..." : "Continue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Business details</CardTitle>
            <CardDescription>Add your contact information for contracts and invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={detailsForm.handleSubmit(handleDetails)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+44 20 0000 0000" {...detailsForm.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Input id="address" placeholder="123 High Street, London" {...detailsForm.register("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://yoursite.com" {...detailsForm.register("website")} />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button type="submit" className="flex-1">Continue</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Stripe */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Connect Stripe for payments</CardTitle>
            <CardDescription>
              Connect your Stripe account to automatically collect invoice payments from clients.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4 text-sm text-indigo-700 dark:text-indigo-300">
              <p className="font-medium mb-2">How to connect Stripe:</p>
              <ol className="list-decimal list-inside space-y-1 text-indigo-600 dark:text-indigo-400">
                <li>Go to Settings → Billing after setup</li>
                <li>Click &quot;Connect Stripe Account&quot;</li>
                <li>Sign in to your Stripe account</li>
                <li>Authorise ContractFlow</li>
              </ol>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              You can also skip this step and connect Stripe later from Settings.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button type="button" onClick={handleStripeSkip} className="flex-1">
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Invite Team */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Invite your team</CardTitle>
            <CardDescription>Add team members who will help manage contracts and clients. You can skip this and invite later.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={inviteForm.handleSubmit(handleInvite)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteEmail">Team member email</Label>
                <Input id="inviteEmail" type="email" placeholder="colleague@company.com" {...inviteForm.register("email")} />
                {inviteForm.formState.errors.email && (
                  <p className="text-sm text-red-500">{inviteForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                <Button type="button" variant="ghost" onClick={() => setStep(5)} className="flex-1">Skip</Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send invite"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 5 && (
        <Card>
          <CardContent className="pt-8 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircleIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">You&apos;re all set!</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Your ContractFlow account is ready. Start by creating your first contract or adding a client.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-left space-y-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick start:</p>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p>① Add your first client in the Clients section</p>
                <p>② Create a contract using one of our templates</p>
                <p>③ Send it for signature and track the status</p>
                <p>④ Invoices are created automatically when milestones complete</p>
              </div>
            </div>
            <Button onClick={handleComplete} className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? "Setting up..." : "Go to Dashboard"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
