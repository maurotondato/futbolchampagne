"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Row {
  name: string;
  Victorias: number;
  Empates: number;
  Derrotas: number;
}

const GOOD = "#0ca30c";
const WARNING = "#fab219";
const CRITICAL = "#d03b3b";

export function WdlChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-hud text-sm text-ink-faint">
        Sin datos todavía.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: -20, right: 8, top: 8, bottom: 4 }}>
        <CartesianGrid vertical={false} stroke="#2c2c2a" strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fill: "#c3c2b7", fontFamily: "var(--font-hud)", fontSize: 11 }}
          axisLine={{ stroke: "#383835" }}
          tickLine={false}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={54}
        />
        <YAxis
          tick={{ fill: "#898781", fontFamily: "var(--font-hud)", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#0d1220",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontFamily: "var(--font-hud)",
            fontSize: 12,
            color: "#eef1f8",
          }}
        />
        <Legend
          wrapperStyle={{ fontFamily: "var(--font-hud)", fontSize: 12, color: "#c3c2b7" }}
        />
        <Bar dataKey="Victorias" stackId="r" fill={GOOD} radius={[0, 0, 0, 0]} maxBarSize={28} />
        <Bar dataKey="Empates" stackId="r" fill={WARNING} maxBarSize={28} />
        <Bar dataKey="Derrotas" stackId="r" fill={CRITICAL} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
