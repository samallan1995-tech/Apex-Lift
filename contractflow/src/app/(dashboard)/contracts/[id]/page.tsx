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
  EditIcon, SendIcon, DownloadIcon, CopyIcon, CheckCircleIcon,
  ClockIcon, DollarSignIcon, CalendarIcon, FileTextIcon,
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { CONTRACT_STATUS_COLORS, MILESTONE_STATUS_COLORS, INVOICE_STATUS_COLORS } from "@/lib/constants";
import { ContractActions } from "@/components/contracts/contract-actions";

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const contract = await prisma.contract.findFirst({
    where: { id, organizationId: user.organization.id },
    include: {
      client: true,
      milestones: { orderBy: { order: "asc" } },
      invoices: {
        include: { payments: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!contract) notFound();

  const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${contract.id}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={contract.title}
        description={`${contract.contractNumber} · ${contract.client.companyName}`}
        actions={
          <ContractActions
            contract={{
              id: contract.id,
              status: contract.status,
              signingUrl,
              pdfUrl: contract.pdfUrl,
            }}
          />
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="secondary"
                  className={`text-xs ${CONTRACT_STATUS_COLORS[contract.status] || ""}`}
                >
                  {contract.status}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Value</span>
                <span className="font-semibold">{formatCurrency(Number(contract.value))}</span>
              </div>
              {contract.startDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Start Date</span>
                  <span>{formatDate(contract.startDate)}</span>
                </div>
              )}
              {contract.endDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">End Date</span>
                  <span>{formatDate(contract.endDate)}</span>
                </div>
              )}
              {contract.signedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Signed</span>
                  <span className="text-green-600">{formatDate(contract.signedAt)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(contract.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="font-medium text-sm">{contract.client.companyName}</div>
              <div className="text-sm text-muted-foreground">{contract.client.contactName}</div>
              <div className="text-sm text-muted-foreground">{contract.client.email}</div>
              <Link href={`/clients/${contract.client.id}`}>
                <Button variant="link" size="sm" className="px-0 h-auto">View client →</Button>
              </Link>
            </CardContent>
          </Card>

          {contract.status === "SENT" || contract.status === "VIEWED" ? (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="pt-4 space-y-2">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Signing Link</p>
                <p className="text-xs text-muted-foreground break-all">{signingUrl}</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={undefined}
                  asChild
                >
                  <a href={signingUrl} target="_blank" rel="noopener noreferrer">
                    Preview signing page
                  </a>
                </Button>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Right: Milestones & Invoices */}
        <div className="lg:col-span-2 space-y-6">
          {/* Milestones */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Milestones ({contract.milestones.length})
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(contract.milestones.reduce((s, m) => s + Number(m.amount), 0))} total
              </div>
            </CardHeader>
            <CardContent>
              {contract.milestones.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No milestones set</p>
              ) : (
                <div className="space-y-2">
                  {contract.milestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            milestone.status === "PAID"
                              ? "bg-green-500"
                              : milestone.status === "INVOICED"
                              ? "bg-purple-500"
                              : milestone.status === "COMPLETED"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          }`}
                        />
                        <div>
                          <div className="text-sm font-medium">{milestone.title}</div>
                          {milestone.dueDate && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {formatDate(milestone.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatCurrency(Number(milestone.amount))}</span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${MILESTONE_STATUS_COLORS[milestone.status] || ""}`}
                        >
                          {milestone.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">
                Invoices ({contract.invoices.length})
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {formatCurrency(
                  contract.invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.total), 0)
                )} paid
              </div>
            </CardHeader>
            <CardContent>
              {contract.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No invoices yet. Invoices are automatically created when milestones are completed.
                </p>
              ) : (
                <div className="space-y-2">
                  {contract.invoices.map((invoice) => (
                    <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                        <div>
                          <div className="text-sm font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            Due {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{formatCurrency(Number(invoice.total))}</span>
                          <Badge
                            variant="secondary"
                            className={`text-xs ${INVOICE_STATUS_COLORS[invoice.status] || ""}`}
                          >
                            {invoice.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contract Content Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Contract Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-sm max-h-64 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: contract.content }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
