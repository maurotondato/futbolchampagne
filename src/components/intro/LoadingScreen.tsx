"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SoccerBall } from "./SoccerBall";
import { GROUP_NAME } from "@/lib/data/demoData";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const duration = 2600;
    let raf = 0;
    function tick() {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 400);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-void"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(53,226,226,0.09),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(0,0,0,0.7)_100%)]" />
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px w-full origin-left bg-gradient-to-r from-transparent via-gold/30 to-transparent"
            style={{ top: `${(i + 1) * 14}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: [0, 0.5, 0] }}
            transition={{ duration: 2.2, delay: i * 0.15, repeat: Infinity }}
          />
        ))}
      </div>

      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <SoccerBall size={88} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16, letterSpacing: "0.4em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "0.06em" }}
        transition={{ delay: 0.3, duration: 1 }}
        className="mt-8 text-center font-display text-4xl uppercase text-gold-gradient sm:text-6xl"
      >
        {GROUP_NAME}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-2 font-hud text-xs uppercase tracking-[0.4em] text-ink-dim sm:text-sm"
      >
        Esto no es fútbol. Es fútbol champagne.
      </motion.p>

      <div className="mt-10 h-1.5 w-64 overflow-hidden rounded-full bg-white/10 sm:w-80">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-gold-dim via-gold to-gold-bright"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-3 font-hud text-xs tracking-[0.3em] text-ink-faint">
        CARGANDO {progress}%
      </p>
    </motion.div>
  );
}
