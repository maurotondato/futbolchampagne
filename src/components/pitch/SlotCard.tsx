"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { Player } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function SlotCard({
  x,
  y,
  team,
  label,
  player,
  onClick,
}: {
  x: number;
  y: number;
  team: "A" | "B";
  label: string;
  player?: Player;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className="absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer flex-col items-center gap-1"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {player ? (
        <>
          <PlayerAvatar
            player={player}
            size={52}
            ring={cn(
              "shadow-[0_4px_14px_rgba(0,0,0,0.5)]",
              team === "A" ? "border-gold ring-2 ring-gold/40" : "border-cyan ring-2 ring-cyan/40"
            )}
          />
          <span
            className={cn(
              "max-w-[84px] truncate rounded px-1.5 py-0.5 font-hud text-[10px] font-semibold uppercase tracking-wide text-white shadow",
              team === "A" ? "bg-gold-dim/90" : "bg-cyan/30"
            )}
          >
            {player.nickname || player.name.split(" ")[0]}
          </span>
        </>
      ) : (
        <>
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed bg-black/20 backdrop-blur-sm",
              team === "A" ? "border-gold/50 text-gold/70" : "border-cyan/50 text-cyan/70"
            )}
          >
            <Plus size={18} />
          </span>
          <span className="rounded bg-black/55 px-1.5 py-0.5 font-hud text-[9px] uppercase tracking-wide text-white/80">
            {label}
          </span>
        </>
      )}
    </motion.button>
  );
}
