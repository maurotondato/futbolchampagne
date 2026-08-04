"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Crest } from "@/components/ui/Crest";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setLoading(true);
    if (mode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else router.push("/admin");
    } else {
      const { error } = await sb.auth.signUp({ email, password });
      setLoading(false);
      if (error) setError(error.message);
      else setInfo("Cuenta creada. Si pidió confirmación, revisá el mail e iniciá sesión.");
    }
  }

  return (
    <PageShell>
      <div className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center px-4 py-10">
        <Crest size={64} />
        <h1 className="mt-4 font-display text-2xl uppercase text-gold-gradient">
          Acceso administrador
        </h1>
        <p className="mb-6 mt-1 text-center font-hud text-xs uppercase tracking-wide text-ink-faint">
          Para cargar jugadores, fotos y partidos
        </p>

        <GlassPanel className="w-full p-6">
          {!isSupabaseConfigured ? (
            <div className="text-center">
              <ShieldCheck size={28} className="mx-auto mb-3 text-cyan" />
              <p className="font-hud text-sm text-ink-dim">
                Todavía no conectaste Supabase, así que el panel de administración está{" "}
                <span className="text-emerald">abierto en modo demo</span>. Configurá las variables
                de entorno para exigir login real.
              </p>
              <GlowButton variant="gold" className="mt-4" onClick={() => router.push("/admin")}>
                Ir al panel
              </GlowButton>
            </div>
          ) : (
            <>
              <div className="mb-5 flex rounded-xl border border-line p-1">
                {(["login", "signup"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={cn(
                      "flex-1 rounded-lg py-2 font-hud text-xs uppercase tracking-wide transition",
                      mode === m ? "bg-gold/15 text-gold" : "text-ink-faint"
                    )}
                  >
                    {m === "login" ? "Ingresar" : "Registrarme"}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full rounded-lg border border-line bg-white/5 py-2.5 pl-9 pr-3 font-hud text-sm outline-none focus:border-gold/50"
                  />
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full rounded-lg border border-line bg-white/5 py-2.5 pl-9 pr-3 font-hud text-sm outline-none focus:border-gold/50"
                  />
                </div>
                {error && <p className="font-hud text-xs text-magenta">{error}</p>}
                {info && <p className="font-hud text-xs text-emerald">{info}</p>}
                <GlowButton variant="gold" disabled={loading} className="w-full">
                  {loading ? "Un momento…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
                </GlowButton>
              </form>
            </>
          )}
        </GlassPanel>
      </div>
    </PageShell>
  );
}
