"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { updateClient } from "@/app/actions/clients";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  companyName: z.string().min(1, "Company name required"),
  contactName: z.string().min(1, "Contact name required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  website: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
  currency: z.string().default("GBP"),
});

type FormValues = z.infer<typeof schema>;

interface Client {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  notes?: string | null;
  currency: string;
}

export function EditClientForm({ client }: { client: Client }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName: client.companyName,
      contactName: client.contactName,
      email: client.email,
      phone: client.phone ?? "",
      address: client.address ?? "",
      website: client.website ?? "",
      notes: client.notes ?? "",
      currency: client.currency,
    },
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        await updateClient(client.id, {
          ...values,
          website: values.website || undefined,
        });
        toast({ title: "Client updated" });
        router.push(`/clients/${client.id}`);
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Company Name *</Label>
              <Input className="h-9" {...register("companyName")} />
              {errors.companyName && <p className="text-xs text-destructive">{errors.companyName.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Contact Name *</Label>
              <Input className="h-9" {...register("contactName")} />
              {errors.contactName && <p className="text-xs text-destructive">{errors.contactName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Email *</Label>
              <Input type="email" className="h-9" {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Phone</Label>
              <Input className="h-9" {...register("phone")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Address</Label>
            <Textarea className="min-h-[72px] text-sm" {...register("address")} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Website</Label>
              <Input className="h-9" placeholder="https://example.com" {...register("website")} />
              {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Currency</Label>
              <Input className="h-9" {...register("currency")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea className="min-h-[80px] text-sm" {...register("notes")} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
