import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { sendPaymentReceivedEmail } from "@/lib/emails";
import { ActivityType, InvoiceStatus, PaymentStatus, SubscriptionPlan } from "@prisma/client";
import Stripe from "stripe";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function planFromPriceId(priceId: string | null | undefined): SubscriptionPlan {
  if (!priceId) return SubscriptionPlan.STARTER;
  if (priceId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) return SubscriptionPlan.PROFESSIONAL;
  if (priceId === process.env.STRIPE_AGENCY_PRICE_ID) return SubscriptionPlan.AGENCY;
  return SubscriptionPlan.STARTER;
}

async function logActivity(
  organizationId: string,
  type: ActivityType,
  message: string,
  options?: { entityId?: string; entityType?: string; metadata?: Record<string, unknown> }
): Promise<void> {
  await prisma.activity.create({
    data: {
      organizationId,
      type,
      message,
      entityId: options?.entityId,
      entityType: options?.entityType,
      metadata: options?.metadata ?? undefined,
    },
  });
}

// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

async function handlePaymentIntentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const invoice = await prisma.invoice.findFirst({
    where: { payments: { some: { stripePaymentIntent: pi.id } } },
    include: {
      client: true,
      organization: true,
      payments: { where: { stripePaymentIntent: pi.id } },
    },
  });

  if (!invoice) {
    console.warn(`[stripe/webhook] No invoice found for payment_intent ${pi.id}`);
    return;
  }

  // Idempotency guard: if already paid, skip all side-effects (handles webhook retries)
  const alreadyPaid = invoice.status === InvoiceStatus.PAID;

  const existingPayment = invoice.payments[0];

  // Update payment record and invoice atomically
  const paidAt = existingPayment?.paymentDate ?? new Date();

  if (!alreadyPaid) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: InvoiceStatus.PAID, paidAt },
    });
  }

  if (existingPayment) {
    if (existingPayment.status !== PaymentStatus.COMPLETED) {
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paymentDate: paidAt,
          stripeChargeId: typeof pi.latest_charge === "string" ? pi.latest_charge : undefined,
          paymentMethod: pi.payment_method_types[0] ?? undefined,
        },
      });
    }
  } else {
    await prisma.payment.create({
      data: {
        invoiceId: invoice.id,
        amount: invoice.total,
        currency: invoice.currency,
        status: PaymentStatus.COMPLETED,
        paymentDate: paidAt,
        stripePaymentIntent: pi.id,
        stripeChargeId: typeof pi.latest_charge === "string" ? pi.latest_charge : undefined,
        paymentMethod: pi.payment_method_types[0] ?? undefined,
      },
    });
  }

  if (!alreadyPaid) {
    // Log activity only on first successful processing
    await logActivity(
      invoice.organizationId,
      ActivityType.PAYMENT_RECEIVED,
      `Payment of ${new Intl.NumberFormat("en-GB", { style: "currency", currency: invoice.currency }).format(Number(invoice.total))} received for invoice ${invoice.invoiceNumber}`,
      { entityId: invoice.id, entityType: "Invoice", metadata: { paymentIntentId: pi.id } }
    );

    // Send confirmation email only once
    try {
      await sendPaymentReceivedEmail(
        invoice.client.email,
        invoice.invoiceNumber,
        Number(invoice.total),
        invoice.organization.companyName
      );
    } catch (err) {
      console.error("[stripe/webhook] Failed to send payment confirmation email:", err);
    }
  }
}

async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntent: pi.id },
    include: { invoice: true },
  });

  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });

    console.warn(
      `[stripe/webhook] PaymentIntent failed for invoice ${payment.invoice.invoiceNumber}: ${pi.last_payment_error?.message ?? "unknown error"}`
    );
  } else {
    console.warn(`[stripe/webhook] payment_intent.payment_failed — no payment record for ${pi.id}`);
  }
}

async function handleInvoicePaymentSucceeded(stripeInvoice: Stripe.Invoice): Promise<void> {
  if (!stripeInvoice.subscription) return; // only handle subscription invoices here

  const customerId = typeof stripeInvoice.customer === "string"
    ? stripeInvoice.customer
    : stripeInvoice.customer?.id;

  if (!customerId) return;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!org) {
    console.warn(`[stripe/webhook] No org found for Stripe customer ${customerId}`);
    return;
  }

  console.info(`[stripe/webhook] Subscription invoice paid for org ${org.id}`);
}

async function handleSubscriptionCreated(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!org) {
    console.warn(`[stripe/webhook] customer.subscription.created — no org for customer ${customerId}`);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id;
  const plan = planFromPriceId(priceId);
  const planExpiresAt = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      plan,
      subscriptionId: sub.id,
      planExpiresAt,
    },
  });

  console.info(`[stripe/webhook] Org ${org.id} subscription created — plan: ${plan}`);
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!org) {
    console.warn(`[stripe/webhook] customer.subscription.updated — no org for customer ${customerId}`);
    return;
  }

  const priceId = sub.items.data[0]?.price?.id;
  const plan = planFromPriceId(priceId);
  const planExpiresAt = sub.current_period_end
    ? new Date(sub.current_period_end * 1000)
    : null;

  // Handle cancellation at period end
  const isActive = sub.status === "active" || sub.status === "trialing";

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      plan: isActive ? plan : org.plan, // keep plan until period ends
      subscriptionId: sub.id,
      planExpiresAt,
    },
  });

  console.info(`[stripe/webhook] Org ${org.id} subscription updated — plan: ${plan}, status: ${sub.status}`);
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const org = await prisma.organization.findUnique({
    where: { stripeCustomerId: customerId },
  });

  if (!org) {
    console.warn(`[stripe/webhook] customer.subscription.deleted — no org for customer ${customerId}`);
    return;
  }

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      plan: SubscriptionPlan.STARTER,
      subscriptionId: null,
      planExpiresAt: null,
    },
  });

  console.info(`[stripe/webhook] Org ${org.id} subscription deleted — downgraded to STARTER`);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.mode !== "subscription") return;

  const customerId = typeof session.customer === "string"
    ? session.customer
    : session.customer?.id ?? null;

  const organizationId = session.metadata?.organizationId;

  if (!organizationId) {
    console.warn("[stripe/webhook] checkout.session.completed — missing organizationId in metadata");
    return;
  }

  const updateData: { stripeCustomerId?: string; subscriptionId?: string } = {};

  if (customerId) {
    updateData.stripeCustomerId = customerId;
  }

  if (typeof session.subscription === "string") {
    updateData.subscriptionId = session.subscription;

    // Fetch the full subscription to get plan details
    try {
      const sub = await stripe.subscriptions.retrieve(session.subscription);
      const priceId = sub.items.data[0]?.price?.id;
      const plan = planFromPriceId(priceId);
      const planExpiresAt = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;

      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          ...updateData,
          plan,
          planExpiresAt,
        },
      });

      console.info(`[stripe/webhook] Checkout completed — org ${organizationId} upgraded to ${plan}`);
    } catch (err) {
      console.error("[stripe/webhook] Failed to retrieve subscription after checkout:", err);
      if (Object.keys(updateData).length > 0) {
        await prisma.organization.update({
          where: { id: organizationId },
          data: updateData,
        });
      }
    }
  } else if (Object.keys(updateData).length > 0) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: updateData,
    });
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  if (!webhookSecret) {
    console.error("[stripe/webhook] STRIPE_WEBHOOK_SECRET is not set");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[stripe/webhook] Signature verification failed: ${message}`);
    return new Response(`Webhook signature verification failed: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      default:
        // Unhandled event — acknowledge receipt without error
        console.info(`[stripe/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[stripe/webhook] Error handling event ${event.type}:`, err);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
