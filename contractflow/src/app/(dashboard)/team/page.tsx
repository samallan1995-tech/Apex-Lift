import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamPageClient } from "@/components/team/team-page-client";
import { PLAN_LIMITS } from "@/lib/constants";
import { getInitials, formatDate } from "@/lib/utils";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const [members, pendingInvites] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: user.organization.id },
      orderBy: { createdAt: "asc" },
    }),
    prisma.teamInvite.findMany({
      where: {
        organizationId: user.organization.id,
        accepted: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const plan = user.organization.plan as keyof typeof PLAN_LIMITS;
  const memberLimit = PLAN_LIMITS[plan]?.teamMembers;
  const canInvite = memberLimit === Infinity || members.length < memberLimit;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Team"
        description={`${members.length} member${members.length !== 1 ? "s" : ""}${memberLimit !== Infinity ? ` / ${memberLimit} allowed` : ""}`}
      />

      <TeamPageClient
        members={members.map((m) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          avatarUrl: m.avatarUrl,
          createdAt: m.createdAt.toISOString(),
          isCurrentUser: m.id === user.id,
        }))}
        pendingInvites={pendingInvites.map((inv) => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          expiresAt: inv.expiresAt.toISOString(),
          createdAt: inv.createdAt.toISOString(),
        }))}
        canInvite={canInvite}
        currentUserRole={user.role}
        plan={user.organization.plan}
        memberLimit={memberLimit === Infinity ? null : memberLimit}
      />
    </div>
  );
}
