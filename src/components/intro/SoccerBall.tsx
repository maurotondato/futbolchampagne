"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SoccerBall({
  size = 64,
  spinning = true,
  className,
}: {
  size?: number;
  spinning?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      className={cn("relative flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      animate={
        spinning
          ? { rotate: 360, y: [0, -size * 0.14, 0] }
          : undefined
      }
      transition={
        spinning
          ? {
              rotate: { repeat: Infinity, duration: 1.3, ease: "linear" },
              y: { repeat: Infinity, duration: 0.65, ease: "easeInOut" },
            }
          : undefined
      }
    >
      <span
        role="img"
        aria-label="Pelota de fútbol"
        style={{
          fontSize: size * 0.92,
          lineHeight: 1,
          display: "block",
          filter:
            "drop-shadow(0 0 18px rgba(232,201,121,0.45)) drop-shadow(0 6px 10px rgba(0,0,0,0.5))",
        }}
      >
        ⚽
      </span>
      <div
        className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/40 blur-sm"
        style={{ width: size * 0.55, height: size * 0.12 }}
      />
    </motion.div>
  );
}
