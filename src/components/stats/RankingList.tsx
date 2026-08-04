"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/data/types";

const MEDAL = ["🥇", "🥈", "🥉"];

export function RankingList({
  rows,
  valueLabel,
  secondary,
}: {
  rows: { player: Player; value: number; caption?: string }[];
  valueLabel: string;
  secondary?: (row: { player: Player; value: number }) => string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));

  if (rows.length === 0) {
    return (
      <p className="py-16 text-center font-hud text-ink-faint">
        Todavía no hay datos suficientes. ¡Se completa después de cada partido!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row, i) => (
        <motion.div
          key={row.player.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: Math.min(i * 0.04, 0.6) }}
        >
          <Link href={`/jugadores/perfil?id=${row.player.id}`}>
            <div
              className={cn(
                "glass group relative flex items-center gap-3 overflow-hidden rounded-xl border border-line p-3 transition hover:border-gold/50",
                i === 0 && "border-gold/50"
              )}
            >
              <div
                className="absolute bottom-0 left-0 top-0 bg-gradient-to-r from-gold/10 to-transparent"
                style={{ width: `${(row.value / max) * 100}%` }}
              />
              <span className="relative w-8 shrink-0 text-center font-display text-lg text-ink-faint">
                {MEDAL[i] ?? i + 1}
              </span>
              <PlayerAvatar player={row.player} size={40} className="relative" />
              <div className="relative min-w-0 flex-1">
                <p className="truncate font-hud text-sm font-semibold text-ink">
                  {row.player.nickname || row.player.name}
                </p>
                {(row.caption || secondary) && (
                  <p className="truncate font-hud text-[11px] text-ink-faint">
                    {row.caption ?? secondary?.(row)}
                  </p>
                )}
              </div>
              <div className="relative text-right">
                <span className="font-display text-2xl text-gold">{row.value}</span>
                <p className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">
                  {valueLabel}
                </p>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
