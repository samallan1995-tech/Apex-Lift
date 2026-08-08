import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgSettingsForm } from "@/components/settings/org-settings-form";
import { BillingSection } from "@/components/settings/billing-section";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const org = user.organization;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Settings" description="Manage your organization and account settings" />

      <Tabs defaultValue="organization">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4 mt-6">
          <OrgSettingsForm
            org={{
              id: org.id,
              companyName: org.companyName,
              logo: org.logo || "",
              primaryColor: org.primaryColor || "#6366f1",
              accentColor: org.accentColor || "#8b5cf6",
              emailFrom: org.emailFrom || "",
              customDomain: org.customDomain || "",
              plan: org.plan,
            }}
          />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingSection
            org={{
              id: org.id,
              plan: org.plan,
              stripeCustomerId: org.stripeCustomerId,
              subscriptionId: org.subscriptionId,
            }}
          />
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which email notifications you receive.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Contract Signed", description: "When a client signs your contract" },
                  { label: "Invoice Paid", description: "When an invoice is paid" },
                  { label: "Payment Overdue", description: "When an invoice becomes overdue" },
                  { label: "Upcoming Milestone", description: "3 days before a milestone is due" },
                  { label: "Team Member Joined", description: "When someone joins your team" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Enabled</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
