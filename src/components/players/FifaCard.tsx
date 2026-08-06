"use client";

import { motion } from "framer-motion";
import { Crest } from "@/components/ui/Crest";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { initials, cn } from "@/lib/utils";
import { withBasePath } from "@/lib/basePath";
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
      initial={{ opacity: 0, y: 24, scale: 0.94, rotateY: -10 }}
      animate={{
        opacity: 1,
        y: [0, -7, 0],
        scale: 1,
        rotateY: 0,
      }}
      whileHover={interactive ? { rotateY: 10, rotateX: -5, scale: 1.04 } : undefined}
      transition={{
        opacity: { duration: 0.6 },
        scale: { type: "spring", stiffness: 200, damping: 18 },
        rotateY: { type: "spring", stiffness: 200, damping: 18 },
        y: { duration: 3.2, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn("relative w-full max-w-[300px]", className)}
    >
      {/* Ambient tier-colored glow, pulsing behind the card */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[28px] blur-2xl"
        style={{ backgroundColor: style.text, opacity: 0.25 }}
        animate={{ opacity: [0.18, 0.38, 0.18] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
      />

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

          {/* Holo shine sweep */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
            animate={{ x: ["-40%", "480%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2.2, ease: "easeInOut" }}
          />

          <div className="relative flex items-start justify-between">
            <div className="text-center leading-none">
              <div
                className="font-display text-4xl"
                style={{ color: style.text, textShadow: `0 0 18px ${style.text}99` }}
              >
                <AnimatedNumber value={ovr} duration={1.3} />
              </div>
              <div className="mt-1 font-hud text-xs font-bold tracking-wide" style={{ color: style.text }}>
                {player.favoritePosition}
              </div>
              <div className="mx-auto mt-1 h-[2px] w-8 opacity-60" style={{ backgroundColor: style.text }} />
              <div className="mt-1 font-hud text-[9px] uppercase tracking-[0.2em] opacity-70" style={{ color: style.text }}>
                {style.label}
              </div>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Crest size={40} />
              <span
                className="text-xl leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
                title="Argentina"
                role="img"
                aria-label="Argentina"
              >
                🇦🇷
              </span>
            </div>
          </div>

          <div className="relative mx-auto mt-2 flex h-32 w-32 items-center justify-center">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2px ${style.text}55` }}
              animate={{ boxShadow: [`0 0 0 2px ${style.text}33`, `0 0 22px 4px ${style.text}77`, `0 0 0 2px ${style.text}33`] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            />
            <div
              className="flex h-28 w-28 items-center justify-center rounded-full border-2 bg-gradient-to-br from-white/10 to-black/30 font-display text-3xl text-white"
              style={{ borderColor: style.text }}
            >
              {player.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={withBasePath(player.photoUrl)} alt={player.name} className="h-full w-full rounded-full object-cover" />
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
                  <AnimatedNumber value={attr.value} duration={1} />
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
