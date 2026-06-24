import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getClients } from "@/app/actions/clients";
import { getTemplates } from "@/app/actions/templates";
import { ContractBuilder } from "@/components/contracts/contract-builder";
import { PageHeader } from "@/components/layout/page-header";

export const metadata = { title: "Edit Contract" };

export default async function EditContractPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user?.organization) redirect("/onboarding");

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: user.organization.id },
    include: {
      milestones: { orderBy: { order: "asc" } },
    },
  });

  if (!contract) notFound();

  if (!["DRAFT"].includes(contract.status)) {
    redirect(`/contracts/${id}`);
  }

  const [clients, templates] = await Promise.all([
    getClients(user.organization.id),
    getTemplates(),
  ]);

  const initialData = {
    id: contract.id,
    title: contract.title,
    clientId: contract.clientId,
    value: Number(contract.value),
    currency: contract.currency,
    content: contract.content,
    notes: contract.notes ?? undefined,
    startDate: contract.startDate?.toISOString().split("T")[0] ?? undefined,
    endDate: contract.endDate?.toISOString().split("T")[0] ?? undefined,
    isRecurring: contract.isRecurring,
    recurringType: contract.recurringType ?? undefined,
    milestones: contract.milestones.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description ?? undefined,
      amount: Number(m.amount),
      dueDate: m.dueDate?.toISOString().split("T")[0] ?? undefined,
      order: m.order,
    })),
  };

  const clientOptions = clients.map((c) => ({
    id: c.id,
    companyName: c.companyName,
    contactName: c.contactName,
  }));

  const templateOptions = templates.map((t) => ({
    id: t.id,
    name: t.name,
    content: t.content,
    category: t.category,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit Contract"
        description={`Editing: ${contract.title}`}
      />
      <ContractBuilder
        clients={clientOptions}
        templates={templateOptions}
        initialData={initialData}
      />
    </div>
  );
}
