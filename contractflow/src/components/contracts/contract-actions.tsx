"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SendIcon, EditIcon, CopyIcon, DownloadIcon, CheckCircleIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendContract, duplicateContract } from "@/app/actions/contracts";
import { useToast } from "@/components/ui/use-toast";

interface ContractActionsProps {
  contract: {
    id: string;
    status: string;
    signingUrl: string;
    pdfUrl: string | null;
  };
}

export function ContractActions({ contract }: ContractActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleSend() {
    startTransition(async () => {
      try {
        await sendContract(contract.id);
        toast({ title: "Contract sent", description: "The client has been notified." });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send contract",
          variant: "destructive",
        });
      }
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      try {
        const newContract = await duplicateContract(contract.id);
        toast({ title: "Contract duplicated" });
        router.push(`/contracts/${newContract.id}`);
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to duplicate",
          variant: "destructive",
        });
      }
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(contract.signingUrl);
    toast({ title: "Signing link copied to clipboard" });
  }

  return (
    <div className="flex items-center gap-2">
      {contract.status === "DRAFT" && (
        <Button onClick={handleSend} disabled={isPending}>
          <SendIcon className="w-4 h-4 mr-2" />
          {isPending ? "Sending..." : "Send for Signature"}
        </Button>
      )}
      {(contract.status === "SENT" || contract.status === "VIEWED") && (
        <Button variant="outline" onClick={handleCopyLink} size="sm">
          <CopyIcon className="w-4 h-4 mr-2" />
          Copy Signing Link
        </Button>
      )}
      <Link href={`/contracts/${contract.id}/edit`}>
        <Button variant="outline" size="sm">
          <EditIcon className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {contract.pdfUrl && (
            <DropdownMenuItem asChild>
              <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download PDF
              </a>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive">Delete Contract</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
