import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ContractBuilder } from "@/components/contracts/contract-builder";
import { getTemplates } from "@/app/actions/templates";

export const metadata = { title: "New Contract" };

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const clients = await prisma.client.findMany({
    where: { organizationId: user.organization.id },
    orderBy: { companyName: "asc" },
    select: { id: true, companyName: true, contactName: true, email: true },
  });

  const templates = await getTemplates(user.organization.id);

  return (
    <div className="max-w-4xl mx-auto">
      <ContractBuilder
        clients={clients}
        templates={templates}
        defaultClientId={params.clientId}
        organizationName={user.organization.companyName}
      />
    </div>
  );
}
