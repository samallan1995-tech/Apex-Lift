"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlusIcon, MailIcon, CalendarIcon, TrashIcon, ShieldIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inviteTeamMember, removeTeamMember, cancelInvite } from "@/app/actions/team";
import { useToast } from "@/components/ui/use-toast";
import { getInitials, formatDate } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl: string | null;
  createdAt: string;
  isCurrentUser: boolean;
}

interface PendingInvite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamPageClientProps {
  members: Member[];
  pendingInvites: PendingInvite[];
  canInvite: boolean;
  currentUserRole: string;
  plan: string;
  memberLimit: number | null;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-700",
  BUSINESS_OWNER: "bg-indigo-100 text-indigo-700",
  TEAM_MEMBER: "bg-gray-100 text-gray-700",
};

export function TeamPageClient({
  members,
  pendingInvites,
  canInvite,
  currentUserRole,
  plan,
  memberLimit,
}: TeamPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("TEAM_MEMBER");

  const canManage = ["ADMIN", "BUSINESS_OWNER"].includes(currentUserRole);

  function handleInvite() {
    if (!inviteEmail) return;
    startTransition(async () => {
      try {
        await inviteTeamMember(inviteEmail, inviteRole as any);
        toast({ title: "Invite sent", description: `An invitation has been sent to ${inviteEmail}` });
        setShowInviteDialog(false);
        setInviteEmail("");
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send invite",
          variant: "destructive",
        });
      }
    });
  }

  function handleRemove(memberId: string) {
    startTransition(async () => {
      try {
        await removeTeamMember(memberId);
        toast({ title: "Member removed" });
        router.refresh();
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to remove member",
          variant: "destructive",
        });
      }
    });
  }

  function handleCancelInvite(inviteId: string) {
    startTransition(async () => {
      try {
        await cancelInvite(inviteId);
        toast({ title: "Invite cancelled" });
        router.refresh();
      } catch (error) {
        toast({ title: "Error", description: "Failed to cancel invite", variant: "destructive" });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {memberLimit && (
            <p className="text-sm text-muted-foreground">
              {members.length} of {memberLimit} seats used
            </p>
          )}
        </div>
        {canManage && (
          <Button
            onClick={() => setShowInviteDialog(true)}
            disabled={!canInvite}
            title={!canInvite ? `Upgrade to add more team members` : undefined}
          >
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Team Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={member.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-medium flex items-center gap-2">
                      {member.name}
                      {member.isCurrentUser && (
                        <span className="text-xs text-muted-foreground">(you)</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <MailIcon className="w-3 h-3" />
                      {member.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${ROLE_COLORS[member.role] || ""}`}>
                    {member.role.replace("_", " ")}
                  </Badge>
                  {canManage && !member.isCurrentUser && member.role !== "BUSINESS_OWNER" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemove(member.id)}
                      disabled={isPending}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Pending Invites ({pendingInvites.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 rounded-lg border border-dashed">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                      <MailIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm">{invite.email}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-3 h-3" />
                        Expires {formatDate(invite.expiresAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{invite.role.replace("_", " ")}</Badge>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground h-7"
                        onClick={() => handleCancelInvite(invite.id)}
                        disabled={isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEAM_MEMBER">Team Member</SelectItem>
                  <SelectItem value="BUSINESS_OWNER">Business Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowInviteDialog(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleInvite} className="flex-1" disabled={isPending || !inviteEmail}>
                {isPending ? "Sending..." : "Send Invite"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
