import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe, PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ALLOWED_PRICE_IDS = new Set(
  Object.values(PLANS)
    .map((p) => p.priceId)
    .filter(Boolean)
);

const bodySchema = z.object({
  priceId: z.string().min(1).refine(
    (id) => ALLOWED_PRICE_IDS.has(id),
    { message: "Invalid price ID" }
  ),
  organizationId: z.string().min(1),
});

export async function POST(request: NextRequest): Promise<Response> {
  // Authenticate the request
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse + validate body
  let parsed: z.infer<typeof bodySchema>;
  try {
    const raw = await request.json();
    parsed = bodySchema.parse(raw);
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { priceId, organizationId } = parsed;

  // Verify the authenticated user belongs to this organisation and can manage billing
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  if (user.organizationId !== organizationId) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const org = user.organization;
  if (!org) {
    return Response.json({ error: "Organization not found" }, { status: 404 });
  }

  // Resolve or create Stripe customer
  let stripeCustomerId = org.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: org.companyName,
      metadata: { organizationId: org.id },
    });

    stripeCustomerId = customer.id;

    await prisma.organization.update({
      where: { id: org.id },
      data: { stripeCustomerId },
    });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Create Checkout Session
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    metadata: {
      organizationId: org.id,
    },
    success_url: `${appUrl}/settings/billing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/settings/billing?checkout=cancelled`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    subscription_data: {
      metadata: {
        organizationId: org.id,
      },
    },
  });

  if (!session.url) {
    return Response.json({ error: "Failed to create checkout session" }, { status: 500 });
  }

  return Response.json({ url: session.url });
}
