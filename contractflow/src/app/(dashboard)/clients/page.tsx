import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ClientsPageClient } from "@/components/clients/clients-page-client";

export const metadata = { title: "Clients" };

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const search = params.search || "";

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user?.organization) redirect("/onboarding");

  const clients = await prisma.client.findMany({
    where: {
      organizationId: user.organization.id,
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: "insensitive" } },
              { contactName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: {
        select: { contracts: true, invoices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = await prisma.invoice.groupBy({
    by: ["clientId"],
    where: {
      organizationId: user.organization.id,
      status: "PAID",
    },
    _sum: { amount: true },
  });

  const revenueMap = Object.fromEntries(
    totalRevenue.map((r) => [r.clientId, Number(r._sum.amount || 0)])
  );

  const clientsWithRevenue = clients.map((c) => ({
    ...c,
    totalRevenue: revenueMap[c.id] || 0,
  }));

  return (
    <ClientsPageClient
      initialClients={clientsWithRevenue}
      initialSearch={search}
      organizationId={user.organization.id}
    />
  );
}
