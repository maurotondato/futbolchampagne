"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, ChevronRight } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function HistorialPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  async function handleNew() {
    const m = await addMatch({
      date: new Date().toISOString().slice(0, 10),
      teamAName: "Equipo Champagne",
      teamBName: "Equipo Fernet",
      teamAScore: null,
      teamBScore: null,
      status: "scheduled",
    });
    router.push(`/historial/${m.id}`);
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
        ) : sorted.length === 0 ? (
          <p className="py-16 text-center font-hud text-ink-faint">Todavía no hay partidos cargados.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Link href={`/historial/${m.id}`}>
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
                          m.status === "played" ? "bg-emerald/15 text-emerald" : "bg-cyan/15 text-cyan"
                        )}
                      >
                        {m.status === "played" ? `${m.teamAScore} - ${m.teamBScore}` : "Pendiente"}
                      </span>
                      <ChevronRight size={16} className="text-ink-faint" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
