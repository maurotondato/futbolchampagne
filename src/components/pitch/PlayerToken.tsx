"use client";

import { motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { Player } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function PlayerToken({
  player,
  x,
  y,
  team,
  pitchRef,
  onMove,
  onRemove,
  readOnly = false,
}: {
  player: Player;
  x: number;
  y: number;
  team: "A" | "B";
  pitchRef: React.RefObject<HTMLDivElement | null>;
  onMove: (xPct: number, yPct: number) => void;
  onRemove: () => void;
  readOnly?: boolean;
}) {
  function handleDragEnd(_: unknown, info: PanInfo) {
    const rect = pitchRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xPct = ((info.point.x - rect.left) / rect.width) * 100;
    const yPct = ((info.point.y - rect.top) / rect.height) * 100;
    onMove(
      Math.min(97, Math.max(3, xPct)),
      Math.min(97, Math.max(3, yPct))
    );
  }

  return (
    <motion.div
      drag={!readOnly}
      dragConstraints={pitchRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDragEnd={readOnly ? undefined : handleDragEnd}
      whileDrag={readOnly ? undefined : { scale: 1.15, zIndex: 50 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
        readOnly ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      )}
      style={{ left: `${x}%`, top: `${y}%`, touchAction: "none" }}
    >
      {!readOnly && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-magenta text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          aria-label="Quitar jugador"
        >
          <X size={12} />
        </button>
      )}
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
          "rounded px-1.5 py-0.5 font-hud text-[10px] font-semibold uppercase tracking-wide text-white shadow",
          team === "A" ? "bg-gold-dim/90" : "bg-cyan/30"
        )}
      >
        {player.nickname || player.name.split(" ")[0]}
      </span>
    </motion.div>
  );
}
