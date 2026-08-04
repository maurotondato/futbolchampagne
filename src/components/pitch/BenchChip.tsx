"use client";

import { useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { Player } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function BenchChip({
  player,
  team,
  onToggleTeam,
  pitchRef,
  onPlace,
}: {
  player: Player;
  team: "A" | "B";
  onToggleTeam: () => void;
  pitchRef: React.RefObject<HTMLDivElement | null>;
  onPlace: (xPct: number, yPct: number) => void;
}) {
  const [dragging, setDragging] = useState(false);

  function handleDragEnd(_: unknown, info: PanInfo) {
    setDragging(false);
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const inside =
      info.point.x >= rect.left &&
      info.point.x <= rect.right &&
      info.point.y >= rect.top &&
      info.point.y <= rect.bottom;
    if (!inside) return;
    const xPct = ((info.point.x - rect.left) / rect.width) * 100;
    const yPct = ((info.point.y - rect.top) / rect.height) * 100;
    onPlace(Math.min(97, Math.max(3, xPct)), Math.min(97, Math.max(3, yPct)));
  }

  return (
    <motion.div
      drag
      dragSnapToOrigin
      dragMomentum={false}
      onDragStart={() => setDragging(true)}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.2, zIndex: 50 }}
      whileHover={{ y: -2 }}
      style={{ touchAction: "none" }}
      className={cn(
        "glass relative flex w-[86px] shrink-0 cursor-grab flex-col items-center gap-1.5 rounded-xl border p-2.5 text-center active:cursor-grabbing",
        dragging ? "z-50 border-gold/70" : "border-line"
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleTeam();
        }}
        className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-[1px] font-hud text-[9px] font-bold uppercase tracking-wider text-void shadow",
          team === "A" ? "bg-gold" : "bg-cyan"
        )}
      >
        Equipo {team}
      </button>
      <PlayerAvatar
        player={player}
        size={44}
        ring={team === "A" ? "border-gold/60" : "border-cyan/60"}
      />
      <span className="line-clamp-1 w-full font-hud text-[10px] font-medium text-ink-dim">
        {player.nickname || player.name.split(" ")[0]}
      </span>
    </motion.div>
  );
}
