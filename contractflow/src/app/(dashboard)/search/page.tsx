import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { FileTextIcon, UsersIcon, ReceiptIcon, SearchIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CONTRACT_STATUS_COLORS, INVOICE_STATUS_COLORS } from "@/lib/constants";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { organizationId: true },
  });

  if (!user?.organizationId) redirect("/onboarding");

  const orgId = user.organizationId;

  if (!query || query.length < 2) {
    return (
      <div className="space-y-6">
        <PageHeader title="Search" description="Search across all your data" />
        <Card>
          <CardContent className="py-16 text-center">
            <SearchIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Enter a search term to find clients, contracts, and invoices</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [clients, contracts, invoices] = await Promise.all([
    prisma.client.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { companyName: { contains: query, mode: "insensitive" } },
          { contactName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.contract.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { contractNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { client: { select: { companyName: true } } },
      take: 10,
    }),
    prisma.invoice.findMany({
      where: {
        organizationId: orgId,
        OR: [
          { invoiceNumber: { contains: query, mode: "insensitive" } },
          { client: { companyName: { contains: query, mode: "insensitive" } } },
        ],
      },
      include: { client: { select: { companyName: true } } },
      take: 10,
    }),
  ]);

  const totalResults = clients.length + contracts.length + invoices.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Search: "${query}"`}
        description={`${totalResults} result${totalResults !== 1 ? "s" : ""} found`}
      />

      {totalResults === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <SearchIcon className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No results found for &ldquo;{query}&rdquo;</p>
          </CardContent>
        </Card>
      )}

      {clients.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <UsersIcon className="w-4 h-4" /> Clients ({clients.length})
          </h2>
          <div className="space-y-2">
            {clients.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.companyName}</p>
                      <p className="text-xs text-muted-foreground">{c.contactName} · {c.email}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">Client</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {contracts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <FileTextIcon className="w-4 h-4" /> Contracts ({contracts.length})
          </h2>
          <div className="space-y-2">
            {contracts.map((c) => (
              <Link key={c.id} href={`/contracts/${c.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.contractNumber} · {c.client.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(Number(c.value), c.currency)}</span>
                      <Badge className={`text-xs ${CONTRACT_STATUS_COLORS[c.status as keyof typeof CONTRACT_STATUS_COLORS] ?? ""}`}>
                        {c.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {invoices.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <ReceiptIcon className="w-4 h-4" /> Invoices ({invoices.length})
          </h2>
          <div className="space-y-2">
            {invoices.map((i) => (
              <Link key={i.id} href={`/invoices/${i.id}`}>
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                  <CardContent className="py-3 px-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{i.invoiceNumber}</p>
                      <p className="text-xs text-muted-foreground">{i.client.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(Number(i.total), i.currency)}</span>
                      <Badge className={`text-xs ${INVOICE_STATUS_COLORS[i.status as keyof typeof INVOICE_STATUS_COLORS] ?? ""}`}>
                        {i.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
