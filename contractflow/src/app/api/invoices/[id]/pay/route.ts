import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  // Authenticate the request
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: invoiceId } = await params;

  // Fetch the invoice and related data
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      organization: true,
    },
  });

  if (!invoice) {
    return Response.json({ error: "Invoice not found" }, { status: 404 });
  }

  // Verify the authenticated user belongs to the invoice's organisation
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (!user || user.organizationId !== invoice.organizationId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent re-payment of already paid invoices
  if (invoice.status === "PAID") {
    return Response.json({ error: "Invoice is already paid" }, { status: 400 });
  }

  if (invoice.status === "VOID") {
    return Response.json({ error: "Invoice has been voided" }, { status: 400 });
  }

  // Check for an existing, non-failed PaymentIntent for this invoice
  const existingPayment = await prisma.payment.findFirst({
    where: {
      invoiceId: invoice.id,
      status: { in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED] },
      stripePaymentIntent: { not: null },
    },
  });

  if (existingPayment?.stripePaymentIntent) {
    // Re-use the existing PaymentIntent
    try {
      const existingPi = await stripe.paymentIntents.retrieve(
        existingPayment.stripePaymentIntent
      );

      if (existingPi.status !== "canceled") {
        return Response.json({
          clientSecret: existingPi.client_secret,
          paymentIntentId: existingPi.id,
        });
      }
    } catch {
      // Existing PI is no longer valid — create a new one below
    }
  }

  // Resolve or create Stripe customer for the client's organisation
  let stripeCustomerId = invoice.organization.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: invoice.client.email,
      name: invoice.client.companyName || invoice.client.contactName,
      metadata: { organizationId: invoice.organizationId },
    });

    stripeCustomerId = customer.id;

    await prisma.organization.update({
      where: { id: invoice.organizationId },
      data: { stripeCustomerId },
    });
  }

  // Amount in smallest currency unit (pence for GBP)
  const amountInSmallestUnit = Math.round(Number(invoice.total) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInSmallestUnit,
    currency: invoice.currency.toLowerCase(),
    customer: stripeCustomerId,
    description: `Invoice ${invoice.invoiceNumber} — ${invoice.organization.companyName}`,
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      organizationId: invoice.organizationId,
      clientId: invoice.clientId,
    },
    receipt_email: invoice.client.email,
    automatic_payment_methods: { enabled: true },
  });

  // Create a pending Payment record linked to this PaymentIntent
  await prisma.payment.create({
    data: {
      invoiceId: invoice.id,
      amount: invoice.total,
      currency: invoice.currency,
      status: PaymentStatus.PENDING,
      stripePaymentIntent: paymentIntent.id,
    },
  });

  if (!paymentIntent.client_secret) {
    return Response.json(
      { error: "Failed to create payment intent — missing client secret" },
      { status: 500 }
    );
  }

  return Response.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}
