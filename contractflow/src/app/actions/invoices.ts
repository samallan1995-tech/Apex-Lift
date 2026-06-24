"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { invoiceSchema } from "@/lib/validations";
import { generateInvoiceNumber } from "@/lib/utils";
import { resend, EMAIL_FROM } from "@/lib/resend";
import { stripe } from "@/lib/stripe";
import { ActivityType, InvoiceStatus, MilestoneStatus } from "@prisma/client";
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

export type InvoiceInput = z.infer<typeof invoiceSchema>;

export interface InvoiceFilters {
  status?: InvoiceStatus;
  clientId?: string;
  contractId?: string;
  overdue?: boolean;
}

export async function createInvoice(data: InvoiceInput) {
  const { user, organization } = await getAuthContext();

  const validated = invoiceSchema.parse(data);

  const invoiceNumber = generateInvoiceNumber();

  const amount = validated.lineItems.reduce((sum, item) => sum + item.amount, 0);
  const tax = validated.tax ?? 0;
  const total = amount + (amount * tax) / 100;

  const invoice = await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      clientId: validated.clientId,
      contractId: validated.contractId ?? null,
      milestoneId: validated.milestoneId ?? null,
      invoiceNumber,
      dueDate: validated.dueDate,
      amount: new Decimal(amount),
      tax: new Decimal(tax),
      total: new Decimal(total),
      currency: validated.currency,
      notes: validated.notes ?? null,
      lineItems: JSON.stringify(validated.lineItems),
      status: InvoiceStatus.DRAFT,
    },
    include: { client: true },
  });

  await logActivity(
    organization.id,
    ActivityType.INVOICE_CREATED,
    `Invoice created: ${invoiceNumber}`,
    {
      userId: user.id,
      entityId: invoice.id,
      entityType: "Invoice",
      metadata: { invoiceNumber, amount: total, clientId: validated.clientId },
    }
  );

  revalidatePath("/dashboard/invoices");
  return invoice;
}

export async function updateInvoice(id: string, data: Partial<InvoiceInput>) {
  const { organization } = await getAuthContext();

  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Invoice not found");
  if (existing.status === InvoiceStatus.PAID) {
    throw new Error("Cannot edit a paid invoice");
  }

  const partial = invoiceSchema.partial().parse(data);

  let amount = Number(existing.amount);
  let tax = Number(existing.tax);

  if (partial.lineItems) {
    amount = partial.lineItems.reduce((sum, item) => sum + item.amount, 0);
  }
  if (partial.tax !== undefined) {
    tax = partial.tax;
  }
  const total = amount + (amount * tax) / 100;

  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(partial.clientId ? { clientId: partial.clientId } : {}),
      ...(partial.contractId !== undefined ? { contractId: partial.contractId ?? null } : {}),
      ...(partial.milestoneId !== undefined ? { milestoneId: partial.milestoneId ?? null } : {}),
      ...(partial.dueDate ? { dueDate: partial.dueDate } : {}),
      ...(partial.notes !== undefined ? { notes: partial.notes ?? null } : {}),
      ...(partial.currency ? { currency: partial.currency } : {}),
      ...(partial.lineItems ? { lineItems: JSON.stringify(partial.lineItems) } : {}),
      amount: new Decimal(amount),
      tax: new Decimal(tax),
      total: new Decimal(total),
    },
  });

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  return invoice;
}

export async function deleteInvoice(id: string) {
  const { organization } = await getAuthContext();

  const existing = await prisma.invoice.findFirst({
    where: { id, organizationId: organization.id },
  });

  if (!existing) throw new Error("Invoice not found");
  if (existing.status === InvoiceStatus.PAID) {
    throw new Error("Cannot delete a paid invoice");
  }

  await prisma.invoice.delete({ where: { id } });

  revalidatePath("/dashboard/invoices");
}

export async function sendInvoice(id: string) {
  const { user, organization } = await getAuthContext();

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { client: true, contract: true },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === InvoiceStatus.PAID) {
    throw new Error("Invoice is already paid");
  }

  let stripePaymentUrl: string | null = null;

  // Create Stripe payment link if the org has a Stripe account
  if (organization.stripeAccountId) {
    try {
      const paymentLink = await stripe.paymentLinks.create(
        {
          line_items: [
            {
              price_data: {
                currency: invoice.currency.toLowerCase(),
                product_data: {
                  name: `Invoice ${invoice.invoiceNumber}`,
                  description: invoice.contract?.title ?? `Invoice from ${organization.companyName}`,
                },
                unit_amount: Math.round(Number(invoice.total) * 100),
              },
              quantity: 1,
            },
          ],
          metadata: {
            invoiceId: id,
            organizationId: organization.id,
          },
        },
        { stripeAccount: organization.stripeAccountId }
      );
      stripePaymentUrl = paymentLink.url;
    } catch {
      // Non-fatal: continue sending even if Stripe link creation fails
    }
  }

  const updated = await prisma.invoice.update({
    where: { id },
    data: {
      status: InvoiceStatus.SENT,
      sentAt: new Date(),
      ...(stripePaymentUrl ? { stripePaymentUrl } : {}),
    },
  });

  // Send email via Resend
  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invoices/${id}`;

  await resend.emails.send({
    from: organization.emailFrom ?? EMAIL_FROM,
    to: invoice.client.email,
    subject: `Invoice ${invoice.invoiceNumber} from ${organization.companyName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Invoice ${invoice.invoiceNumber}</h2>
        <p>Hi ${invoice.client.contactName},</p>
        <p>Please find your invoice for <strong>${new Intl.NumberFormat("en-GB", {
          style: "currency",
          currency: invoice.currency,
        }).format(Number(invoice.total))}</strong> attached.</p>
        <p>Payment is due by <strong>${invoice.dueDate.toLocaleDateString("en-GB")}</strong>.</p>
        ${
          stripePaymentUrl
            ? `<p>
            <a href="${stripePaymentUrl}" style="
              display: inline-block;
              background: #6366f1;
              color: white;
              padding: 12px 24px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: 600;
            ">Pay Now</a>
          </p>`
            : ""
        }
        <p>
          <a href="${invoiceUrl}">View Invoice</a>
        </p>
        <p style="color: #666; font-size: 14px;">Invoice #${invoice.invoiceNumber}</p>
      </div>
    `,
  });

  await logActivity(
    organization.id,
    ActivityType.INVOICE_SENT,
    `Invoice ${invoice.invoiceNumber} sent to ${invoice.client.contactName}`,
    {
      userId: user.id,
      entityId: id,
      entityType: "Invoice",
      metadata: {
        clientEmail: invoice.client.email,
        amount: Number(invoice.total),
        hasPaymentLink: Boolean(stripePaymentUrl),
      },
    }
  );

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  return updated;
}

export async function markInvoicePaid(id: string, paidAt?: Date) {
  const { user, organization } = await getAuthContext();

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: { client: true, milestone: true },
  });

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === InvoiceStatus.PAID) {
    throw new Error("Invoice is already marked as paid");
  }

  const paidDate = paidAt ?? new Date();

  await prisma.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.PAID,
        paidAt: paidDate,
      },
    });

    // If linked to a milestone, advance its status to PAID
    if (invoice.milestoneId) {
      await tx.contractMilestone.update({
        where: { id: invoice.milestoneId },
        data: { status: MilestoneStatus.PAID },
      });
    }

    // Record payment
    await tx.payment.create({
      data: {
        invoiceId: id,
        amount: invoice.total,
        currency: invoice.currency,
        status: "COMPLETED",
        paymentDate: paidDate,
      },
    });
  });

  await logActivity(
    organization.id,
    ActivityType.INVOICE_PAID,
    `Invoice ${invoice.invoiceNumber} marked as paid`,
    {
      userId: user.id,
      entityId: id,
      entityType: "Invoice",
      metadata: {
        amount: Number(invoice.total),
        clientId: invoice.clientId,
        paidAt: paidDate.toISOString(),
      },
    }
  );

  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${id}`);
  revalidatePath("/dashboard");
}

export async function getInvoices(orgId: string, filters?: InvoiceFilters) {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const now = new Date();

  // Build status filter: overdue takes precedence over a caller-supplied status
  // to avoid the spread silently overwriting it.
  const statusFilter = filters?.overdue
    ? { status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] }, dueDate: { lt: now } }
    : filters?.status
    ? { status: filters.status }
    : {};

  const invoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      ...statusFilter,
      ...(filters?.clientId ? { clientId: filters.clientId } : {}),
      ...(filters?.contractId ? { contractId: filters.contractId } : {}),
    },
    include: {
      client: {
        select: { id: true, companyName: true, contactName: true, email: true },
      },
      contract: {
        select: { id: true, title: true, contractNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices;
}

export async function getInvoice(id: string) {
  const { organization } = await getAuthContext();

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: organization.id },
    include: {
      client: true,
      contract: true,
      milestone: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) throw new Error("Invoice not found");

  return invoice;
}
