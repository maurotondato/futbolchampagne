"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface Row {
  name: string;
  value: number;
}

const SERIES_BLUE = "#3987e5";
// Recharts measures tick/label text via an off-DOM canvas 2D context to
// decide layout and whether a label fits — canvas's `context.font` setter
// can't resolve CSS custom properties (var(--font-hud)), and browsers
// disagree on what happens when it's given one: some silently keep the
// previous font (harmless), others end up with a broken measurement that
// makes recharts hide the label entirely. A literal font stack sidesteps
// the whole class of bug.
const CHART_FONT = "Rajdhani, ui-sans-serif, system-ui, sans-serif";

export function GoalsBarChart({ data, label }: { data: Row[]; label: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-hud text-sm text-ink-faint">
        Sin datos todavía.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 28, top: 4, bottom: 4 }}>
        <CartesianGrid horizontal={false} stroke="#2c2c2a" strokeDasharray="3 3" />
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "#c3c2b7", fontFamily: CHART_FONT, fontSize: 12 }}
          axisLine={{ stroke: "#383835" }}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          contentStyle={{
            background: "#0d1220",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10,
            fontFamily: CHART_FONT,
            fontSize: 12,
            color: "#eef1f8",
          }}
          formatter={(value) => [`${value} ${label.toLowerCase()}`, ""]}
          labelStyle={{ color: "#93a0bd" }}
        />
        <Bar dataKey="value" fill={SERIES_BLUE} radius={[0, 4, 4, 0]} maxBarSize={22}>
          <LabelList
            dataKey="value"
            position="right"
            fill="#eef1f8"
            fontFamily={CHART_FONT}
            fontSize={12}
            fontWeight={700}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
