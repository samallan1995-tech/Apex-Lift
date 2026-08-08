import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { EditClientForm } from "@/components/clients/edit-client-form";

export const metadata = { title: "Edit Client" };

export default async function EditClientPage({
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

  const client = await prisma.client.findFirst({
    where: { id, organizationId: user.organization.id },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Edit Client"
        description={client.companyName}
      />
      <EditClientForm client={client} />
    </div>
  );
}
