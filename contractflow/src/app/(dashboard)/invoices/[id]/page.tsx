import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InvoiceDetailActions } from "@/components/invoices/invoice-detail-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import { INVOICE_STATUS_COLORS } from "@/lib/constants";
import { FileTextIcon, CalendarIcon, UserIcon, BuildingIcon } from "lucide-react";

export const metadata = { title: "Invoice" };

export default async function InvoiceDetailPage({
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

  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: user.organization.id },
    include: {
      client: true,
      contract: true,
      milestone: true,
      payments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!invoice) notFound();

  const lineItems = Array.isArray(invoice.lineItems)
    ? invoice.lineItems
    : JSON.parse(String(invoice.lineItems) || "[]");

  const isOverdue =
    invoice.status !== "PAID" &&
    invoice.dueDate < new Date();

  const statusColor = INVOICE_STATUS_COLORS[invoice.status as keyof typeof INVOICE_STATUS_COLORS];

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description={invoice.client.companyName}
        actions={
          <InvoiceDetailActions
            invoice={{
              id: invoice.id,
              status: invoice.status,
              invoiceNumber: invoice.invoiceNumber,
              stripePaymentUrl: invoice.stripePaymentUrl ?? undefined,
            }}
          />
        }
      />

      {isOverdue && invoice.status !== "PAID" && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
          This invoice is overdue. Due date was {formatDate(invoice.dueDate)}.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoice body */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">{invoice.invoiceNumber}</CardTitle>
                </div>
                <Badge className={statusColor}>{invoice.status}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Bill to / from */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Bill To</p>
                  <div className="flex items-start gap-2">
                    <UserIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{invoice.client.companyName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.client.contactName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.client.email}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">From</p>
                  <div className="flex items-start gap-2">
                    <BuildingIcon className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">{user.organization.companyName}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Issue Date</p>
                    <p>{formatDate(invoice.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className={isOverdue && invoice.status !== "PAID" ? "text-red-600 font-medium" : ""}>
                      {formatDate(invoice.dueDate)}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Line items */}
              <div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 text-xs text-muted-foreground font-medium">Description</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium w-16">Qty</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Unit Price</th>
                      <th className="text-right py-2 text-xs text-muted-foreground font-medium w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item: { description: string; quantity: number; unitPrice: number; amount: number }, idx: number) => (
                      <tr key={idx} className="border-b border-dashed">
                        <td className="py-3">{item.description}</td>
                        <td className="py-3 text-right text-muted-foreground">{item.quantity}</td>
                        <td className="py-3 text-right text-muted-foreground">
                          {formatCurrency(item.unitPrice, invoice.currency)}
                        </td>
                        <td className="py-3 text-right font-medium">
                          {formatCurrency(item.amount, invoice.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(Number(invoice.amount), invoice.currency)}</span>
                  </div>
                  {Number(invoice.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax ({Number(invoice.tax)}%)</span>
                      <span>
                        {formatCurrency(
                          Number(invoice.total) - Number(invoice.amount),
                          invoice.currency
                        )}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span className="text-indigo-600">
                      {formatCurrency(Number(invoice.total), invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Payments */}
          {invoice.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{formatCurrency(Number(payment.amount), payment.currency)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.paymentDate ? formatDate(payment.paymentDate) : formatDate(payment.createdAt)}
                          {payment.stripePaymentIntentId && ` · via Stripe`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {payment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contract link */}
          {invoice.contract && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Related Contract</p>
                <a
                  href={`/contracts/${invoice.contract.id}`}
                  className="text-sm font-medium text-indigo-600 hover:underline"
                >
                  {invoice.contract.title}
                </a>
                <p className="text-xs text-muted-foreground mt-0.5">{invoice.contract.contractNumber}</p>
              </CardContent>
            </Card>
          )}

          {/* Milestone */}
          {invoice.milestone && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">Milestone</p>
                <p className="text-sm font-medium">{invoice.milestone.title}</p>
              </CardContent>
            </Card>
          )}

          {/* Status summary */}
          <Card>
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={statusColor}>{invoice.status}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount Due</span>
                <span className="font-bold text-indigo-600">
                  {invoice.status === "PAID"
                    ? formatCurrency(0, invoice.currency)
                    : formatCurrency(Number(invoice.total), invoice.currency)}
                </span>
              </div>
              {invoice.paidAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid On</span>
                  <span>{formatDate(invoice.paidAt)}</span>
                </div>
              )}
              {invoice.sentAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sent On</span>
                  <span>{formatDate(invoice.sentAt)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
