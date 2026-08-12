"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Crest } from "@/components/ui/Crest";
import { ParticleField } from "@/components/ui/ParticleField";
import { cn } from "@/lib/utils";
import { signIn, signUp, authAvailable } from "@/lib/supabase/auth";
import { getGroupForUser } from "@/lib/supabase/groups";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!authAvailable()) {
      setError("Esta función todavía no está disponible en esta app.");
      return;
    }

    setLoading(true);
    try {
      const { data, error: authError } =
        mode === "signup" ? await signUp(email, password) : await signIn(email, password);

      if (authError) {
        setError(authError.message);
        return;
      }

      const userId = data?.user?.id;
      if (!userId) {
        if (mode === "signup") {
          setError("Revisá tu email para confirmar la cuenta y después entrá.");
        }
        return;
      }

      const group = await getGroupForUser(userId);
      router.push(group ? "/" : "/onboarding");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-void px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(53,226,226,0.1),transparent_55%)]" />
        <ParticleField density={40} className="opacity-60" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-strong relative z-10 w-full max-w-sm rounded-2xl border border-line p-8 text-center"
      >
        <Crest size={64} className="mx-auto" />
        <h1 className="mt-4 font-display text-2xl uppercase tracking-wide text-gold-gradient">
          {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
        </h1>
        <p className="mt-1 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
          {mode === "signup" ? "Para armar tu equipo" : "Entrá a tu equipo"}
        </p>

        <div className="mt-6 space-y-3">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
              placeholder="Email"
              className="w-full rounded-xl border border-line bg-white/5 py-3 pl-9 pr-4 text-center font-hud text-sm tracking-wide text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Contraseña"
              className="w-full rounded-xl border border-line bg-white/5 py-3 pl-9 pr-10 text-center font-hud text-sm tracking-wide text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
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
        </div>

        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "mt-4 w-full rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] py-3 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)]",
            loading && "opacity-60"
          )}
        >
          {loading ? "Un momento…" : mode === "signup" ? "Crear cuenta ⚽" : "Entrar ⚽"}
        </motion.button>

        {error && <p className="mt-3 font-hud text-xs text-magenta">{error}</p>}

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
          className="mt-5 font-hud text-xs uppercase tracking-wide text-ink-faint underline-offset-2 hover:text-gold hover:underline"
        >
          {mode === "signup" ? "¿Ya tenés cuenta? Iniciá sesión" : "¿Sos nuevo? Creá tu equipo"}
        </button>
      </motion.form>
    </div>
  );
}
