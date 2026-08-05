"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ChevronRight, AlertCircle, Trash2 } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { nextMatchISODate, isAwaitingResult } from "@/lib/matchDay";

export default function HistorialPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);
  const deleteMatch = useAppStore((s) => s.deleteMatch);

  function handleDelete(id: string, dateLabel: string) {
    if (confirm(`¿Borrar el partido del ${dateLabel}? No se puede deshacer.`)) {
      deleteMatch(id);
    }
  }

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));
  const awaitingResult = sorted.find((m) => isAwaitingResult(m.date, m.status));

  async function handleNew() {
    const m = await addMatch({
      date: nextMatchISODate(),
      teamAName: "Equipo Rojo",
      teamBName: "Equipo Azul",
      teamAScore: null,
      teamBScore: null,
      status: "scheduled",
    });
    router.push(`/historial/detalle?id=${m.id}`);
  }

  return (
    <PageShell>
      <TopBar
        title="Historial"
        subtitle="Todos los martes"
        onBack={() => router.push("/")}
        right={
          <GlowButton variant="gold" onClick={handleNew} className="flex items-center gap-2">
            <Plus size={15} /> Nuevo
          </GlowButton>
        }
      />
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : (
          <>
            {awaitingResult && (
              <Link href={`/historial/detalle?id=${awaitingResult.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-3 rounded-xl border border-gold/50 bg-gold/10 p-4 transition hover:border-gold/70"
                >
                  <AlertCircle size={20} className="shrink-0 text-gold" />
                  <div className="min-w-0 flex-1">
                    <p className="font-hud text-sm font-semibold text-gold">
                      Falta cargar el resultado del {formatDate(awaitingResult.date)}
                    </p>
                    <p className="font-hud text-xs text-ink-faint">
                      {awaitingResult.teamAName} vs {awaitingResult.teamBName} · Tocá para completar goles y notas
                    </p>
                  </div>
                  <ChevronRight size={16} className="shrink-0 text-gold" />
                </motion.div>
              </Link>
            )}

            {sorted.length === 0 ? (
              <p className="py-16 text-center font-hud text-ink-faint">Todavía no hay partidos cargados.</p>
            ) : (
              <div className="space-y-2">
                {sorted.map((m, i) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-2"
                  >
                    <Link href={`/historial/detalle?id=${m.id}`} className="min-w-0 flex-1">
                      <div className="glass flex items-center justify-between gap-3 rounded-xl border border-line p-4 transition hover:border-gold/50">
                        <div className="min-w-0">
                          <p className="truncate font-hud text-sm font-semibold text-ink">
                            {m.teamAName} <span className="text-ink-faint">vs</span> {m.teamBName}
                          </p>
                          <p className="font-hud text-[11px] uppercase tracking-wide text-ink-faint">
                            {formatDate(m.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={cn(
                              "rounded-full px-3 py-1 font-hud text-xs uppercase tracking-wide",
                              m.status === "played"
                                ? "bg-emerald/15 text-emerald"
                                : isAwaitingResult(m.date, m.status)
                                  ? "bg-gold/15 text-gold"
                                  : "bg-cyan/15 text-cyan"
                            )}
                          >
                            {m.status === "played"
                              ? `${m.teamAScore} - ${m.teamBScore}`
                              : isAwaitingResult(m.date, m.status)
                                ? "Falta cargar"
                                : "Programado"}
                          </span>
                          <ChevronRight size={16} className="text-ink-faint" />
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDelete(m.id, formatDate(m.date))}
                      aria-label="Borrar partido"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line bg-white/5 text-ink-faint transition hover:border-magenta/60 hover:text-magenta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
