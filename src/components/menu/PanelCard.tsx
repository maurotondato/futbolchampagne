"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSound } from "@/components/ui/SoundProvider";
import type { LucideIcon } from "lucide-react";

interface PanelCardProps {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  accent?: "gold" | "cyan" | "magenta" | "emerald";
  big?: boolean;
  index?: number;
}

const ACCENTS: Record<
  NonNullable<PanelCardProps["accent"]>,
  { ring: string; glow: string; text: string }
> = {
  gold: {
    ring: "group-hover:border-gold/70",
    glow: "from-gold/25",
    text: "text-gold",
  },
  cyan: {
    ring: "group-hover:border-cyan/70",
    glow: "from-cyan/25",
    text: "text-cyan",
  },
  magenta: {
    ring: "group-hover:border-magenta/70",
    glow: "from-magenta/25",
    text: "text-magenta",
  },
  emerald: {
    ring: "group-hover:border-emerald/70",
    glow: "from-emerald/25",
    text: "text-emerald",
  },
};

export function PanelCard({
  href,
  emoji,
  title,
  subtitle,
  accent = "gold",
  big,
  index = 0,
}: PanelCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const { play } = useSound();
  const a = ACCENTS[accent];

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: py * -10, ry: px * 12 });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: "easeOut" }}
      className={cn(big && "sm:col-span-2 sm:row-span-2")}
    >
      <Link href={href} className="block h-full">
        <motion.div
          ref={ref}
          onMouseMove={handleMove}
          onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
          onHoverStart={() => play("hover", { volume: 0.15 })}
          onClick={() => play("select", { volume: 0.3 })}
          animate={{ rotateX: tilt.rx, rotateY: tilt.ry }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{ transformStyle: "preserve-3d", perspective: 800 }}
          className={cn(
            "group relative flex h-full min-h-[150px] flex-col justify-between overflow-hidden rounded-2xl border border-line p-5 glass",
            a.ring,
            big && "min-h-[320px] p-8"
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute -inset-1 bg-gradient-to-br to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100",
              a.glow
            )}
          />
          <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/5 blur-2xl transition-transform duration-700 group-hover:scale-150" />

          <div className="relative flex items-start justify-between">
            <span
              className={cn(
                "select-none drop-shadow-[0_0_18px_rgba(232,201,121,0.35)] transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6",
                big ? "text-6xl" : "text-4xl"
              )}
            >
              {emoji}
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className={cn(
                "mt-1 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
                a.text
              )}
            >
              <path
                d="M9 6l6 6-6 6"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="relative">
            <h3
              className={cn(
                "font-display uppercase tracking-wide text-ink",
                big ? "text-4xl" : "text-2xl"
              )}
            >
              {title}
            </h3>
            <p className="mt-1 font-hud text-xs uppercase tracking-[0.15em] text-ink-faint">
              {subtitle}
            </p>
          </div>

          <div
            className={cn(
              "pointer-events-none absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r transition-all duration-500 group-hover:w-full",
              accent === "gold" && "from-gold-dim via-gold to-gold-bright",
              accent === "cyan" && "from-cyan/40 via-cyan to-cyan-bright",
              accent === "magenta" && "from-magenta/40 via-magenta to-pink-200",
              accent === "emerald" && "from-emerald/40 via-emerald to-green-200"
            )}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}
