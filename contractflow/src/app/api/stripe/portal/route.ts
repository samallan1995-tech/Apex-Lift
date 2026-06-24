import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
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

  const { organizationId } = parsed;

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

  if (!org.stripeCustomerId) {
    return Response.json(
      { error: "No Stripe customer found. Please subscribe to a plan first." },
      { status: 400 }
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: org.stripeCustomerId,
    return_url: `${appUrl}/settings/billing`,
  });

  return Response.json({ url: portalSession.url });
}
