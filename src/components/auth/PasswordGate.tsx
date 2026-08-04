"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Crest } from "@/components/ui/Crest";
import { ParticleField } from "@/components/ui/ParticleField";
import { GROUP_NAME } from "@/lib/data/demoData";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "fc-unlocked";
// Casual shared password for the group — this is a friendly "are you one of
// us" gate, not real security (it ships in the client bundle either way).
const PASSWORD = "fulbito";

export function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim().toLowerCase() === PASSWORD) {
      window.localStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setValue("");
      setTimeout(() => setError(false), 500);
    }
  }

  if (unlocked === null) {
    return <div className="fixed inset-0 z-[200] bg-void" />;
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-void px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(53,226,226,0.1),transparent_55%)]" />
        <ParticleField density={40} className="opacity-60" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={error ? { x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, y: 0 }}
        transition={error ? { duration: 0.45 } : { duration: 0.6 }}
        className="glass-strong relative z-10 w-full max-w-sm rounded-2xl border border-line p-8 text-center"
      >
        <Crest size={64} className="mx-auto" />
        <h1 className="mt-4 font-display text-2xl uppercase tracking-wide text-gold-gradient">
          {GROUP_NAME}
        </h1>
        <p className="mt-1 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
          Acceso solo para el plantel
        </p>

        <div className="relative mt-6">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            placeholder="Contraseña"
            className={cn(
              "w-full rounded-xl border bg-white/5 py-3 pl-9 pr-10 text-center font-hud text-sm tracking-wide text-ink outline-none placeholder:text-ink-faint",
              error ? "border-magenta/70" : "border-line focus:border-gold/50"
            )}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
            aria-label={show ? "Ocultar" : "Mostrar"}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-4 w-full rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] py-3 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)]"
        >
          Entrar ⚽
        </motion.button>

        {error && (
          <p className="mt-3 font-hud text-xs text-magenta">Esa no es. Preguntale al grupo.</p>
        )}
      </motion.form>
    </div>
  );
}
