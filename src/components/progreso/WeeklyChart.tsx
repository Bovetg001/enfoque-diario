"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface DayData {
  label: string;
  minutos: number;
  bloques: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "0.75rem",
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--foreground)", fontWeight: 600 }}
          formatter={(value, name) => [
            `${value ?? 0} ${name === "minutos" ? "min" : "bloques"}`,
            name === "minutos" ? "Minutos" : "Bloques",
          ]}
        />
        <Bar dataKey="minutos" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
