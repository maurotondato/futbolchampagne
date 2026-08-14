"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Crest } from "@/components/ui/Crest";
import { cn } from "@/lib/utils";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { getGroupForUser, joinGroupByInviteCode } from "@/lib/supabase/groups";

export default function JoinPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = await getCurrentUserId();
      if (!uid) {
        router.replace("/login");
        return;
      }
      const existing = await getGroupForUser(uid);
      if (existing) {
        router.replace("/");
        return;
      }
      setUserId(uid);
      setChecking(false);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !code.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const { error: joinError } = await joinGroupByInviteCode(userId, code);
      if (joinError) {
        setError(joinError);
        return;
      }
      router.push("/");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return (
      <PageShell>
        <div className="flex min-h-dvh items-center justify-center">
          <p className="font-hud text-ink-faint">Cargando…</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex min-h-dvh items-center justify-center px-4">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <GlassPanel strong className="w-full max-w-sm rounded-2xl border border-line p-8 text-center">
            <Crest size={64} className="mx-auto" />
            <h1 className="mt-4 font-display text-2xl uppercase tracking-wide text-gold-gradient">
              Sumate a un equipo
            </h1>
            <p className="mt-1 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
              Pedile el código a quien te invitó
            </p>

            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              autoFocus
              required
              placeholder="Código de invitación"
              className="mt-6 w-full rounded-xl border border-line bg-white/5 px-4 py-3 text-center font-hud text-sm uppercase tracking-widest text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
            />

            <motion.button
              type="submit"
              disabled={submitting || !code.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "mt-4 w-full rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] py-3 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)]",
                (submitting || !code.trim()) && "opacity-60"
              )}
            >
              {submitting ? "Un momento…" : "Sumarme ⚽"}
            </motion.button>

            {error && <p className="mt-3 font-hud text-xs text-magenta">{error}</p>}

            <button
              type="button"
              onClick={() => router.push("/onboarding")}
              className="mt-5 font-hud text-xs uppercase tracking-wide text-ink-faint underline-offset-2 hover:text-gold hover:underline"
            >
              Mejor armo un equipo nuevo
            </button>
          </GlassPanel>
        </motion.form>
      </div>
    </PageShell>
  );
}
