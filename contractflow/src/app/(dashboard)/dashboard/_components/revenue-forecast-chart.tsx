"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ForecastDataPoint } from "@/app/actions/dashboard";

interface RevenueForecastChartProps {
  data: ForecastDataPoint[];
}

function formatTick(value: number): string {
  if (value >= 1000) return `£${(value / 1000).toFixed(0)}k`;
  return `£${value}`;
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const fmt = (v: number) => new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(v);
  return (
    <div className="rounded-lg border border-border bg-background p-3 shadow-lg text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">
          {p.name === "projected" ? "Projected" : "Pipeline"}:{" "}
          <span className="font-semibold">{fmt(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function RevenueForecastChart({ data }: RevenueForecastChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatTick}
          tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
          axisLine={false}
          tickLine={false}
          width={42}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
          formatter={(value) => (value === "projected" ? "Projected Revenue" : "Pipeline")}
        />
        <Line
          type="monotone"
          dataKey="projected"
          stroke="var(--color-primary)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--color-primary)" }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="pending"
          stroke="var(--color-chart-2)"
          strokeWidth={2}
          strokeDasharray="4 4"
          dot={{ r: 3, fill: "var(--color-chart-2)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
