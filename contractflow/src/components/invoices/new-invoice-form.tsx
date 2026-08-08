"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { PlusIcon, TrashIcon } from "lucide-react";
import { createInvoice } from "@/app/actions/invoices";
import { useToast } from "@/components/ui/use-toast";
import { formatCurrency } from "@/lib/utils";

const lineItemSchema = z.object({
  description: z.string().min(1, "Description required"),
  quantity: z.coerce.number().positive(),
  unitPrice: z.coerce.number().min(0),
  amount: z.coerce.number().min(0),
});

const schema = z.object({
  clientId: z.string().min(1, "Client required"),
  contractId: z.string().optional(),
  dueDate: z.string().min(1, "Due date required"),
  currency: z.string().default("GBP"),
  tax: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().optional(),
  lineItems: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

type FormValues = z.infer<typeof schema>;

interface ClientOption {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
}

interface ContractOption {
  id: string;
  title: string;
  contractNumber: string;
  clientId: string;
}

interface NewInvoiceFormProps {
  clients: ClientOption[];
  contracts: ContractOption[];
}

const CURRENCIES = ["GBP", "USD", "EUR", "AUD", "CAD"];

export function NewInvoiceForm({ clients, contracts }: NewInvoiceFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [selectedClientId, setSelectedClientId] = useState<string>("");

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "GBP",
      tax: 0,
      lineItems: [{ description: "", quantity: 1, unitPrice: 0, amount: 0 }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({ control, name: "lineItems" });

  const lineItems = watch("lineItems");
  const tax = watch("tax") ?? 0;
  const currency = watch("currency") ?? "GBP";

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const taxAmount = (subtotal * Number(tax)) / 100;
  const total = subtotal + taxAmount;

  function updateLineItemAmount(index: number) {
    const item = lineItems[index];
    const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    setValue(`lineItems.${index}.amount`, amount);
  }

  const filteredContracts = selectedClientId
    ? contracts.filter((c) => c.clientId === selectedClientId)
    : contracts;

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      try {
        const invoice = await createInvoice({
          clientId: values.clientId,
          contractId: values.contractId || undefined,
          dueDate: new Date(values.dueDate),
          currency: values.currency,
          tax: values.tax,
          notes: values.notes,
          lineItems: values.lineItems,
        });
        toast({ title: "Invoice created" });
        router.push(`/invoices/${invoice.id}`);
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Client *</Label>
              <Select
                onValueChange={(v) => {
                  setValue("clientId", v);
                  setSelectedClientId(v);
                  setValue("contractId", "");
                }}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-xs text-destructive">{errors.clientId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Related Contract (optional)</Label>
              <Select onValueChange={(v) => setValue("contractId", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {filteredContracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Due Date *</Label>
              <Input
                type="date"
                className="h-9"
                {...register("dueDate")}
              />
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Currency</Label>
              <Select defaultValue="GBP" onValueChange={(v) => setValue("currency", v)}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Tax (%)</Label>
              <Input
                type="number"
                className="h-9"
                placeholder="0"
                {...register("tax")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm">Line Items</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unitPrice: 0, amount: 0 })}
          >
            <PlusIcon className="w-3.5 h-3.5 mr-1" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-5">
                {index === 0 && <Label className="text-xs mb-1.5 block">Description</Label>}
                <Input
                  className="h-9 text-sm"
                  placeholder="Service description"
                  {...register(`lineItems.${index}.description`)}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-xs mb-1.5 block">Qty</Label>}
                <Input
                  type="number"
                  className="h-9 text-sm"
                  min="0"
                  step="1"
                  {...register(`lineItems.${index}.quantity`, {
                    onChange: () => updateLineItemAmount(index),
                  })}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-xs mb-1.5 block">Unit Price</Label>}
                <Input
                  type="number"
                  className="h-9 text-sm"
                  min="0"
                  step="0.01"
                  {...register(`lineItems.${index}.unitPrice`, {
                    onChange: () => updateLineItemAmount(index),
                  })}
                />
              </div>
              <div className="col-span-2">
                {index === 0 && <Label className="text-xs mb-1.5 block">Amount</Label>}
                <Input
                  type="number"
                  className="h-9 text-sm bg-muted"
                  readOnly
                  {...register(`lineItems.${index}.amount`)}
                />
              </div>
              <div className={`col-span-1 ${index === 0 ? "mt-6" : ""}`}>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 text-muted-foreground"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}

          {errors.lineItems && (
            <p className="text-xs text-destructive">{errors.lineItems.message}</p>
          )}

          <Separator />

          <div className="space-y-2 text-sm ml-auto max-w-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal, currency)}</span>
            </div>
            {Number(tax) > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax ({tax}%)</span>
                <span>{formatCurrency(taxAmount, currency)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-indigo-600">{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              placeholder="Payment terms, bank details, or any other notes..."
              className="min-h-[80px] text-sm"
              {...register("notes")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  );
}
