"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type SoundName = "click" | "hover" | "whoosh" | "crowd" | "goal" | "select";

const SOUND_SRC: Record<SoundName, string> = {
  click: "/audio/click.mp3",
  hover: "/audio/hover.mp3",
  whoosh: "/audio/whoosh.mp3",
  crowd: "/audio/crowd.mp3",
  goal: "/audio/goal.mp3",
  select: "/audio/select.mp3",
};

interface SoundContextValue {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName, opts?: { volume?: number }) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const cache = useRef<Partial<Record<SoundName, HTMLAudioElement>>>({});

  useEffect(() => {
    // localStorage is only available client-side, so this can't be derived during render.
    const stored = window.localStorage.getItem("fc-sound-enabled");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored != null) setEnabled(stored === "1");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      window.localStorage.setItem("fc-sound-enabled", next ? "1" : "0");
      return next;
    });
  }, []);

  const play = useCallback(
    (name: SoundName, opts?: { volume?: number }) => {
      if (!enabled) return;
      try {
        let audio = cache.current[name];
        if (!audio) {
          audio = new Audio(SOUND_SRC[name]);
          cache.current[name] = audio;
        }
        audio.volume = opts?.volume ?? 0.5;
        audio.currentTime = 0;
        void audio.play().catch(() => {});
      } catch {
        // Sound assets are optional — fail silently.
      }
    },
    [enabled]
  );

  const value = useMemo(() => ({ enabled, toggle, play }), [enabled, toggle, play]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within SoundProvider");
  return ctx;
}
