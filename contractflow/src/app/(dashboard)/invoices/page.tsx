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
import { PlusIcon, ExternalLinkIcon, AlertCircleIcon } from "lucide-react";
import { formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import { INVOICE_STATUS_COLORS } from "@/lib/constants";
import { InvoiceStatus } from "@prisma/client";

export const metadata = { title: "Invoices" };

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const invoices = await prisma.invoice.findMany({
    where: { organizationId: user.organization.id },
    include: {
      client: { select: { companyName: true } },
      contract: { select: { title: true, contractNumber: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.total), 0);
  const totalPaid = invoices.filter((i) => i.status === "PAID").reduce((sum, i) => sum + Number(i.total), 0);
  const totalOutstanding = invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + Number(i.total), 0);
  const totalOverdue = invoices.filter((i) => i.status === "OVERDUE").reduce((sum, i) => sum + Number(i.total), 0);

  const counts = {
    ALL: invoices.length,
    DRAFT: invoices.filter((i) => i.status === "DRAFT").length,
    SENT: invoices.filter((i) => i.status === "SENT").length,
    PAID: invoices.filter((i) => i.status === "PAID").length,
    OVERDUE: invoices.filter((i) => i.status === "OVERDUE").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Track and manage client invoices"
        actions={
          <Link href="/invoices/new">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              New Invoice
            </Button>
          </Link>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</div>
            <div className="text-sm text-muted-foreground">Total Invoiced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</div>
            <div className="text-sm text-muted-foreground">Paid</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalOutstanding)}</div>
            <div className="text-sm text-muted-foreground">Outstanding</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalOverdue)}</div>
            <div className="text-sm text-muted-foreground flex items-center gap-1">
              {totalOverdue > 0 && <AlertCircleIcon className="w-3 h-3 text-red-500" />}
              Overdue
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ALL">
        <TabsList>
          <TabsTrigger value="ALL">All ({counts.ALL})</TabsTrigger>
          <TabsTrigger value="DRAFT">Draft ({counts.DRAFT})</TabsTrigger>
          <TabsTrigger value="SENT">Sent ({counts.SENT})</TabsTrigger>
          <TabsTrigger value="PAID">Paid ({counts.PAID})</TabsTrigger>
          <TabsTrigger value="OVERDUE" className="text-red-500">
            Overdue ({counts.OVERDUE})
          </TabsTrigger>
        </TabsList>

        {["ALL", "DRAFT", "SENT", "PAID", "OVERDUE"].map((status) => {
          const filtered = status === "ALL" ? invoices : invoices.filter((i) => i.status === status);
          return (
            <TabsContent key={status} value={status}>
              <Card>
                <CardContent className="p-0">
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p>No {status === "ALL" ? "" : status.toLowerCase()} invoices.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Contract</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filtered.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell>
                              <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(invoice.issueDate)}
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{invoice.client.companyName}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {invoice.contract?.contractNumber || "—"}
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(Number(invoice.total))}</TableCell>
                            <TableCell>
                              <span
                                className={`text-sm ${
                                  invoice.status !== "PAID" && isOverdue(invoice.dueDate)
                                    ? "text-red-500 font-medium"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatDate(invoice.dueDate)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${INVOICE_STATUS_COLORS[invoice.status] || ""}`}
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Link href={`/invoices/${invoice.id}`}>
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
