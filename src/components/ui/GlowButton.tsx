"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "./SoundProvider";

type Variant = "gold" | "cyan" | "ghost" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  gold:
    "bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)] hover:shadow-[0_0_40px_rgba(232,201,121,0.55)]",
  cyan:
    "bg-gradient-to-b from-[#7bfdfd] via-[#35e2e2] to-[#1a8f8f] text-[#031414] shadow-[0_0_25px_rgba(53,226,226,0.35)] hover:shadow-[0_0_40px_rgba(53,226,226,0.55)]",
  ghost:
    "bg-white/5 text-ink border border-line hover:border-gold/60 hover:bg-white/10",
  danger:
    "bg-gradient-to-b from-[#ff6a8f] to-[#c21c46] text-white shadow-[0_0_25px_rgba(255,61,127,0.3)] hover:shadow-[0_0_40px_rgba(255,61,127,0.5)]",
};

export function GlowButton({
  variant = "gold",
  className,
  children,
  playSound = true,
  ...rest
}: HTMLMotionProps<"button"> & { variant?: Variant; playSound?: boolean }) {
  const { play } = useSound();
  return (
    <motion.button
      whileHover={{ scale: 1.035, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onHoverStart={() => playSound && play("hover", { volume: 0.2 })}
      onClick={(e) => {
        if (playSound) play("click", { volume: 0.35 });
        rest.onClick?.(e);
      }}
      className={cn(
        "relative font-hud font-semibold tracking-wide uppercase text-sm px-6 py-3 rounded-xl transition-shadow cursor-pointer select-none",
        "disabled:opacity-40 disabled:pointer-events-none",
        VARIANT_CLASSES[variant],
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}
