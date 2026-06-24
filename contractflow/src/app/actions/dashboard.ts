"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { ContractStatus, InvoiceStatus, MilestoneStatus } from "@prisma/client";
import { startOfMonth, endOfMonth, subMonths, addMonths, format } from "date-fns";

async function getAuthContext() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { organization: true },
  });

  if (!user?.organization) throw new Error("Organization not found");

  return { user, organization: user.organization };
}

export interface DashboardStats {
  totalRevenue: number;
  monthlyRevenue: number;
  outstandingInvoices: number;
  outstandingAmount: number;
  activeContracts: number;
  signedContracts: number;
  totalClients: number;
  upcomingMilestones: UpcomingMilestone[];
  recentActivity: RecentActivity[];
}

export interface UpcomingMilestone {
  id: string;
  title: string;
  amount: number;
  dueDate: Date | null;
  contractTitle: string;
  clientName: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  message: string;
  createdAt: Date;
  entityId: string | null;
  entityType: string | null;
}

export interface RevenueDataPoint {
  month: string;
  revenue: number;
  invoiceCount: number;
}

export interface ForecastDataPoint {
  month: string;
  projected: number;
  pending: number;
}

export async function getDashboardStats(orgId: string): Promise<DashboardStats> {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const thirtyDaysOut = new Date(now);
  thirtyDaysOut.setDate(thirtyDaysOut.getDate() + 30);

  const [
    totalRevenueResult,
    monthlyRevenueResult,
    outstandingInvoices,
    activeContracts,
    signedContracts,
    totalClients,
    upcomingMilestones,
    recentActivity,
  ] = await Promise.all([
    // Total revenue: sum of all paid invoice totals
    prisma.invoice.aggregate({
      where: { organizationId: orgId, status: InvoiceStatus.PAID },
      _sum: { total: true },
    }),

    // Monthly revenue: paid invoices this month
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: monthStart, lte: monthEnd },
      },
      _sum: { total: true },
    }),

    // Outstanding invoices count + amount
    prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE] },
      },
      _sum: { total: true },
      _count: { id: true },
    }),

    // Active contracts (SENT or VIEWED)
    prisma.contract.count({
      where: {
        organizationId: orgId,
        status: { in: [ContractStatus.SENT, ContractStatus.VIEWED] },
      },
    }),

    // Signed contracts
    prisma.contract.count({
      where: { organizationId: orgId, status: ContractStatus.SIGNED },
    }),

    // Total clients
    prisma.client.count({ where: { organizationId: orgId } }),

    // Upcoming milestones (next 30 days, still pending)
    prisma.contractMilestone.findMany({
      where: {
        contract: { organizationId: orgId },
        status: MilestoneStatus.PENDING,
        dueDate: { gte: now, lte: thirtyDaysOut },
      },
      include: {
        contract: {
          select: {
            title: true,
            client: { select: { companyName: true } },
          },
        },
      },
      orderBy: { dueDate: "asc" },
      take: 10,
    }),

    // Recent activity
    prisma.activity.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    totalRevenue: Number(totalRevenueResult._sum.total ?? 0),
    monthlyRevenue: Number(monthlyRevenueResult._sum.total ?? 0),
    outstandingInvoices: outstandingInvoices._count.id,
    outstandingAmount: Number(outstandingInvoices._sum.total ?? 0),
    activeContracts,
    signedContracts,
    totalClients,
    upcomingMilestones: upcomingMilestones.map((m) => ({
      id: m.id,
      title: m.title,
      amount: Number(m.amount),
      dueDate: m.dueDate,
      contractTitle: m.contract.title,
      clientName: m.contract.client.companyName,
    })),
    recentActivity: recentActivity.map((a) => ({
      id: a.id,
      type: a.type,
      message: a.message,
      createdAt: a.createdAt,
      entityId: a.entityId,
      entityType: a.entityType,
    })),
  };
}

export async function getRevenueChart(orgId: string): Promise<RevenueDataPoint[]> {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const now = new Date();
  const windowStart = startOfMonth(subMonths(now, 11));

  // Single query for all 12 months — fetch all paid invoices in range, group in JS
  const paidInvoices = await prisma.invoice.findMany({
    where: {
      organizationId: orgId,
      status: InvoiceStatus.PAID,
      paidAt: { gte: windowStart, lte: endOfMonth(now) },
    },
    select: { total: true, paidAt: true },
  });

  // Build a map keyed by "MMM yyyy"
  const byMonth = new Map<string, { revenue: number; invoiceCount: number }>();
  for (let i = 11; i >= 0; i--) {
    const label = format(subMonths(now, i), "MMM yyyy");
    byMonth.set(label, { revenue: 0, invoiceCount: 0 });
  }
  for (const inv of paidInvoices) {
    if (!inv.paidAt) continue;
    const label = format(inv.paidAt, "MMM yyyy");
    const entry = byMonth.get(label);
    if (entry) {
      entry.revenue += Number(inv.total);
      entry.invoiceCount += 1;
    }
  }

  return Array.from(byMonth.entries()).map(([month, data]) => ({ month, ...data }));
}

export async function getRevenueForecast(orgId: string): Promise<ForecastDataPoint[]> {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const now = new Date();

  // Fetch all 3 forecast months in parallel
  const forecastMonths = [1, 2, 3].map((i) => {
    const date = addMonths(now, i);
    return { month: format(date, "MMM yyyy"), start: startOfMonth(date), end: endOfMonth(date) };
  });

  const results = await Promise.all(
    forecastMonths.map(({ start, end }) =>
      Promise.all([
        prisma.contractMilestone.aggregate({
          where: {
            contract: { organizationId: orgId },
            status: { in: [MilestoneStatus.PENDING, MilestoneStatus.INVOICED] },
            dueDate: { gte: start, lte: end },
          },
          _sum: { amount: true },
        }),
        prisma.invoice.aggregate({
          where: {
            organizationId: orgId,
            status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE, InvoiceStatus.DRAFT] },
            dueDate: { gte: start, lte: end },
          },
          _sum: { total: true },
        }),
      ])
    )
  );

  return forecastMonths.map(({ month }, i) => {
    const [milestoneAgg, invoiceAgg] = results[i];
    const milestoneAmount = Number(milestoneAgg._sum.amount ?? 0);
    const invoiceAmount = Number(invoiceAgg._sum.total ?? 0);
    return {
      month,
      projected: Math.max(milestoneAmount, invoiceAmount),
      pending: milestoneAmount + invoiceAmount,
    };
  });
}
