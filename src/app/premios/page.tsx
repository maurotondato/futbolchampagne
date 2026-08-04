"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Pitch } from "@/components/pitch/Pitch";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";
import { computeIdealXi } from "@/lib/data/idealXi";
import { AWARD_META } from "@/lib/data/awardMeta";
import type { AwardType } from "@/lib/data/types";

const CURRENT_SEASON = new Date().getFullYear().toString();

export default function PremiosPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const awards = useAppStore((s) => s.awards);
  const addAward = useAppStore((s) => s.addAward);
  const deleteAward = useAppStore((s) => s.deleteAward);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const summaries = useMemo(() => computePlayerSummaries(players, matches), [players, matches]);
  const idealXi = useMemo(() => computeIdealXi(summaries), [summaries]);
  const hasIdealXi = idealXi.some((slot) => slot.summary);

  async function assign(type: AwardType, playerId: string, dual?: [string, string]) {
    const existing = awards.find((a) => a.type === type && a.season === CURRENT_SEASON);
    if (existing) await deleteAward(existing.id);
    if (dual) {
      await addAward({ type, season: CURRENT_SEASON, playerIds: dual });
    } else {
      await addAward({ type, season: CURRENT_SEASON, playerId });
    }
  }

  return (
    <PageShell>
      <TopBar title="Premios" subtitle={`Temporada ${CURRENT_SEASON}`} onBack={() => router.push("/")} />
      <div className="mx-auto max-w-5xl space-y-8 px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : (
          <>
            <GlassPanel className="p-5">
              <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                🌟 Equipo ideal / 11 ideal (por promedio de nota)
              </p>
              {!hasIdealXi ? (
                <p className="py-8 text-center font-hud text-sm text-ink-faint">
                  Se arma solo cuando haya partidos jugados con notas cargadas.
                </p>
              ) : (
                <div className="mx-auto max-w-xs">
                  <Pitch>
                    {idealXi.map(
                      ({ slot, summary }, i) =>
                        summary && (
                          <div
                            key={i}
                            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
                            style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                          >
                            <PlayerAvatar player={summary.player} size={44} ring="border-gold ring-2 ring-gold/40" />
                            <span className="rounded bg-black/60 px-1.5 py-0.5 font-hud text-[9px] uppercase text-white">
                              {summary.player.nickname || summary.player.name.split(" ")[0]}
                            </span>
                          </div>
                        )
                    )}
                  </Pitch>
                </div>
              )}
            </GlassPanel>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {AWARD_META.map((meta, i) => (
                <AwardCard
                  key={meta.type}
                  index={i}
                  meta={meta}
                  award={awards.find((a) => a.type === meta.type && a.season === CURRENT_SEASON)}
                  players={players}
                  onAssign={assign}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}

function AwardCard({
  meta,
  award,
  players,
  onAssign,
  index,
}: {
  meta: (typeof AWARD_META)[number];
  award?: { playerId?: string; playerIds?: string[] };
  players: ReturnType<typeof useAppStore.getState>["players"];
  onAssign: (type: AwardType, playerId: string, dual?: [string, string]) => void;
  index: number;
}) {
  const [p1, setP1] = useState(award?.playerIds?.[0] ?? award?.playerId ?? "");
  const [p2, setP2] = useState(award?.playerIds?.[1] ?? "");

  const winner1 = players.find((p) => p.id === (award?.playerIds?.[0] ?? award?.playerId));
  const winner2 = award?.playerIds ? players.find((p) => p.id === award.playerIds![1]) : null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }}>
      <GlassPanel className="p-4">
        <p className="mb-3 flex items-center gap-2 font-hud text-sm font-semibold text-ink">
          <span className="text-xl">{meta.emoji}</span> {meta.label}
        </p>

        {winner1 ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/5 p-2">
            <PlayerAvatar player={winner1} size={32} />
            <span className="font-hud text-sm text-gold">
              {winner1.nickname || winner1.name}
              {winner2 && ` & ${winner2.nickname || winner2.name}`}
            </span>
          </div>
        ) : (
          <p className="mb-3 font-hud text-xs text-ink-faint">Sin definir todavía.</p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={p1}
            onChange={(e) => setP1(e.target.value)}
            className="rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-xs outline-none focus:border-gold/50"
          >
            <option value="" className="bg-panel">Elegir…</option>
            {players.map((p) => (
              <option key={p.id} value={p.id} className="bg-panel">
                {p.nickname || p.name}
              </option>
            ))}
          </select>
          {meta.dual && (
            <select
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              className="rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-xs outline-none focus:border-gold/50"
            >
              <option value="" className="bg-panel">y…</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} className="bg-panel">
                  {p.nickname || p.name}
                </option>
              ))}
            </select>
          )}
          <GlowButton
            variant="ghost"
            className="!px-3 !py-1.5 text-xs"
            disabled={!p1 || (meta.dual && !p2)}
            onClick={() => onAssign(meta.type, p1, meta.dual ? [p1, p2] : undefined)}
          >
            Asignar
          </GlowButton>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
