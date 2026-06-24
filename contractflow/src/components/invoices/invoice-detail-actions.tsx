"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SendIcon,
  CheckCircleIcon,
  TrashIcon,
  MoreHorizontalIcon,
  ExternalLinkIcon,
  DownloadIcon,
} from "lucide-react";
import { sendInvoice, markInvoicePaid, deleteInvoice } from "@/app/actions/invoices";
import { useToast } from "@/components/ui/use-toast";

interface InvoiceDetailActionsProps {
  invoice: {
    id: string;
    status: string;
    invoiceNumber: string;
    stripePaymentUrl?: string;
  };
}

export function InvoiceDetailActions({ invoice }: InvoiceDetailActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    startTransition(async () => {
      try {
        await sendInvoice(invoice.id);
        toast({ title: "Invoice sent successfully" });
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      }
    });
  }

  function handleMarkPaid() {
    startTransition(async () => {
      try {
        await markInvoicePaid(invoice.id);
        toast({ title: "Invoice marked as paid" });
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete invoice ${invoice.invoiceNumber}?`)) return;
    startTransition(async () => {
      try {
        await deleteInvoice(invoice.id);
        toast({ title: "Invoice deleted" });
        router.push("/invoices");
      } catch (e) {
        toast({ title: "Error", description: (e as Error).message, variant: "destructive" });
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {invoice.stripePaymentUrl && invoice.status !== "PAID" && (
        <Button variant="outline" size="sm" asChild>
          <a href={invoice.stripePaymentUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkIcon className="w-4 h-4 mr-2" />
            Pay Now
          </a>
        </Button>
      )}

      {invoice.status === "DRAFT" && (
        <Button size="sm" onClick={handleSend} disabled={isPending}>
          <SendIcon className="w-4 h-4 mr-2" />
          Send Invoice
        </Button>
      )}

      {invoice.status !== "PAID" && invoice.status !== "DRAFT" && (
        <Button size="sm" onClick={handleMarkPaid} disabled={isPending}>
          <CheckCircleIcon className="w-4 h-4 mr-2" />
          Mark Paid
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={`/api/invoices/${invoice.id}/pdf`} download>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </DropdownMenuItem>
          {invoice.status === "SENT" && (
            <DropdownMenuItem onClick={handleSend} disabled={isPending}>
              <SendIcon className="w-4 h-4 mr-2" />
              Resend Invoice
            </DropdownMenuItem>
          )}
          {invoice.status !== "PAID" && (
            <DropdownMenuItem onClick={handleMarkPaid} disabled={isPending}>
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              Mark as Paid
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={handleDelete}
            disabled={isPending || invoice.status === "PAID"}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
