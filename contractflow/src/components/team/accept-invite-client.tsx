"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuildingIcon, UserIcon, ShieldCheckIcon } from "lucide-react";
import { acceptInvite } from "@/app/actions/team";
import { useToast } from "@/components/ui/use-toast";

interface AcceptInviteClientProps {
  token: string;
  organizationName: string;
  role: string;
  email: string;
  expiresAt: string;
}

export function AcceptInviteClient({
  token,
  organizationName,
  role,
  email,
  expiresAt,
}: AcceptInviteClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  function handleAccept() {
    startTransition(async () => {
      try {
        await acceptInvite(token);
        toast({ title: "Welcome to the team!", description: `You've joined ${organizationName}` });
        router.push("/dashboard");
      } catch (e) {
        toast({
          title: "Error",
          description: (e as Error).message,
          variant: "destructive",
        });
      }
    });
  }

  const roleLabel = role.replace("_", " ");

  return (
    <Card>
      <CardContent className="pt-8 pb-8 text-center space-y-6">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto">
          <BuildingIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            You&apos;re invited to join
          </h1>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{organizationName}</p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <UserIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <ShieldCheckIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Role:</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {roleLabel}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            size="lg"
            onClick={handleAccept}
            disabled={isPending}
          >
            {isPending ? "Accepting..." : "Accept Invitation"}
          </Button>
          <p className="text-xs text-muted-foreground">
            By accepting, you agree to join {organizationName} on ContractFlow.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
