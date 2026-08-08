import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusIcon, ExternalLinkIcon } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CONTRACT_STATUS_COLORS } from "@/lib/constants";
import { ContractStatus } from "@prisma/client";

export const metadata = { title: "Contracts" };

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const statusFilter = params.status as ContractStatus | undefined;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const contracts = await prisma.contract.findMany({
    where: {
      organizationId: user.organization.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: {
      client: { select: { companyName: true, contactName: true } },
      _count: { select: { milestones: true, invoices: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    ALL: contracts.length,
    DRAFT: contracts.filter((c) => c.status === "DRAFT").length,
    SENT: contracts.filter((c) => c.status === "SENT").length,
    VIEWED: contracts.filter((c) => c.status === "VIEWED").length,
    SIGNED: contracts.filter((c) => c.status === "SIGNED").length,
  };

  const totalValue = contracts.reduce((sum, c) => sum + Number(c.value), 0);
  const signedValue = contracts
    .filter((c) => c.status === "SIGNED")
    .reduce((sum, c) => sum + Number(c.value), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts"
        description="Manage your client contracts"
        actions={
          <Link href="/contracts/new">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Contract
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{counts.ALL}</div>
            <div className="text-sm text-muted-foreground">Total Contracts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{counts.SIGNED}</div>
            <div className="text-sm text-muted-foreground">Signed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-muted-foreground">Total Value</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(signedValue)}</div>
            <div className="text-sm text-muted-foreground">Signed Value</div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts Table with Tabs */}
      <Tabs defaultValue="ALL">
        <TabsList>
          <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
          <TabsTrigger value="SENT">Sent ({counts.SENT})</TabsTrigger>
          <TabsTrigger value="SIGNED">Signed ({counts.SIGNED})</TabsTrigger>
        </TabsList>

        {["ALL", "DRAFT", "SENT", "VIEWED", "SIGNED"].map((status) => {
          const filtered = status === "ALL" ? contracts : contracts.filter((c) => c.status === status);
          return (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="p-0">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No {status === "ALL" ? "" : status.toLowerCase()} contracts found.</p>
                      <Link href="/contracts/new">
                        <Button variant="link" className="mt-2">Create your first contract</Button>
                      </Link>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contract</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Value</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((contract) => (
                          <TableRow key={contract.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{contract.title}</div>
                                <div className="text-xs text-muted-foreground">{contract.contractNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">{contract.client.companyName}</div>
                              <div className="text-xs text-muted-foreground">{contract.client.contactName}</div>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(Number(contract.value))}</TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${CONTRACT_STATUS_COLORS[contract.status] || ""}`}
                              >
                                {contract.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(contract.createdAt)}
                            </TableCell>
                            <TableCell>
                              <Link href={`/contracts/${contract.id}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <ExternalLinkIcon className="w-3.5 h-3.5" />
                                </Button>
                              </Link>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
