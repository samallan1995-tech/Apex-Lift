import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  MailIcon, PhoneIcon, MapPinIcon, EditIcon, FileTextIcon,
  ReceiptIcon, CalendarIcon, ExternalLinkIcon,
} from "lucide-react";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils";
import { CONTRACT_STATUS_COLORS, INVOICE_STATUS_COLORS } from "@/lib/constants";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const client = await prisma.client.findFirst({
    where: { id, organizationId: user.organization.id },
    include: {
      contracts: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!client) notFound();

  const totalRevenue = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + Number(i.total), 0);

  const outstandingBalance = client.invoices
    .filter((i) => ["SENT", "OVERDUE"].includes(i.status))
    .reduce((sum, i) => sum + Number(i.total), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={client.companyName}
        description={client.contactName}
        actions={
          <Link href={`/clients/${client.id}/edit`}>
            <Button variant="outline" size="sm">
              <EditIcon className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MailIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline truncate">
                  {client.email}
                </a>
              </div>
              {client.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <PhoneIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{client.address}</span>
                </div>
              )}
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarIcon className="w-3.5 h-3.5" />
                Client since {formatDate(client.createdAt)}
              </div>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="pt-4">
                <div className="text-xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div>
                <div className="text-xs text-muted-foreground">Revenue paid</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-xl font-bold text-orange-500">{formatCurrency(outstandingBalance)}</div>
                <div className="text-xs text-muted-foreground">Outstanding</div>
              </CardContent>
            </Card>
          </div>

          {client.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contracts & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contracts */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Contracts ({client.contracts.length})</CardTitle>
              <Link href={`/contracts/new?clientId=${client.id}`}>
                <Button size="sm" variant="outline">
                  <FileTextIcon className="w-3.5 h-3.5 mr-1.5" />
                  New Contract
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {client.contracts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No contracts yet</p>
              ) : (
                <div className="space-y-2">
                  {client.contracts.map((contract) => (
                    <Link key={contract.id} href={`/contracts/${contract.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{contract.title}</div>
                          <div className="text-xs text-muted-foreground">{contract.contractNumber}</div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-medium">{formatCurrency(Number(contract.value))}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${CONTRACT_STATUS_COLORS[contract.status] || ""}`}
                          >
                            {contract.status}
                          </Badge>
                          <ExternalLinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Invoices ({client.invoices.length})</CardTitle>
              <Link href={`/invoices/new?clientId=${client.id}`}>
                <Button size="sm" variant="outline">
                  <ReceiptIcon className="w-3.5 h-3.5 mr-1.5" />
                  New Invoice
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {client.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No invoices yet</p>
              ) : (
                <div className="space-y-2">
                  {client.invoices.map((invoice) => (
                    <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            Due {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-sm font-medium">{formatCurrency(Number(invoice.total))}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${INVOICE_STATUS_COLORS[invoice.status] || ""}`}
                          >
                            {invoice.status}
                          </Badge>
                          <ExternalLinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
