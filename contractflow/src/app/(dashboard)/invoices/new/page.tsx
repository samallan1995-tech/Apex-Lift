import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getClients } from "@/app/actions/clients";
import { PageHeader } from "@/components/layout/page-header";
import { NewInvoiceForm } from "@/components/invoices/new-invoice-form";

export const metadata = { title: "New Invoice" };

export default async function NewInvoicePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user?.organization) redirect("/onboarding");

  const [clients, contracts] = await Promise.all([
    getClients(user.organization.id),
    prisma.contract.findMany({
      where: { organizationId: user.organization.id, status: { in: ["SIGNED", "ACTIVE"] } },
      select: { id: true, title: true, contractNumber: true, clientId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const clientOptions = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName,
    email: c.email,
  }));

  const contractOptions = contracts.map((c) => ({
    id: c.id,
    title: c.title,
    contractNumber: c.contractNumber,
    clientId: c.clientId,
  }));

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="New Invoice" description="Create a new invoice to send to a client" />
      <NewInvoiceForm clients={clientOptions} contracts={contractOptions} />
    </div>
  );
}
