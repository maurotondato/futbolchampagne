"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";
import { cn } from "@/lib/utils";

export default function TablaPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const rows = useMemo(
    () =>
      computePlayerSummaries(players, matches)
        .filter((s) => s.played > 0)
        .sort((a, b) => b.points - a.points || b.goals - a.goals || a.played - b.played),
    [players, matches]
  );

  return (
    <PageShell>
      <TopBar title="Tabla" subtitle="Posiciones individuales de la liga" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center font-hud text-ink-faint">
            Todavía no se jugó ningún partido. Arrancá el próximo martes y esta tabla se llena sola.
          </p>
        ) : (
          <>
            {/* Tarjetas — celular */}
            <div className="space-y-2 sm:hidden">
              {rows.map((r, i) => (
                <motion.div
                  key={r.player.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  className={cn(
                    "glass rounded-xl border border-line p-3",
                    i === 0 && "border-gold/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 shrink-0 text-center font-display text-lg text-ink-faint">
                      {i + 1}
                    </span>
                    <PlayerAvatar player={r.player} size={38} />
                    <span className="min-w-0 flex-1 truncate font-hud text-sm font-semibold text-ink">
                      {r.player.nickname || r.player.name}
                    </span>
                    <div className="text-right">
                      <span className="font-display text-2xl text-gold">{r.points}</span>
                      <p className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">Pts</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-6 gap-1 border-t border-line pt-2.5 text-center">
                    <MiniStat label="PJ" value={r.played} />
                    <MiniStat label="G" value={r.wins} className="text-emerald" />
                    <MiniStat label="E" value={r.draws} />
                    <MiniStat label="P" value={r.losses} className="text-magenta" />
                    <MiniStat label="GF" value={r.goals} />
                    <MiniStat label="Prom" value={r.avgRating.toFixed(1)} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Tabla — desde tablet */}
            <div className="hidden overflow-x-auto rounded-2xl border border-line sm:block">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-white/5 font-hud text-[11px] uppercase tracking-wider text-ink-faint">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Jugador</th>
                    <th className="px-3 py-3 text-center">PJ</th>
                    <th className="px-3 py-3 text-center">G</th>
                    <th className="px-3 py-3 text-center">E</th>
                    <th className="px-3 py-3 text-center">P</th>
                    <th className="px-3 py-3 text-center">GF</th>
                    <th className="px-3 py-3 text-center">Prom</th>
                    <th className="px-4 py-3 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr
                      key={r.player.id}
                      className="border-b border-line/60 font-hud text-sm text-ink transition hover:bg-white/5"
                    >
                      <td className="px-4 py-3 text-ink-faint">{i + 1}</td>
                      <td className="px-4 py-3 font-semibold">
                        {r.player.nickname || r.player.name}
                      </td>
                      <td className="px-3 py-3 text-center text-ink-dim">{r.played}</td>
                      <td className="px-3 py-3 text-center text-emerald">{r.wins}</td>
                      <td className="px-3 py-3 text-center text-ink-dim">{r.draws}</td>
                      <td className="px-3 py-3 text-center text-magenta">{r.losses}</td>
                      <td className="px-3 py-3 text-center text-ink-dim">{r.goals}</td>
                      <td className="px-3 py-3 text-center text-ink-dim">{r.avgRating.toFixed(1)}</td>
                      <td className="px-4 py-3 text-right font-display text-lg text-gold">{r.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div>
      <p className={cn("font-hud text-sm font-semibold text-ink-dim", className)}>{value}</p>
      <p className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}
