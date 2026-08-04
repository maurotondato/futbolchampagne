"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { RankingList } from "@/components/stats/RankingList";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";

export default function GoleadoresPage() {
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
        .filter((s) => s.goals > 0)
        .sort((a, b) => b.goals - a.goals)
        .map((s) => ({ player: s.player, value: s.goals, caption: `${s.assists} asistencias · ${s.played} PJ` })),
    [players, matches]
  );

  return (
    <PageShell>
      <TopBar title="Goleadores" subtitle="Máximos artilleros" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-2xl px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : (
          <RankingList rows={rows} valueLabel="Goles" />
        )}
      </div>
    </PageShell>
  );
}
