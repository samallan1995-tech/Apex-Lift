import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      organization: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireOrg() {
  const user = await requireAuth();
  if (!user.organization) redirect("/onboarding");
  return user;
}

export async function requireRole(roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

export async function syncClerkUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const user = await prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      avatarUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
      avatarUrl: clerkUser.imageUrl,
      role: UserRole.BUSINESS_OWNER,
    },
  });

  return user;
}

export function canManageClients(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.BUSINESS_OWNER, UserRole.TEAM_MEMBER].includes(role);
}

export function canManageContracts(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.BUSINESS_OWNER, UserRole.TEAM_MEMBER].includes(role);
}

export function canManageBilling(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.BUSINESS_OWNER].includes(role);
}

export function canManageTeam(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.BUSINESS_OWNER].includes(role);
}

export function canViewReports(role: UserRole): boolean {
  return [UserRole.ADMIN, UserRole.BUSINESS_OWNER].includes(role);
}
