"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { organizationSchema, type OrganizationInput } from "@/lib/validations";
import { updateOrganization } from "@/app/actions/organizations";
import { useToast } from "@/components/ui/use-toast";

interface OrgSettingsFormProps {
  org: {
    id: string;
    companyName: string;
    logo: string;
    primaryColor: string;
    accentColor: string;
    emailFrom: string;
    customDomain: string;
    plan: string;
  };
}

export function OrgSettingsForm({ org }: OrgSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<OrganizationInput>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      companyName: org.companyName,
      logo: org.logo,
      primaryColor: org.primaryColor,
      accentColor: org.accentColor,
      emailFrom: org.emailFrom,
      customDomain: org.customDomain,
    },
  });

  function onSubmit(data: OrganizationInput) {
    startTransition(async () => {
      try {
        await updateOrganization(org.id, data);
        toast({ title: "Settings saved", description: "Your organization settings have been updated." });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save settings",
          variant: "destructive",
        });
      }
    });
  }

  const isAgency = org.plan === "AGENCY";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Settings</CardTitle>
        <CardDescription>Update your company information and branding.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Ltd" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://yoursite.com/logo.png" {...field} />
                  </FormControl>
                  <FormDescription>Public URL to your company logo</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex gap-2">
                      <input type="color" value={field.value || "#6366f1"} onChange={(e) => field.onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <FormControl>
                        <Input placeholder="#6366f1" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="accentColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Accent Color</FormLabel>
                    <div className="flex gap-2">
                      <input type="color" value={field.value || "#8b5cf6"} onChange={(e) => field.onChange(e.target.value)} className="w-10 h-10 rounded cursor-pointer border" />
                      <FormControl>
                        <Input placeholder="#8b5cf6" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="emailFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email From Address</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="hello@yourcompany.com" {...field} disabled={!isAgency} />
                  </FormControl>
                  <FormDescription>
                    {isAgency ? "Custom email sender for your clients." : "Available on Agency plan."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isAgency && (
              <FormField
                control={form.control}
                name="customDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custom Domain</FormLabel>
                    <FormControl>
                      <Input placeholder="app.yourcompany.com" {...field} />
                    </FormControl>
                    <FormDescription>White-label domain for client-facing pages</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
