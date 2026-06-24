"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActivityType, ContractStatus } from "@prisma/client";
import { sendContractSignedEmail } from "@/lib/emails";

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

  if (contract.status === "SENT") {
    await prisma.contract.update({
      where: { id: contractId },
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
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      client: true,
      organization: { include: { owner: true } },
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) throw new Error("Contract not found");
  if (contract.status === "SIGNED") throw new Error("Contract already signed");
  if (!["SENT", "VIEWED"].includes(contract.status)) throw new Error("Contract cannot be signed");

  const signedAt = new Date();

  await prisma.contract.update({
    where: { id: contractId },
    data: {
      status: ContractStatus.SIGNED,
      signedAt,
      signatureData,
      signerIp,
      signerAgent,
    },
  });

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

  const depositMilestone = contract.milestones.find(
    (m) => m.title.toLowerCase().includes("deposit") && m.order === 0
  ) || contract.milestones[0];

  if (depositMilestone) {
    const { generateInvoiceNumber } = await import("@/lib/utils");
    const invoiceNumber = generateInvoiceNumber();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    await prisma.invoice.create({
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
    });

    await prisma.contractMilestone.update({
      where: { id: depositMilestone.id },
      data: { status: "INVOICED" },
    });

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
