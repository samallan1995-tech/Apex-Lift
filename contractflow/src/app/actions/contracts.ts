"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { contractSchema, milestoneSchema } from "@/lib/validations";
import { generateContractNumber, generateInvoiceNumber } from "@/lib/utils";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { ActivityType, ContractStatus, MilestoneStatus, InvoiceStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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
  options?: {
    userId?: string;
    entityId?: string;
    entityType?: string;
    metadata?: Record<string, unknown>;
  }
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

export type ContractInput = z.infer<typeof contractSchema> & {
  milestones?: Array<z.infer<typeof milestoneSchema>>;
  templateId?: string;
};

export type MilestoneInput = z.infer<typeof milestoneSchema>;

export interface ContractFilters {
  status?: ContractStatus;
  clientId?: string;
  isRecurring?: boolean;
  startDateFrom?: Date;
  startDateTo?: Date;
}

export async function createContract(data: ContractInput) {
  const { user, organization } = await getAuthContext();

  const { milestones, templateId, ...contractData } = data;
  const validated = contractSchema.parse(contractData);

  const contractNumber = generateContractNumber();

  const contract = await prisma.contract.create({
    data: {
      ...validated,
      value: new Decimal(validated.value),
      contractNumber,
      organizationId: organization.id,
      templateId: templateId ?? null,
      milestones: milestones?.length
        ? {
            create: milestones.map((m, idx) => ({
              title: m.title,
              description: m.description ?? null,
              amount: new Decimal(m.amount),
              dueDate: m.dueDate ?? null,
              order: m.order ?? idx,
            })),
          }
        : undefined,
    },
    include: { milestones: true, client: true },
  });

  await logActivity(
    organization.id,
    ActivityType.CONTRACT_CREATED,
    `Contract created: ${contract.title}`,
    {
      userId: user.id,
      entityId: contract.id,
      entityType: "Contract",
      metadata: { contractNumber, clientId: contract.clientId },
    }
  );

  revalidatePath("/dashboard/contracts");
  return contract;
}

export async function updateContract(id: string, data: Partial<ContractInput>) {
  const { user, organization } = await getAuthContext();

  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Contract not found");

  const { milestones: _milestones, templateId, ...contractData } = data;
  const partial = contractSchema.partial().parse(contractData);

  // Save current content as a new version before updating
  if (partial.content && partial.content !== existing.content) {
    await prisma.contractVersion.create({
      data: {
        contractId: id,
        version: existing.version,
        content: existing.content,
      },
    });
  }

  const contract = await prisma.contract.update({
    where: { id },
    data: {
      ...partial,
      ...(partial.value !== undefined ? { value: new Decimal(partial.value) } : {}),
      ...(partial.content ? { version: existing.version + 1 } : {}),
    },
    include: { milestones: true, client: true },
  });

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${id}`);
  return contract;
}

export async function deleteContract(id: string) {
  const { organization } = await getAuthContext();

  const existing = await prisma.contract.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Contract not found");

  await prisma.contract.delete({ where: { id } });

  revalidatePath("/dashboard/contracts");
}

export async function sendContract(id: string) {
  const { user, organization } = await getAuthContext();

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: organization.id },
    include: { client: true },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status === ContractStatus.SIGNED) {
    throw new Error("Cannot send an already signed contract");
  }

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: ContractStatus.SENT,
      sentById: user.id,
    },
  });

  // Send email via Resend
  const signLink = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${id}`;
  await resend.emails.send({
    from: organization.emailFrom ?? EMAIL_FROM,
    to: contract.client.email,
    subject: `${organization.companyName} sent you a contract: ${contract.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You have a contract to review</h2>
        <p>Hi ${contract.client.contactName},</p>
        <p>${organization.companyName} has sent you a contract titled <strong>${contract.title}</strong> for your review and signature.</p>
        <p>
          <a href="${signLink}" style="
            display: inline-block;
            background: #6366f1;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
          ">Review &amp; Sign Contract</a>
        </p>
        <p style="color: #666; font-size: 14px;">Contract #${contract.contractNumber}</p>
      </div>
    `,
  });

  await logActivity(
    organization.id,
    ActivityType.CONTRACT_SENT,
    `Contract sent to ${contract.client.contactName} (${contract.client.email})`,
    {
      userId: user.id,
      entityId: id,
      entityType: "Contract",
      metadata: { clientEmail: contract.client.email, contractNumber: contract.contractNumber },
    }
  );

  revalidatePath("/dashboard/contracts");
  revalidatePath(`/dashboard/contracts/${id}`);
  return updated;
}

export async function getContracts(orgId: string, filters?: ContractFilters) {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const contracts = await prisma.contract.findMany({
    where: {
      organizationId: orgId,
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.isRecurring !== undefined ? { isRecurring: filters.isRecurring } : {}),
      ...(filters?.startDateFrom || filters?.startDateTo
        ? {
            startDate: {
              ...(filters.startDateFrom ? { gte: filters.startDateFrom } : {}),
              ...(filters.startDateTo ? { lte: filters.startDateTo } : {}),
            },
          }
        : {}),
    },
    include: {
      client: {
        select: { id: true, companyName: true, contactName: true, email: true },
      },
      milestones: {
        select: { id: true, title: true, amount: true, status: true, dueDate: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return contracts;
}

export async function getContract(id: string) {
  const { organization } = await getAuthContext();

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      client: true,
      sentBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
      milestones: { orderBy: { order: "asc" } },
      invoices: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
      versions: { orderBy: { version: "desc" } },
    },
  });

  if (!contract) throw new Error("Contract not found");

  return contract;
}

export async function duplicateContract(id: string) {
  const { user, organization } = await getAuthContext();

  const original = await prisma.contract.findFirst({
    where: { id, organizationId: organization.id },
    include: { milestones: true },
  });

  if (!original) throw new Error("Contract not found");

  const contractNumber = generateContractNumber();

  const duplicate = await prisma.contract.create({
    data: {
      organizationId: organization.id,
      clientId: original.clientId,
      title: `${original.title} (Copy)`,
      contractNumber,
      content: original.content,
      value: original.value,
      currency: original.currency,
      notes: original.notes,
      isRecurring: original.isRecurring,
      recurringType: original.recurringType,
      templateId: original.templateId,
      parentId: original.id,
      status: ContractStatus.DRAFT,
      milestones: original.milestones.length
        ? {
            create: original.milestones.map((m) => ({
              title: m.title,
              description: m.description,
              amount: m.amount,
              dueDate: m.dueDate,
              order: m.order,
            })),
          }
        : undefined,
    },
    include: { milestones: true, client: true },
  });

  await logActivity(
    organization.id,
    ActivityType.CONTRACT_CREATED,
    `Contract duplicated: ${duplicate.title}`,
    {
      userId: user.id,
      entityId: duplicate.id,
      entityType: "Contract",
      metadata: { originalId: id, contractNumber },
    }
  );

  revalidatePath("/dashboard/contracts");
  return duplicate;
}

export async function addMilestone(contractId: string, data: MilestoneInput) {
  const { organization } = await getAuthContext();

  const contract = await prisma.contract.findFirst({
    where: { id: contractId, organizationId: organization.id },
    include: { _count: { select: { milestones: true } } },
  });

  if (!contract) throw new Error("Contract not found");

  const validated = milestoneSchema.parse(data);

  const milestone = await prisma.contractMilestone.create({
    data: {
      contractId,
      title: validated.title,
      description: validated.description ?? null,
      amount: new Decimal(validated.amount),
      dueDate: validated.dueDate ?? null,
      order: validated.order ?? contract._count.milestones,
    },
  });

  revalidatePath(`/dashboard/contracts/${contractId}`);
  return milestone;
}

export async function updateMilestone(id: string, data: Partial<MilestoneInput>) {
  const { organization } = await getAuthContext();

  const existing = await prisma.contractMilestone.findFirst({
    where: {
      id,
      contract: { organizationId: organization.id },
    },
  });

  if (!existing) throw new Error("Milestone not found");

  const partial = milestoneSchema.partial().parse(data);

  const milestone = await prisma.contractMilestone.update({
    where: { id },
    data: {
      ...partial,
      ...(partial.amount !== undefined ? { amount: new Decimal(partial.amount) } : {}),
    },
  });

  revalidatePath(`/dashboard/contracts/${existing.contractId}`);
  return milestone;
}

export async function completeMilestone(id: string) {
  const { user, organization } = await getAuthContext();

  const milestone = await prisma.contractMilestone.findFirst({
    where: {
      id,
      contract: { organizationId: organization.id },
    },
    include: {
      contract: {
        include: { client: true },
      },
    },
  });

  if (!milestone) throw new Error("Milestone not found");
  if (milestone.status !== MilestoneStatus.PENDING) {
    throw new Error("Milestone is not in PENDING status");
  }

  // Mark milestone complete and create invoice in one transaction
  const [updatedMilestone, invoice] = await prisma.$transaction(async (tx) => {
    const updated = await tx.contractMilestone.update({
      where: { id },
      data: {
        status: MilestoneStatus.INVOICED,
        completedAt: new Date(),
      },
    });

    const invoiceNumber = generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Net 30

    const inv = await tx.invoice.create({
      data: {
        organizationId: organization.id,
        clientId: milestone.contract.clientId,
        contractId: milestone.contractId,
        milestoneId: id,
        invoiceNumber,
        dueDate,
        amount: milestone.amount,
        tax: new Decimal(0),
        total: milestone.amount,
        currency: milestone.contract.currency,
        status: InvoiceStatus.DRAFT,
        lineItems: JSON.stringify([
          {
            description: `${milestone.contract.title} — ${milestone.title}`,
            quantity: 1,
            unitPrice: Number(milestone.amount),
            amount: Number(milestone.amount),
          },
        ]),
      },
    });

    return [updated, inv];
  });

  await logActivity(
    organization.id,
    ActivityType.MILESTONE_COMPLETED,
    `Milestone completed: ${milestone.title}`,
    {
      userId: user.id,
      entityId: id,
      entityType: "ContractMilestone",
      metadata: {
        contractId: milestone.contractId,
        invoiceId: invoice.id,
        amount: Number(milestone.amount),
      },
    }
  );

  revalidatePath(`/dashboard/contracts/${milestone.contractId}`);
  revalidatePath("/dashboard/invoices");
  return { milestone: updatedMilestone, invoice };
}
