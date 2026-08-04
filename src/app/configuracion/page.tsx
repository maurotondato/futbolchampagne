"use client";

import { useRouter } from "next/navigation";
import { Volume2, VolumeX, ShieldCheck, Database, Trash2, Film, Music2 } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { useSound } from "@/components/ui/SoundProvider";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function ConfiguracionPage() {
  const router = useRouter();
  const { enabled, toggle } = useSound();

  function handleReset() {
    if (!confirm("Esto borra los datos guardados en este navegador (modo demo) y recarga la página. ¿Seguro?")) {
      return;
    }
    window.localStorage.removeItem("futbol-champagne-store");
    window.location.reload();
  }

  return (
    <PageShell>
      <TopBar title="Configuración" subtitle="Sonido, datos y ajustes" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-2xl space-y-4 px-4 pb-16 pt-6 sm:px-6">
        <GlassPanel className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            {enabled ? <Volume2 className="text-gold" size={20} /> : <VolumeX className="text-ink-faint" size={20} />}
            <div>
              <p className="font-hud text-sm font-semibold text-ink">Sonido de la app</p>
              <p className="font-hud text-xs text-ink-faint">Clicks, hovers y efectos opcionales</p>
            </div>
          </div>
          <button
            onClick={toggle}
            className={cn(
              "relative h-7 w-14 rounded-full border transition",
              enabled ? "border-gold/60 bg-gold/20" : "border-line bg-white/5"
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-6 w-6 rounded-full bg-gradient-to-br from-gold-bright to-gold transition-transform",
                enabled ? "translate-x-7" : "translate-x-0.5"
              )}
            />
          </button>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <Database className={isSupabaseConfigured ? "text-emerald" : "text-cyan"} size={20} />
            <div>
              <p className="font-hud text-sm font-semibold text-ink">
                {isSupabaseConfigured ? "Conectado a Supabase" : "Modo demo (sin Supabase)"}
              </p>
              <p className="font-hud text-xs text-ink-faint">
                {isSupabaseConfigured
                  ? "Los datos se guardan en la base de datos del grupo."
                  : "Los datos se guardan solo en este navegador hasta que conectes Supabase."}
              </p>
            </div>
          </div>
          <GlowButton variant="ghost" onClick={() => router.push("/admin")} className="flex items-center gap-2">
            <ShieldCheck size={15} /> Ir al panel de administración
          </GlowButton>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <Film className="text-ink-dim" size={20} />
            <p className="font-hud text-sm font-semibold text-ink">Video de intro</p>
          </div>
          <p className="font-hud text-xs text-ink-faint">
            Reemplazá <code className="rounded bg-white/10 px-1.5 py-0.5">public/video/intro.mp4</code> por el
            video del grupo. La intro se reproduce una vez por sesión del navegador.
          </p>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <Music2 className="text-ink-dim" size={20} />
            <p className="font-hud text-sm font-semibold text-ink">Efectos de sonido</p>
          </div>
          <p className="font-hud text-xs text-ink-faint">
            Colocá archivos cortos en <code className="rounded bg-white/10 px-1.5 py-0.5">public/audio/</code>{" "}
            (click, hover, whoosh, crowd, goal, select) para escuchar sonidos tipo videojuego.
          </p>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-3 flex items-center gap-3">
            <Trash2 className="text-magenta" size={20} />
            <p className="font-hud text-sm font-semibold text-ink">Borrar datos locales</p>
          </div>
          <p className="mb-3 font-hud text-xs text-ink-faint">
            Reinicia el plantel y los partidos guardados en este navegador (modo demo). No afecta a Supabase.
          </p>
          <GlowButton variant="danger" onClick={handleReset} className="flex items-center gap-2">
            <Trash2 size={15} /> Borrar y reiniciar
          </GlowButton>
        </GlassPanel>
      </div>
    </PageShell>
  );
}
