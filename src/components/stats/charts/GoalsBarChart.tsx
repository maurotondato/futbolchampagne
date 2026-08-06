"use client";

import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

interface Row {
  name: string;
  value: number;
}

// Hand-rolled instead of an SVG/recharts bar chart on purpose — recharts'
// text layout (axis ticks, bar labels) went blank on iOS Safari in
// practice and wasn't worth chasing further; plain HTML/CSS bars can't
// have that class of rendering bug.
export function GoalsBarChart({ data, label }: { data: Row[]; label: string }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center font-hud text-sm text-ink-faint">
        Sin datos todavía.
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-3" aria-label={label} role="img">
      {data.map((row, i) => (
        <div key={row.name} className="flex items-center gap-3">
          <span
            className="w-20 shrink-0 truncate text-right font-hud text-xs text-ink-dim sm:w-28"
            title={row.name}
          >
            {row.name}
          </span>
          <div className="relative h-6 flex-1 overflow-hidden rounded-md bg-white/5">
            <motion.div
              className="h-full rounded-md bg-gradient-to-r from-[#1a5fb4] to-[#3987e5]"
              initial={{ width: 0 }}
              animate={{ width: `${(row.value / max) * 100}%` }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: "easeOut" }}
            />
          </div>
          <span className="w-10 shrink-0 text-right font-hud text-sm font-bold text-ink">
            <AnimatedNumber value={row.value} decimals={Number.isInteger(row.value) ? 0 : 2} duration={0.8} />
          </span>
        </div>
      ))}
    </div>
  );
}
