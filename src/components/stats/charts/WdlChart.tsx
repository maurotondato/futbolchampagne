"use client";

import { motion } from "framer-motion";

interface Row {
  name: string;
  Victorias: number;
  Empates: number;
  Derrotas: number;
}

const GOOD = "#0ca30c";
const WARNING = "#fab219";
const CRITICAL = "#d03b3b";

// Hand-rolled instead of an SVG/recharts bar chart on purpose — see
// GoalsBarChart.tsx for why.
export function WdlChart({ data }: { data: Row[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-hud text-sm text-ink-faint">
        Sin datos todavía.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.Victorias + d.Empates + d.Derrotas), 1);

  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-4 font-hud text-xs text-ink-dim">
        <LegendDot color={GOOD} label="Victorias" />
        <LegendDot color={WARNING} label="Empates" />
        <LegendDot color={CRITICAL} label="Derrotas" />
      </div>
      <div className="space-y-3">
        {data.map((row, i) => {
          const total = row.Victorias + row.Empates + row.Derrotas;
          return (
            <div key={row.name} className="flex items-center gap-3">
              <span
                className="w-20 shrink-0 truncate text-right font-hud text-xs text-ink-dim sm:w-24"
                title={row.name}
              >
                {row.name}
              </span>
              <div className="flex h-6 flex-1 overflow-hidden rounded-md bg-white/5">
                <Segment value={row.Victorias} max={max} color={GOOD} delay={i * 0.05} />
                <Segment value={row.Empates} max={max} color={WARNING} delay={i * 0.05 + 0.05} dark />
                <Segment value={row.Derrotas} max={max} color={CRITICAL} delay={i * 0.05 + 0.1} />
              </div>
              <span className="w-6 shrink-0 text-right font-hud text-xs text-ink-faint">{total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Segment({
  value,
  max,
  color,
  delay,
  dark,
}: {
  value: number;
  max: number;
  color: string;
  delay: number;
  dark?: boolean;
}) {
  if (value <= 0) return null;
  return (
    <motion.div
      className={`flex h-full items-center justify-center font-hud text-[10px] font-bold ${dark ? "text-black/80" : "text-white/90"}`}
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${(value / max) * 100}%` }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
    >
      {value}
    </motion.div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
