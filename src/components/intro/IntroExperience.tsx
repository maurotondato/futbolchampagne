"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IntroVideo } from "./IntroVideo";
import { LoadingScreen } from "./LoadingScreen";

type Stage = "boot" | "video" | "loading" | "reveal" | "done";

const SEEN_KEY = "fc-intro-seen";

export function IntroExperience({ children }: { children: React.ReactNode }) {
  const [stage, setStage] = useState<Stage>("boot");

  useEffect(() => {
    // sessionStorage is only available client-side, so this can't be derived during render.
    const seen = window.sessionStorage.getItem(SEEN_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStage(seen ? "reveal" : "video");
  }, []);

  useEffect(() => {
    if (stage === "reveal") {
      window.sessionStorage.setItem(SEEN_KEY, "1");
      const t = setTimeout(() => setStage("done"), 900);
      return () => clearTimeout(t);
    }
  }, [stage]);

  if (stage === "boot") {
    return <div className="fixed inset-0 z-50 bg-void" />;
  }

  return (
    <>
      <AnimatePresence>
        {stage === "video" && (
          <IntroVideo onDone={() => setStage("loading")} />
        )}
        {stage === "loading" && (
          <LoadingScreen onDone={() => setStage("reveal")} />
        )}
        {stage === "reveal" && <RevealCurtain />}
      </AnimatePresence>
      {(stage === "reveal" || stage === "done") && children}
    </>
  );
}

function RevealCurtain() {
  return (
    <motion.div
      key="reveal"
      className="pointer-events-none fixed inset-0 z-40 flex"
      initial="closed"
      animate="open"
    >
      <motion.div
        className="h-full w-1/2 bg-gradient-to-r from-void via-void to-transparent"
        variants={{ closed: { x: 0 }, open: { x: "-100%" } }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="h-full w-1/2 bg-gradient-to-l from-void via-void to-transparent"
        variants={{ closed: { x: 0 }, open: { x: "100%" } }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
      />
      <motion.div
        className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/40 blur-3xl"
        initial={{ scale: 0.5, opacity: 0.9 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
      />
    </motion.div>
  );
}
