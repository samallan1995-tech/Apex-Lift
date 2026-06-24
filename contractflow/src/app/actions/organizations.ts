"use server";

import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { organizationSchema } from "@/lib/validations";
import { UserRole } from "@prisma/client";

async function getAuthContext() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user) throw new Error("User not found");

  return { user, userId };
}

export type OrganizationInput = z.infer<typeof organizationSchema>;

export async function createOrganization(data: OrganizationInput) {
  const { user, userId } = await getAuthContext();

  if (user.organization) {
    throw new Error("User already belongs to an organization");
  }

  const validated = organizationSchema.parse(data);

  const organization = await prisma.organization.create({
    data: {
      companyName: validated.companyName,
      logo: validated.logo || null,
      primaryColor: validated.primaryColor ?? "#6366f1",
      accentColor: validated.accentColor ?? "#8b5cf6",
      emailFrom: validated.emailFrom || null,
      customDomain: validated.customDomain || null,
      ownerId: user.id,
    },
  });

  // Link user to organization and set role to BUSINESS_OWNER
  await prisma.user.update({
    where: { id: user.id },
    data: {
      organizationId: organization.id,
      role: UserRole.BUSINESS_OWNER,
    },
  });

  // Update Clerk user metadata
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      organizationId: organization.id,
      role: UserRole.BUSINESS_OWNER,
    },
  });

  revalidatePath("/dashboard");
  return organization;
}

export async function updateOrganization(id: string, data: Partial<OrganizationInput>) {
  const { user } = await getAuthContext();

  if (!user.organization || user.organization.id !== id) {
    throw new Error("Organization not found or access denied");
  }

  if (
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.BUSINESS_OWNER
  ) {
    throw new Error("Insufficient permissions");
  }

  const partial = organizationSchema.partial().parse(data);

  const organization = await prisma.organization.update({
    where: { id },
    data: {
      ...(partial.companyName ? { companyName: partial.companyName } : {}),
      ...(partial.logo !== undefined ? { logo: partial.logo || null } : {}),
      ...(partial.primaryColor ? { primaryColor: partial.primaryColor } : {}),
      ...(partial.accentColor ? { accentColor: partial.accentColor } : {}),
      ...(partial.emailFrom !== undefined ? { emailFrom: partial.emailFrom || null } : {}),
      ...(partial.customDomain !== undefined ? { customDomain: partial.customDomain || null } : {}),
    },
  });

  revalidatePath("/dashboard/settings");
  return organization;
}

export async function getOrganization(id: string) {
  const { user } = await getAuthContext();

  if (!user.organization || user.organization.id !== id) {
    throw new Error("Organization not found or access denied");
  }

  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, avatarUrl: true, role: true },
      },
      // Members via User relation (organizationId FK)
      clients: { select: { id: true }, take: 1 },
      contracts: { select: { id: true }, take: 1 },
      teamInvites: {
        where: { accepted: false, expiresAt: { gt: new Date() } },
        select: { id: true, email: true, role: true, createdAt: true },
      },
    },
  });

  if (!organization) throw new Error("Organization not found");

  // Fetch members separately (users with this organizationId)
  const members = await prisma.user.findMany({
    where: { organizationId: id },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  return { ...organization, members };
}

export async function completeOnboarding(orgId: string) {
  const { user, userId } = await getAuthContext();

  if (!user.organization || user.organization.id !== orgId) {
    throw new Error("Organization not found or access denied");
  }

  await prisma.organization.update({
    where: { id: orgId },
    data: { onboardingCompleted: true },
  });

  // Update Clerk user metadata to reflect onboarding completion
  const clerk = await clerkClient();
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: {
      organizationId: orgId,
      role: user.role,
      onboardingCompleted: true,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/onboarding");
}
