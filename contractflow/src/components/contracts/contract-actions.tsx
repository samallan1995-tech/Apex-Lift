"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SendIcon,
  EditIcon,
  CopyIcon,
  DownloadIcon,
  MoreHorizontalIcon,
  TrashIcon,
  RefreshCwIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendContract, duplicateContract, deleteContract } from "@/app/actions/contracts";
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

  function handleDelete() {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteContract(contract.id);
        toast({ title: "Contract deleted" });
        router.push("/contracts");
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete",
          variant: "destructive",
        });
      }
    });
  }

  function handleCopyLink() {
    navigator.clipboard.writeText(contract.signingUrl);
    toast({ title: "Signing link copied to clipboard" });
  }

  const isAlreadySent = ["SENT", "VIEWED"].includes(contract.status);
  const canEdit = contract.status === "DRAFT";
  const canSend = contract.status === "DRAFT";
  const canDelete = ["DRAFT", "EXPIRED", "CANCELLED"].includes(contract.status);

  return (
    <div className="flex items-center gap-2">
      {canSend && (
        <Button onClick={handleSend} disabled={isPending}>
          <SendIcon className="w-4 h-4 mr-2" />
          {isPending ? "Sending…" : "Send for Signature"}
        </Button>
      )}

      {isAlreadySent && (
        <>
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Copy Signing Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleSend} disabled={isPending}>
            <RefreshCwIcon className="w-4 h-4 mr-2" />
            Resend
          </Button>
        </>
      )}

      {canEdit && (
        <Link href={`/contracts/${contract.id}/edit`}>
          <Button variant="outline" size="sm">
            <EditIcon className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </Link>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="h-9 w-9">
            <MoreHorizontalIcon className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <a href={`/api/contracts/${contract.id}/pdf`} download>
              <DownloadIcon className="w-4 h-4 mr-2" />
              Download PDF
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate} disabled={isPending}>
            <CopyIcon className="w-4 h-4 mr-2" />
            Duplicate
          </DropdownMenuItem>
          {canDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete Contract
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
