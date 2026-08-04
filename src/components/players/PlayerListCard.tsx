"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { computeOverall, tierFor, TIER_STYLES } from "@/lib/data/attributeMeta";
import type { Player } from "@/lib/data/types";

export function PlayerListCard({ player, index = 0 }: { player: Player; index?: number }) {
  const ovr = computeOverall(player.attributes);
  const style = TIER_STYLES[tierFor(ovr)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.5) }}
    >
      <Link href={`/jugadores/${player.id}`}>
        <motion.div
          whileHover={{ y: -4 }}
          className="glass group flex items-center gap-3 rounded-xl border border-line p-3 transition hover:border-gold/50"
        >
          <PlayerAvatar player={player} size={52} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-hud text-sm font-semibold text-ink">
              {player.nickname || player.name}
            </p>
            <p className="truncate font-hud text-[11px] uppercase tracking-wide text-ink-faint">
              {player.nickname ? `${player.name} · ` : ""}
              {player.favoritePosition}
            </p>
          </div>
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-lg"
            style={{ backgroundImage: style.border, color: "#08090c" }}
          >
            <span
              className="flex h-[calc(100%-2px)] w-[calc(100%-2px)] items-center justify-center rounded-[6px]"
              style={{ backgroundImage: style.bg, color: style.text }}
            >
              {ovr}
            </span>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
