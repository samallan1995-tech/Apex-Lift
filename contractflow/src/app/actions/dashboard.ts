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
  const months: RevenueDataPoint[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = subMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const result = await prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: start, lte: end },
      },
      _sum: { total: true },
      _count: { id: true },
    });

    months.push({
      month: format(date, "MMM yyyy"),
      revenue: Number(result._sum.total ?? 0),
      invoiceCount: result._count.id,
    });
  }

  return months;
}

export async function getRevenueForecast(orgId: string): Promise<ForecastDataPoint[]> {
  const { organization } = await getAuthContext();

  if (organization.id !== orgId) throw new Error("Forbidden");

  const now = new Date();
  const forecast: ForecastDataPoint[] = [];

  for (let i = 1; i <= 3; i++) {
    const date = addMonths(now, i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    // Pending milestones due in this month
    const pendingMilestones = await prisma.contractMilestone.aggregate({
      where: {
        contract: { organizationId: orgId },
        status: { in: [MilestoneStatus.PENDING, MilestoneStatus.INVOICED] },
        dueDate: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    // Sent/outstanding invoices due in this month
    const pendingInvoices = await prisma.invoice.aggregate({
      where: {
        organizationId: orgId,
        status: { in: [InvoiceStatus.SENT, InvoiceStatus.OVERDUE, InvoiceStatus.DRAFT] },
        dueDate: { gte: start, lte: end },
      },
      _sum: { total: true },
    });

    const milestoneAmount = Number(pendingMilestones._sum.amount ?? 0);
    const invoiceAmount = Number(pendingInvoices._sum.total ?? 0);

    // Use the max to avoid double-counting milestones that already have invoices
    const projected = Math.max(milestoneAmount, invoiceAmount);

    forecast.push({
      month: format(date, "MMM yyyy"),
      projected,
      pending: milestoneAmount + invoiceAmount,
    });
  }

  return forecast;
}
