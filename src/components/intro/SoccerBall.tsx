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
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      animate={spinning ? { rotate: 360 } : undefined}
      transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #ffffff 0%, #e9ecf3 32%, #b7bfd1 62%, #6c7288 100%)",
          boxShadow:
            "inset -6px -8px 14px rgba(0,0,0,0.35), inset 4px 4px 10px rgba(255,255,255,0.6), 0 0 24px rgba(232,201,121,0.35)",
        }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <polygon
          points="50,30 62,39 57,53 43,53 38,39"
          fill="#14171f"
          opacity={0.88}
        />
        <polygon points="50,30 62,39 68,26 58,16 42,16 32,26 38,39" fill="none" stroke="#14171f" strokeWidth="2" opacity={0.55} />
        <polygon points="57,53 68,60 66,75 50,80 43,53" fill="none" stroke="#14171f" strokeWidth="2" opacity={0.55} />
        <polygon points="43,53 38,39 24,42 18,58 33,68" fill="none" stroke="#14171f" strokeWidth="2" opacity={0.55} />
      </svg>
    </motion.div>
  );
}
