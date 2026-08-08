import React, { Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp,
  FileText,
  Users,
  Receipt,
  Plus,
  ArrowUpRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  DollarSign,
  Activity,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDashboardStats, getRevenueChart, getRevenueForecast } from "@/app/actions/dashboard";
import { requireOrg } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RevenueBarChart } from "./_components/revenue-bar-chart";
import { RevenueForecastChart } from "./_components/revenue-forecast-chart";

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-4 bg-muted rounded w-32" />
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-muted rounded w-24 mb-2" />
        <div className="h-3 bg-muted rounded w-20" />
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 bg-muted rounded w-40 mb-1" />
        <div className="h-3 bg-muted rounded w-56" />
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted rounded" />
      </CardContent>
    </Card>
  );
}

function ListSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-5 bg-muted rounded w-48 mb-1" />
        <div className="h-3 bg-muted rounded w-64" />
      </CardHeader>
      <CardContent className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-muted rounded-lg" />
        ))}
      </CardContent>
    </Card>
  );
}

// ─── Stat card ─────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-indigo-600 dark:text-indigo-400",
  iconBg = "bg-indigo-50 dark:bg-indigo-950",
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Activity icon map ────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  CONTRACT_CREATED: { icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  CONTRACT_SENT: { icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  CONTRACT_SIGNED: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950" },
  CONTRACT_UPDATED: { icon: FileText, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900" },
  INVOICE_CREATED: { icon: Receipt, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  INVOICE_SENT: { icon: Receipt, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  INVOICE_PAID: { icon: DollarSign, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-950" },
  INVOICE_OVERDUE: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950" },
  CLIENT_ADDED: { icon: Users, color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-950" },
  CLIENT_UPDATED: { icon: Users, color: "text-slate-600", bg: "bg-slate-50 dark:bg-slate-900" },
  MILESTONE_COMPLETED: { icon: Activity, color: "text-teal-600", bg: "bg-teal-50 dark:bg-teal-950" },
};

function relativeTime(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await requireOrg();
  const orgId = user.organization!.id;

  const [stats, revenueData, forecastData] = await Promise.all([
    getDashboardStats(orgId),
    getRevenueChart(orgId),
    getRevenueForecast(orgId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening with your business."
        actions={
          <div className="flex items-center gap-2">
            <Link href="/contracts/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                New Contract
              </Button>
            </Link>
            <Link href="/clients">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Users className="w-4 h-4" />
                New Client
              </Button>
            </Link>
            <Link href="/invoices">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Receipt className="w-4 h-4" />
                New Invoice
              </Button>
            </Link>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Monthly Revenue"
          value={formatCurrency(stats.monthlyRevenue)}
          subtitle={`${formatCurrency(stats.totalRevenue)} total lifetime`}
          icon={TrendingUp}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950"
        />
        <StatCard
          title="Outstanding Invoices"
          value={formatCurrency(stats.outstandingAmount)}
          subtitle={`${stats.outstandingInvoices} invoice${stats.outstandingInvoices !== 1 ? "s" : ""} pending`}
          icon={Receipt}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950"
        />
        <StatCard
          title="Active Contracts"
          value={String(stats.activeContracts)}
          subtitle="Sent or under review"
          icon={FileText}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950"
        />
        <StatCard
          title="Signed Contracts"
          value={String(stats.signedContracts)}
          subtitle={`${stats.totalClients} total clients`}
          icon={CheckCircle2}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Revenue</CardTitle>
            <CardDescription>Revenue collected over the last 12 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
              <RevenueBarChart data={revenueData} />
            </Suspense>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue Forecast</CardTitle>
            <CardDescription>Projected revenue for the next 3 months</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Suspense fallback={<div className="h-64 bg-muted rounded animate-pulse" />}>
              <RevenueForecastChart data={forecastData} />
            </Suspense>
          </CardContent>
        </Card>
      </div>

      {/* Milestones + Activity */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Upcoming Milestones */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Upcoming Milestones</CardTitle>
              <CardDescription>Milestones due in the next 30 days</CardDescription>
            </div>
            <Link href="/contracts">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View all <ArrowUpRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {stats.upcomingMilestones.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No upcoming milestones</p>
            ) : (
              <ul className="space-y-3">
                {stats.upcomingMilestones.map((m) => {
                  const isOverdue = m.dueDate ? new Date(m.dueDate) < new Date() : false;
                  const isDueSoon = m.dueDate
                    ? !isOverdue && (new Date(m.dueDate).getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000
                    : false;

                  return (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                            isOverdue
                              ? "bg-red-100 dark:bg-red-950"
                              : isDueSoon
                              ? "bg-amber-100 dark:bg-amber-950"
                              : "bg-blue-100 dark:bg-blue-950"
                          }`}
                        >
                          {isOverdue ? (
                            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                          ) : (
                            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{m.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {m.contractTitle} · {m.clientName}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-foreground">{formatCurrency(m.amount)}</p>
                        <Badge
                          variant={isOverdue ? "destructive" : isDueSoon ? "warning" : "secondary"}
                          className="mt-0.5 text-xs"
                        >
                          {isOverdue
                            ? "Overdue"
                            : isDueSoon
                            ? "Due soon"
                            : m.dueDate
                            ? formatDate(m.dueDate)
                            : "No date"}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest events across your workspace</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              <ul className="space-y-4">
                {stats.recentActivity.map((item) => {
                  const mapping = ACTIVITY_ICONS[item.type] ?? ACTIVITY_ICONS.CONTRACT_UPDATED;
                  const Icon = mapping.icon;

                  return (
                    <li key={item.id} className="flex items-start gap-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5 ${mapping.bg}`}>
                        <Icon className={`w-4 h-4 ${mapping.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{item.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
                        {relativeTime(new Date(item.createdAt))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
