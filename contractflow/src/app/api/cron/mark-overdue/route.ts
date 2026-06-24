import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";
import { sendOverdueReminderEmail } from "@/lib/emails";

// Called by Vercel Cron or an external scheduler daily.
// Authorization: Bearer token via CRON_SECRET env var.
export async function GET(request: NextRequest): Promise<Response> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all SENT invoices with a due date in the past
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: InvoiceStatus.SENT,
      dueDate: { lt: now },
    },
    include: {
      client: true,
      organization: true,
    },
  });

  if (overdueInvoices.length === 0) {
    return Response.json({ marked: 0, reminded: 0 });
  }

  // Batch-update status to OVERDUE
  await prisma.invoice.updateMany({
    where: {
      id: { in: overdueInvoices.map((i) => i.id) },
      status: InvoiceStatus.SENT,
    },
    data: { status: InvoiceStatus.OVERDUE },
  });

  // Send overdue reminder emails (best-effort)
  let reminded = 0;
  for (const invoice of overdueInvoices) {
    try {
      const daysOverdue = Math.floor(
        (now.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      await sendOverdueReminderEmail(
        invoice.client.email,
        invoice.invoiceNumber,
        Number(invoice.total),
        invoice.currency,
        invoice.organization.companyName,
        daysOverdue
      );
      reminded++;
    } catch (err) {
      console.error(`[cron/mark-overdue] Email failed for invoice ${invoice.invoiceNumber}:`, err);
    }
  }

  console.info(`[cron/mark-overdue] Marked ${overdueInvoices.length} invoices as overdue, reminded ${reminded}`);

  return Response.json({ marked: overdueInvoices.length, reminded });
}
