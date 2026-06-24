"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { clientSchema } from "@/lib/validations";
import { ActivityType } from "@prisma/client";

async function getAuthContext() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user?.organization) throw new Error("Organization not found");

  return { user, organization: user.organization };
}

async function logActivity(
  organizationId: string,
  type: ActivityType,
  message: string,
  options?: { userId?: string; entityId?: string; entityType?: string; metadata?: Record<string, unknown> }
) {
  await prisma.activity.create({
    data: {
      organizationId,
      type,
      message,
      userId: options?.userId,
      entityId: options?.entityId,
      entityType: options?.entityType,
      metadata: options?.metadata ?? undefined,
    },
  });
}

export type ClientInput = z.infer<typeof clientSchema>;

export async function createClient(data: ClientInput) {
  const { user, organization } = await getAuthContext();

  const validated = clientSchema.parse(data);

  const client = await prisma.client.create({
    data: {
      ...validated,
      tags: validated.tags ?? [],
      organizationId: organization.id,
    },
  });

  await logActivity(organization.id, ActivityType.CLIENT_ADDED, `New client added: ${client.companyName}`, {
    userId: user.id,
    entityId: client.id,
    entityType: "Client",
  });

  revalidatePath("/dashboard/clients");
  return client;
}

export async function updateClient(id: string, data: Partial<ClientInput>) {
  const { user, organization } = await getAuthContext();

  const existing = await prisma.client.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Client not found");

  const partial = clientSchema.partial().parse(data);

  const client = await prisma.client.update({
    where: { id },
    data: {
      ...partial,
      tags: partial.tags ?? existing.tags,
    },
  });

  await logActivity(organization.id, ActivityType.CLIENT_UPDATED, `Client updated: ${client.companyName}`, {
    userId: user.id,
    entityId: client.id,
    entityType: "Client",
  });

  revalidatePath("/dashboard/clients");
  revalidatePath(`/dashboard/clients/${id}`);
  return client;
}

export async function deleteClient(id: string) {
  const { organization } = await getAuthContext();

  const existing = await prisma.client.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Client not found");

  await prisma.client.delete({ where: { id } });

  revalidatePath("/dashboard/clients");
}

export interface ClientFilters {
  country?: string;
  tags?: string[];
  hasContracts?: boolean;
}

export async function getClients(
  orgId: string,
  search?: string,
  filters?: ClientFilters
) {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const clients = await prisma.client.findMany({
    where: {
      organizationId: orgId,
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { contactName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters?.country ? { country: filters.country } : {}),
      ...(filters?.tags?.length
        ? { tags: { hasSome: filters.tags } }
        : {}),
      ...(filters?.hasContracts !== undefined
        ? {
            contracts: filters.hasContracts
              ? { some: {} }
              : { none: {} },
          }
        : {}),
    },
    include: {
      _count: {
        select: { contracts: true, invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients;
}

export async function getClient(id: string) {
  const { organization } = await getAuthContext();

  const client = await prisma.client.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      contracts: {
        orderBy: { createdAt: "desc" },
        include: { milestones: true },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) throw new Error("Client not found");

  return client;
}
