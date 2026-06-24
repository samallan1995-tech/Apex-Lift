"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendTeamInviteEmail } from "@/lib/emails";
import { UserRole } from "@prisma/client";
import { addDays } from "date-fns";

export async function inviteTeamMember(email: string, role: UserRole = UserRole.TEAM_MEMBER) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  if (![UserRole.ADMIN, UserRole.BUSINESS_OWNER].includes(user.role)) {
    throw new Error("Insufficient permissions");
  }

  const existingInvite = await prisma.teamInvite.findFirst({
    where: {
      organizationId: user.organization.id,
      email,
      accepted: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (existingInvite) throw new Error("Invite already sent to this email");

  const invite = await prisma.teamInvite.create({
    data: {
      organizationId: user.organization.id,
      email,
      role,
      expiresAt: addDays(new Date(), 7),
    },
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invite.token}`;
  await sendTeamInviteEmail(email, user.organization.companyName, user.name, inviteUrl);

  revalidatePath("/team");
  return invite;
}

export async function acceptInvite(token: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const invite = await prisma.teamInvite.findUnique({ where: { token } });
  if (!invite) throw new Error("Invite not found");
  if (invite.accepted) throw new Error("Invite already accepted");
  if (invite.expiresAt < new Date()) throw new Error("Invite expired");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User not found");

  if (user.email !== invite.email) throw new Error("Email mismatch");

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        organizationId: invite.organizationId,
        role: invite.role,
      },
    }),
    prisma.teamInvite.update({
      where: { id: invite.id },
      data: { accepted: true },
    }),
  ]);

  revalidatePath("/team");
  revalidatePath("/dashboard");
}

export async function removeTeamMember(memberId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const currentUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!currentUser?.organization) throw new Error("Organization not found");

  if (![UserRole.ADMIN, UserRole.BUSINESS_OWNER].includes(currentUser.role)) {
    throw new Error("Insufficient permissions");
  }

  const member = await prisma.user.findUnique({ where: { id: memberId } });
  if (!member || member.organizationId !== currentUser.organization.id) {
    throw new Error("Member not found");
  }

  if (member.id === currentUser.id) throw new Error("Cannot remove yourself");

  await prisma.user.update({
    where: { id: memberId },
    data: { organizationId: null },
  });

  revalidatePath("/team");
}

export async function getTeamMembers(orgId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const members = await prisma.user.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "asc" },
  });

  const pendingInvites = await prisma.teamInvite.findMany({
    where: {
      organizationId: orgId,
      accepted: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return { members, pendingInvites };
}

export async function cancelInvite(inviteId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) throw new Error("Organization not found");

  await prisma.teamInvite.delete({
    where: { id: inviteId, organizationId: user.organization.id },
  });

  revalidatePath("/team");
}
