"use client";

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RevenueDataPoint } from "@/app/actions/dashboard";

interface RevenueBarChartProps {
  data: RevenueDataPoint[];
}

function formatTick(value: number): string {
  if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
  return `£${value}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      <p className="text-muted-foreground">
        Revenue:{" "}
        <span className="font-semibold text-foreground">
          {new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(payload[0].value)}
        </span>
      </p>
    </div>
  );
}

export function RevenueBarChart({ data }: RevenueBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          interval={1}
        />
        <YAxis
          tickFormatter={formatTick}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-muted)", opacity: 0.5 }} />
        <Bar
          dataKey="revenue"
          fill="var(--color-primary)"
          radius={[4, 4, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
