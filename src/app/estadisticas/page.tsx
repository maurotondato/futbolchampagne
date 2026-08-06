"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { StatTile } from "@/components/stats/StatTile";
import { GoalsBarChart } from "@/components/stats/charts/GoalsBarChart";
import { WdlChart } from "@/components/stats/charts/WdlChart";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";
import { average } from "@/lib/utils";

export default function EstadisticasPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const summaries = useMemo(() => computePlayerSummaries(players, matches), [players, matches]);
  const played = useMemo(() => matches.filter((m) => m.status === "played"), [matches]);

  const topScorers = summaries
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 8)
    .map((s) => ({ name: s.player.nickname || s.player.name.split(" ")[0], value: s.goals }));

  const eloRanking = [...summaries]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 8)
    .map((s) => ({ name: s.player.nickname || s.player.name.split(" ")[0], value: s.elo }));

  const wdl = [...summaries]
    .filter((s) => s.played > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 6)
    .map((s) => ({
      name: s.player.nickname || s.player.name.split(" ")[0],
      Victorias: s.wins,
      Empates: s.draws,
      Derrotas: s.losses,
    }));

  const totalGoals = played.reduce((acc, m) => acc + (m.teamAScore ?? 0) + (m.teamBScore ?? 0), 0);
  const avgGoalsPerMatch = played.length ? (totalGoals / played.length).toFixed(1) : "0";
  const bestStreak = Math.max(0, ...summaries.map((s) => s.winStreak));
  const worstStreak = Math.max(0, ...summaries.map((s) => s.loseStreak));
  const mostMinutes = [...summaries].sort((a, b) => b.minutesPlayed - a.minutesPlayed)[0];
  const avgRatingGlobal = average(summaries.filter((s) => s.played > 0).map((s) => s.avgRating));

  return (
    <PageShell>
      <TopBar title="Estadísticas" subtitle="Números y gráficos de la liga" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : played.length === 0 ? (
          <p className="py-16 text-center font-hud text-ink-faint">
            Cuando se juegue el primer partido, estas estadísticas se arman solas.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatTile label="Partidos jugados" value={played.length} />
              <StatTile label="Goles totales" value={totalGoals} accent="cyan" />
              <StatTile label="Prom. goles / partido" value={avgGoalsPerMatch} />
              <StatTile label="Promedio de notas" value={avgRatingGlobal.toFixed(1)} accent="cyan" />
              <StatTile label="Racha ganadora récord" value={bestStreak} suffix="W" />
              <StatTile label="Racha negativa récord" value={worstStreak} suffix="L" />
              <StatTile label="Más minutos" value={mostMinutes?.player.nickname || mostMinutes?.player.name.split(" ")[0] || "—"} />
            </div>

            <GlassPanel className="p-5">
              <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                Goleadores
              </p>
              <GoalsBarChart data={topScorers} label="Goles" />
            </GlassPanel>

            <GlassPanel className="p-5">
              <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                Ranking ELO
              </p>
              <GoalsBarChart data={eloRanking} label="Puntos ELO" />
            </GlassPanel>

            <GlassPanel className="p-5">
              <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                Victorias / Empates / Derrotas — Top 6
              </p>
              <WdlChart data={wdl} />
            </GlassPanel>
          </>
        )}
      </div>
    </PageShell>
  );
}
