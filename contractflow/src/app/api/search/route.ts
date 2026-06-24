import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest): Promise<Response> {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return Response.json({ results: [] });

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) return Response.json({ results: [] });

  const orgId = user.organizationId;

  const [clients, contracts, invoices] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, companyName: true, contactName: true, email: true },
      take: 5,
    }),
    prisma.contract.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { contractNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, title: true, contractNumber: true, status: true },
      take: 5,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { invoiceNumber: { contains: q, mode: "insensitive" } },
          { client: { companyName: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        total: true,
        currency: true,
        client: { select: { companyName: true } },
      },
      take: 5,
    }),
  ]);

  const results = [
    ...clients.map((c) => ({
      type: "client" as const,
      id: c.id,
      title: c.companyName,
      subtitle: c.contactName,
      url: `/clients/${c.id}`,
    })),
    ...contracts.map((c) => ({
      type: "contract" as const,
      id: c.id,
      title: c.title,
      subtitle: `${c.contractNumber} · ${c.status}`,
      url: `/contracts/${c.id}`,
    })),
    ...invoices.map((i) => ({
      type: "invoice" as const,
      id: i.id,
      title: i.invoiceNumber,
      subtitle: `${i.client.companyName} · ${i.status}`,
      url: `/invoices/${i.id}`,
    })),
  ];

  return Response.json({ results });
}
