import { NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<Response> {
  let event: WebhookEvent;

  try {
    event = await verifyWebhook(request);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[clerk/webhook] Webhook verification failed: ${message}`);
    return new Response(`Webhook verification failed: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      // -----------------------------------------------------------------------
      // user.created
      // -----------------------------------------------------------------------
      case "user.created": {
        const data = event.data;
        const primaryEmailId = data.primary_email_address_id;
        const emailObj = data.email_addresses.find((e) => e.id === primaryEmailId);
        const email = emailObj?.email_address;

        if (!email) {
          console.warn(`[clerk/webhook] user.created — no primary email for clerk user ${data.id}`);
          break;
        }

        const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || email;

        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email,
            name,
            avatarUrl: data.image_url ?? null,
          },
          create: {
            clerkId: data.id,
            email,
            name,
            avatarUrl: data.image_url ?? null,
            role: UserRole.BUSINESS_OWNER,
          },
        });

        console.info(`[clerk/webhook] User created/synced: ${data.id} (${email})`);
        break;
      }

      // -----------------------------------------------------------------------
      // user.updated
      // -----------------------------------------------------------------------
      case "user.updated": {
        const data = event.data;
        const primaryEmailId = data.primary_email_address_id;
        const emailObj = data.email_addresses.find((e) => e.id === primaryEmailId);
        const email = emailObj?.email_address;

        const existing = await prisma.user.findUnique({
          where: { clerkId: data.id },
        });

        if (!existing) {
          console.warn(`[clerk/webhook] user.updated — no DB user for clerk user ${data.id}`);
          break;
        }

        const name = [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || existing.name;

        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            ...(email ? { email } : {}),
            name,
            avatarUrl: data.image_url ?? null,
          },
        });

        console.info(`[clerk/webhook] User updated: ${data.id}`);
        break;
      }

      // -----------------------------------------------------------------------
      // user.deleted — anonymise PII rather than hard delete to preserve
      // relational integrity (activity logs, sent contracts, etc.)
      // -----------------------------------------------------------------------
      case "user.deleted": {
        const data = event.data;
        const clerkId = data.id;

        if (!clerkId) {
          console.warn("[clerk/webhook] user.deleted — missing id in payload");
          break;
        }

        const existing = await prisma.user.findUnique({
          where: { clerkId },
        });

        if (!existing) {
          console.warn(`[clerk/webhook] user.deleted — no DB user for clerk user ${clerkId}`);
          break;
        }

        // Anonymise PII; keep the record so FK references remain valid
        await prisma.user.update({
          where: { clerkId },
          data: {
            email: `deleted-${existing.id}@deleted.invalid`,
            name: "Deleted User",
            avatarUrl: null,
          },
        });

        console.info(`[clerk/webhook] User anonymised: ${clerkId} (DB id: ${existing.id})`);
        break;
      }

      // -----------------------------------------------------------------------
      // session.created — optional; no persistent session tracking needed
      // since Clerk manages sessions, but we log for audit purposes
      // -----------------------------------------------------------------------
      case "session.created": {
        const data = event.data;
        console.info(`[clerk/webhook] Session created for user ${data.user_id ?? "unknown"}`);
        break;
      }

      default:
        console.info(`[clerk/webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[clerk/webhook] Error handling event ${event.type}:`, err);
    return new Response("Internal server error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
