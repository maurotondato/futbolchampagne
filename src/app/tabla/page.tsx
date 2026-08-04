"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";

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
          <div className="overflow-x-auto rounded-2xl border border-line">
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
        )}
      </div>
    </PageShell>
  );
}
