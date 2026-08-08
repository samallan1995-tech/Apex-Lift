"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityType, ContractStatus } from "@prisma/client";
import { sendContractSignedEmail } from "@/lib/emails";
import { generateInvoiceNumber } from "@/lib/utils";

export async function getContractForSigning(contractId: string) {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      client: true,
      organization: true,
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) throw new Error("Contract not found");

  if (!["SENT", "VIEWED"].includes(contract.status)) {
    if (contract.status === "SIGNED") {
      return { contract, alreadySigned: true };
    }
    throw new Error("This contract is not available for signing");
  }

  // Atomically transition SENT → VIEWED (idempotent if already VIEWED)
  if (contract.status === "SENT") {
    await prisma.contract.updateMany({
      where: { id: contractId, status: ContractStatus.SENT },
      data: { status: ContractStatus.VIEWED },
    });

    await prisma.activity.create({
      data: {
        organizationId: contract.organizationId,
        type: ActivityType.CONTRACT_VIEWED,
        message: `Contract "${contract.title}" was viewed by ${contract.client.contactName}`,
        entityId: contract.id,
        entityType: "contract",
      },
    });
  }

  return { contract, alreadySigned: false };
}

export async function signContract(
  contractId: string,
  signatureData: string,
  signerName: string,
  signerEmail: string,
  signerIp: string,
  signerAgent: string
) {
  // Use updateMany with a status filter — the WHERE clause acts as an optimistic lock.
  // If count === 0 the contract was already signed (race condition handled).
  const signedAt = new Date();

  const { count } = await prisma.contract.updateMany({
    where: {
      id: contractId,
      status: { in: [ContractStatus.SENT, ContractStatus.VIEWED] },
    },
    data: {
      status: ContractStatus.SIGNED,
      signedAt,
      signatureData,
      signerIp,
      signerAgent,
    },
  });

  if (count === 0) {
    // Either doesn't exist or was already signed by a concurrent request
    const existing = await prisma.contract.findUnique({ where: { id: contractId } });
    if (!existing) throw new Error("Contract not found");
    if (existing.status === "SIGNED") throw new Error("Contract already signed");
    throw new Error("Contract cannot be signed");
  }

  // Re-fetch with relations for downstream use
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      client: true,
      organization: { include: { owner: true } },
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) throw new Error("Contract not found after signing");

  await prisma.auditLog.create({
    data: {
      action: "CONTRACT_SIGNED",
      entity: "contract",
      entityId: contractId,
      metadata: {
        signerName,
        signerEmail,
        signerIp,
        signerAgent,
        signedAt: signedAt.toISOString(),
      },
      ipAddress: signerIp,
      userAgent: signerAgent,
    },
  });

  await prisma.activity.create({
    data: {
      organizationId: contract.organizationId,
      type: ActivityType.CONTRACT_SIGNED,
      message: `Contract "${contract.title}" was signed by ${signerName}`,
      entityId: contractId,
      entityType: "contract",
    },
  });

  // Find deposit milestone: prefer one explicitly named "deposit" at any order,
  // then fall back to order=0 — but only if it hasn't already been invoiced/paid.
  const eligibleMilestones = contract.milestones.filter(
    (m) => !["INVOICED", "PAID"].includes(m.status)
  );

  const depositMilestone =
    eligibleMilestones.find((m) => m.title.toLowerCase().includes("deposit")) ??
    eligibleMilestones.find((m) => m.order === 0) ??
    eligibleMilestones[0];

  if (depositMilestone) {
    const invoiceNumber = generateInvoiceNumber();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await prisma.$transaction([
      prisma.invoice.create({
        data: {
          organizationId: contract.organizationId,
          clientId: contract.clientId,
          contractId,
          milestoneId: depositMilestone.id,
          invoiceNumber,
          dueDate,
          amount: depositMilestone.amount,
          tax: 0,
          total: depositMilestone.amount,
          currency: contract.currency,
          status: "DRAFT",
          lineItems: [
            {
              description: `${depositMilestone.title} - ${contract.title}`,
              quantity: 1,
              unitPrice: Number(depositMilestone.amount),
              amount: Number(depositMilestone.amount),
            },
          ],
        },
      }),
      prisma.contractMilestone.update({
        where: { id: depositMilestone.id },
        data: { status: "INVOICED" },
      }),
    ]);

    await prisma.activity.create({
      data: {
        organizationId: contract.organizationId,
        type: ActivityType.INVOICE_CREATED,
        message: `Deposit invoice ${invoiceNumber} created automatically`,
        entityId: contractId,
        entityType: "contract",
      },
    });
  }

  if (contract.organization.owner?.email) {
    await sendContractSignedEmail(
      contract.organization.owner.email,
      contract.title,
      signerName,
      contract.organization.companyName
    );
  }

  revalidatePath(`/contracts/${contractId}`);
  revalidatePath("/contracts");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");

  return { success: true, signedAt };
}
