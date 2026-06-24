import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, getRevenueChart, getRevenueForecast } from "@/app/actions/dashboard";
import { RevenueBarChart } from "@/app/(dashboard)/dashboard/_components/revenue-bar-chart";
import { RevenueForecastChart } from "@/app/(dashboard)/dashboard/_components/revenue-forecast-chart";
import { formatCurrency } from "@/lib/utils";
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from "lucide-react";

export const metadata = { title: "Revenue" };

export default async function RevenuePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });
  if (!user?.organization) redirect("/onboarding");

  const [stats, revenueChart, forecast] = await Promise.all([
    getDashboardStats(user.organization.id),
    getRevenueChart(user.organization.id),
    getRevenueForecast(user.organization.id),
  ]);

  const mrr = stats.monthlyRevenue;
  const arr = mrr * 12;
  const collectionRate =
    stats.totalInvoiced > 0
      ? Math.round((stats.totalRevenue / stats.totalInvoiced) * 100)
      : 0;

  const topClients = await prisma.invoice.groupBy({
    by: ["clientId"],
    where: { organizationId: user.organization.id, status: "PAID" },
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const topClientDetails = await prisma.client.findMany({
    where: { id: { in: topClients.map((c) => c.clientId) } },
    select: { id: true, companyName: true },
  });

  const topClientsWithRevenue = topClients.map((tc) => ({
    client: topClientDetails.find((c) => c.id === tc.clientId),
    revenue: Number(tc._sum.amount || 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue Analytics" description="Track your income and forecast future earnings" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">MRR</span>
              <TrendingUpIcon className="w-3.5 h-3.5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(mrr)}</div>
            <div className="text-xs text-muted-foreground">Monthly Recurring Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">ARR</span>
              <TrendingUpIcon className="w-3.5 h-3.5 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(arr)}</div>
            <div className="text-xs text-muted-foreground">Annual Recurring Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Total Revenue</span>
              <DollarSignIcon className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-xs text-muted-foreground">All time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Collection Rate</span>
              <TrendingUpIcon className={`w-3.5 h-3.5 ${collectionRate >= 80 ? "text-green-500" : "text-orange-500"}`} />
            </div>
            <div className="text-2xl font-bold">{collectionRate}%</div>
            <div className="text-xs text-muted-foreground">Invoice collection rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Monthly Revenue (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueBarChart data={revenueChart} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Revenue Forecast (Next 3 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueForecastChart data={forecast} />
          </CardContent>
        </Card>
      </div>

      {/* Additional metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top Clients by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topClientsWithRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No revenue data yet</p>
              ) : (
                topClientsWithRevenue.map((item, idx) => (
                  <div key={item.client?.id || idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-semibold text-indigo-600">
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium">{item.client?.companyName || "Unknown"}</span>
                    </div>
                    <span className="text-sm font-semibold">{formatCurrency(item.revenue)}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Invoice Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "Paid Invoices", value: stats.totalRevenue, color: "bg-green-500" },
                { label: "Outstanding", value: stats.outstandingRevenue, color: "bg-blue-500" },
                { label: "Overdue", value: stats.overdueAmount, color: "bg-red-500" },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{formatCurrency(item.value)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{
                        width: stats.totalInvoiced > 0
                          ? `${Math.min((item.value / stats.totalInvoiced) * 100, 100)}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
