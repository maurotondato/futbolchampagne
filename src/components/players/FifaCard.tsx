"use client";

import { motion } from "framer-motion";
import { Crest } from "@/components/ui/Crest";
import { initials, cn } from "@/lib/utils";
import type { Player } from "@/lib/data/types";
import { cardFaceAttributes, computeOverall, tierFor, TIER_STYLES } from "@/lib/data/attributeMeta";

export function FifaCard({
  player,
  className,
  interactive = true,
}: {
  player: Player;
  className?: string;
  interactive?: boolean;
}) {
  const ovr = computeOverall(player.attributes);
  const tier = tierFor(ovr);
  const style = TIER_STYLES[tier];
  const face = cardFaceAttributes(player.attributes);

  return (
    <motion.div
      whileHover={interactive ? { rotateY: 8, rotateX: -4, scale: 1.02 } : undefined}
      transition={{ type: "spring", stiffness: 200, damping: 18 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn("relative w-full max-w-[300px]", className)}
    >
      <div
        className="relative overflow-hidden rounded-[22px] p-[3px] shadow-[0_25px_60px_rgba(0,0,0,0.6)]"
        style={{ backgroundImage: style.border }}
      >
        <div
          className="relative overflow-hidden rounded-[19px] px-5 pb-5 pt-6"
          style={{ backgroundImage: style.bg }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.15] mix-blend-overlay bg-[radial-gradient(circle_at_30%_0%,#fff,transparent_55%)]" />
          <div className="pointer-events-none absolute -right-10 top-16 h-40 w-40 rotate-12 rounded-full bg-white/5 blur-2xl" />

          <div className="relative flex items-start justify-between">
            <div className="text-center leading-none">
              <div className="font-display text-4xl" style={{ color: style.text }}>
                {ovr}
              </div>
              <div className="mt-1 font-hud text-xs font-bold tracking-wide" style={{ color: style.text }}>
                {player.favoritePosition}
              </div>
              <div className="mx-auto mt-1 h-[2px] w-8 opacity-60" style={{ backgroundColor: style.text }} />
              <div className="mt-1 font-hud text-[9px] uppercase tracking-[0.2em] opacity-70" style={{ color: style.text }}>
                {style.label}
              </div>
            </div>
            <Crest size={40} />
          </div>

          <div className="relative mx-auto mt-2 flex h-32 w-32 items-center justify-center">
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-2 bg-gradient-to-br from-white/10 to-black/30 font-display text-3xl text-white"
              style={{ borderColor: style.text }}
            >
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photoUrl} alt={player.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                initials(player.name)
              )}
            </div>
          </div>

          <div className="relative mt-2 text-center">
            <div className="truncate font-display text-xl uppercase tracking-wide text-white">
              {player.nickname || player.name}
            </div>
            {player.nickname && (
              <div className="truncate font-hud text-[11px] uppercase tracking-wider text-white/50">
                {player.name}
              </div>
            )}
          </div>

          <div
            className="relative mx-auto mt-3 h-px w-[85%] opacity-40"
            style={{ backgroundImage: `linear-gradient(90deg, transparent, ${style.text}, transparent)` }}
          />

          <div className="relative mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 px-2">
            {face.map((attr) => (
              <div key={attr.key} className="flex items-center justify-between">
                <span className="font-hud text-sm font-bold" style={{ color: style.text }}>
                  {attr.value}
                </span>
                <span className="font-hud text-[11px] uppercase tracking-wide text-white/70">
                  {attr.short}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
