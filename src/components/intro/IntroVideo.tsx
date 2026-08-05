"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";
import { withBasePath } from "@/lib/basePath";

export function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasSource, setHasSource] = useState(true);
  // Starts unmuted on purpose — this plays right after the password-gate
  // click, a genuine user gesture, so browsers generally allow audio.
  const [muted, setMuted] = useState(false);
  const doneRef = useRef(false);

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }

  useEffect(() => {
    // Hard ceiling regardless of video state: some browsers (notably
    // Safari under stricter autoplay policies) can fire "canplay" and then
    // silently stall playback forever, so a fallback that only triggers
    // while !ready is not enough — this one always fires.
    const t = setTimeout(finish, 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Imperative play (instead of the autoPlay attribute) so a rejected
    // unmuted attempt can fall back to muted playback instead of just
    // leaving the video paused/black. Re-runs when `muted` flips, which
    // covers both this fallback and the manual toggle button below.
    videoRef.current?.play().catch(() => {
      if (!muted) setMuted(true);
    });
  }, [muted]);

  if (!hasSource) return null;

  return (
    <motion.div
      key="video"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7 } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
    >
      <video
        ref={videoRef}
        muted={muted}
        playsInline
        className="h-full w-full object-cover"
        onEnded={finish}
        onError={() => {
          setHasSource(false);
          finish();
        }}
      >
        <source src={withBasePath("/video/intro.mp4")} type="video/mp4" />
      </video>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,transparent_18%,transparent_82%,rgba(0,0,0,0.6)_100%)]" />

      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-4 pb-6 sm:px-8 sm:pb-10">
        <button
          onClick={() => setMuted((m) => !m)}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-hud text-xs uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          {muted ? "Sonido" : "Silenciar"}
        </button>
        <button
          onClick={finish}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-hud text-xs uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Saltar intro
          <SkipForward size={16} />
        </button>
      </div>
    </motion.div>
  );
}
