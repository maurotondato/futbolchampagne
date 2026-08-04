"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";

export function IntroVideo({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasSource, setHasSource] = useState(true);
  const [muted, setMuted] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = setTimeout(() => {
      if (!ready) onDone();
    }, 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

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
        autoPlay
        muted={muted}
        playsInline
        className="h-full w-full object-cover"
        onCanPlay={() => setReady(true)}
        onEnded={onDone}
        onError={() => {
          setHasSource(false);
          onDone();
        }}
      >
        <source src="/video/intro.mp4" type="video/mp4" />
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
          onClick={onDone}
          className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 font-hud text-xs uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
        >
          Saltar intro
          <SkipForward size={16} />
        </button>
      </div>
    </motion.div>
  );
}
