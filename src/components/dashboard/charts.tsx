"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function AreaChartMini({
  data,
  dataKey = "value",
  xKey = "label",
  color = "var(--color-2)",
}: {
  data: Record<string, any>[];
  dataKey?: string;
  xKey?: string;
  color?: string;
}) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="rgba(127,127,127,0.5)" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="rgba(127,127,127,0.5)" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
          <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill="url(#area-grad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartMini({
  data,
  dataKey = "value",
  xKey = "label",
  color = "var(--color-1)",
}: {
  data: Record<string, any>[];
  dataKey?: string;
  xKey?: string;
  color?: string;
}) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(127,127,127,0.15)" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 11 }} stroke="rgba(127,127,127,0.5)" tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11 }} stroke="rgba(127,127,127,0.5)" tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)" }} />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
