"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, ShieldCheck, AlertCircle } from "lucide-react";
import { PanelCard } from "./PanelCard";
import { Crest } from "@/components/ui/Crest";
import { PageShell } from "@/components/ui/PageShell";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { GROUP_NAME } from "@/lib/data/demoData";
import { useSound } from "@/components/ui/SoundProvider";
import { isAwaitingResult, matchDateTime } from "@/lib/matchDay";

const MENU_ITEMS = [
  { href: "/armar-partido", emoji: "⚽", title: "Armar Partido", subtitle: "Formaciones en vivo", accent: "emerald" as const, big: true },
  { href: "/tabla", emoji: "🏆", title: "Tabla", subtitle: "Posiciones de la liga", accent: "gold" as const },
  { href: "/estadisticas", emoji: "📈", title: "Estadísticas", subtitle: "Números y gráficos", accent: "cyan" as const },
  { href: "/jugadores", emoji: "👤", title: "Jugadores", subtitle: "Plantel y cartas", accent: "gold" as const },
  { href: "/goleadores", emoji: "🎯", title: "Goleadores", subtitle: "Máximos artilleros", accent: "magenta" as const },
  { href: "/vallas-invictas", emoji: "🧤", title: "Vallas Invictas", subtitle: "Arqueros de fierro", accent: "cyan" as const },
  { href: "/mvp", emoji: "⭐", title: "MVP", subtitle: "Figuras de la fecha", accent: "gold" as const },
  { href: "/historial", emoji: "📅", title: "Historial", subtitle: "Todos los martes", accent: "emerald" as const },
  { href: "/cargadas", emoji: "😂", title: "Cargadas", subtitle: "Mandale una", accent: "magenta" as const },
  { href: "/configuracion", emoji: "⚙", title: "Configuración", subtitle: "Sonido y ajustes", accent: "cyan" as const },
];

const EXTRA_ITEMS = [
  { href: "/premios", emoji: "🏅", title: "Premios", subtitle: "Balón de Oro y más" },
  { href: "/momentos", emoji: "🎥", title: "Momentos", subtitle: "Goles y papelones" },
  { href: "/previa", emoji: "🎙", title: "Previa", subtitle: "Simulá el partido" },
];

export function MainMenu() {
  const { loadAll, hydrated } = useHydrateStore();
  const matches = useAppStore((s) => s.matches);
  const { enabled, toggle } = useSound();
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    loadAll();
    // Clock reads the current time, which only exists client-side (avoids SSR mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [loadAll]);

  const next = matches
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  const countdown = next && now ? formatCountdown(next.date, now) : null;
  const awaitingResult = next && isAwaitingResult(next.date, next.status) ? next : null;

  return (
    <PageShell className="grain">
      <header className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-4 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 -z-10 animate-pulse-glow rounded-full bg-gold/30 blur-xl" />
              <Crest size={54} />
            </div>
            <div>
              <p className="font-hud text-[11px] uppercase tracking-[0.35em] text-ink-faint">
                Temporada 2026
              </p>
              <h1 className="font-display text-2xl uppercase leading-none text-gold-gradient sm:text-3xl">
                {GROUP_NAME}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="hidden rounded-full border border-line bg-white/5 px-3 py-2 font-hud text-[11px] uppercase tracking-wider text-ink-dim transition hover:border-gold/50 hover:text-gold sm:block"
            >
              {enabled ? "🔊 Sonido on" : "🔇 Sonido off"}
            </button>
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/5 text-ink-dim transition hover:border-cyan/60 hover:text-cyan"
              aria-label="Panel de administración"
            >
              <ShieldCheck size={18} />
            </Link>
            <Link
              href="/configuracion"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white/5 text-ink-dim transition hover:border-gold/60 hover:text-gold"
              aria-label="Configuración"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {awaitingResult ? (
          <Link href={`/historial/detalle?id=${awaitingResult.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold/50 bg-gold/10 px-5 py-3 transition hover:border-gold/70"
            >
              <div className="flex items-center gap-3">
                <AlertCircle size={18} className="shrink-0 text-gold" />
                <span className="font-hud text-xs uppercase tracking-[0.2em] text-gold">
                  Falta cargar el resultado · {awaitingResult.teamAName} vs {awaitingResult.teamBName}
                </span>
              </div>
              <span className="font-display text-lg tracking-wide text-gold">
                Completar →
              </span>
            </motion.div>
          </Link>
        ) : (
          next && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line px-5 py-3"
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald" />
                </span>
                <span className="font-hud text-xs uppercase tracking-[0.2em] text-ink-dim">
                  Próximo partido · {next.teamAName} vs {next.teamBName}
                </span>
              </div>
              <span className="font-display text-lg tracking-wide text-cyan text-glow-cyan">
                {countdown}
              </span>
            </motion.div>
          )
        )}
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MENU_ITEMS.map((item, i) => (
            <PanelCard key={item.href} index={i} {...item} />
          ))}
        </div>

        <div className="mt-8">
          <p className="mb-3 font-hud text-xs uppercase tracking-[0.3em] text-ink-faint">
            Extras
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {EXTRA_ITEMS.map((item, i) => (
              <PanelCard key={item.href} index={i} accent="gold" {...item} />
            ))}
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center sm:px-6">
        <p className="font-hud text-[11px] uppercase tracking-[0.3em] text-ink-faint">
          {hydrated ? "" : "Cargando datos…"}
        </p>
      </footer>
    </PageShell>
  );
}

function formatCountdown(dateIso: string, now: Date) {
  const target = matchDateTime(dateIso);
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "¡Es hoy!";
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  if (days > 0) return `Faltan ${days}d ${hours}h`;
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  return `Faltan ${hours}h ${minutes}m`;
}
