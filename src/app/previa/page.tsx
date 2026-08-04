"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Mic, Sparkles } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";
import { generatePreview, type PreviaResult } from "@/lib/previa";

export default function PreviaPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const [result, setResult] = useState<PreviaResult | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const summaries = useMemo(() => computePlayerSummaries(players, matches), [players, matches]);

  const match = useMemo(
    () =>
      matches
        .filter((m) => m.status === "scheduled" && m.lineup.length > 0)
        .sort((a, b) => a.date.localeCompare(b.date))[0],
    [matches]
  );

  function simulate() {
    if (!match) return;
    setResult(generatePreview(match, players, summaries));
  }

  return (
    <PageShell>
      <TopBar title="Previa" subtitle="Al estilo transmisión oficial" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : !match ? (
          <p className="py-16 text-center font-hud text-ink-faint">
            Armá la formación del próximo partido en &ldquo;Armar Partido&rdquo; para poder simular la previa.
          </p>
        ) : (
          <>
            <GlassPanel className="flex flex-col items-center gap-4 p-6 text-center">
              <p className="font-hud text-xs uppercase tracking-[0.3em] text-ink-faint">
                {match.teamAName} vs {match.teamBName}
              </p>
              <GlowButton variant="gold" onClick={simulate} className="flex items-center gap-2">
                <Sparkles size={16} /> Simular previa
              </GlowButton>
            </GlassPanel>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <GlassPanel className="p-6">
                    <p className="mb-4 text-center font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                      Probabilidad de victoria
                    </p>
                    <div className="flex items-center justify-between font-display text-3xl">
                      <span className="text-gold">{result.probA}%</span>
                      <span className="text-sm text-ink-faint">vs</span>
                      <span className="text-cyan">{result.probB}%</span>
                    </div>
                    <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-white/5">
                      <motion.div
                        className="h-full bg-gradient-to-r from-gold-dim to-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.probA}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan to-cyan-bright"
                        initial={{ width: 0 }}
                        animate={{ width: `${result.probB}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between font-hud text-xs text-ink-faint">
                      <span>{match.teamAName}</span>
                      <span>{match.teamBName}</span>
                    </div>
                  </GlassPanel>

                  <GlassPanel className="p-6 text-center">
                    <p className="mb-2 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                      Predicción de resultado
                    </p>
                    <p className="font-display text-5xl text-ink">
                      {result.predictedA} <span className="text-ink-faint">-</span> {result.predictedB}
                    </p>
                  </GlassPanel>

                  <div className="grid grid-cols-2 gap-4">
                    <KeyPlayerCard label="Jugador clave" team={match.teamAName} player={result.keyPlayerA} color="text-gold" />
                    <KeyPlayerCard label="Jugador clave" team={match.teamBName} player={result.keyPlayerB} color="text-cyan" />
                  </div>

                  {result.duel && (
                    <GlassPanel className="p-6">
                      <p className="mb-4 text-center font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                        Duelo destacado
                      </p>
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex flex-col items-center gap-1">
                          <PlayerAvatar player={result.duel[0]} size={56} ring="border-gold" />
                          <span className="font-hud text-xs text-ink">{result.duel[0].nickname || result.duel[0].name}</span>
                        </div>
                        <span className="font-display text-2xl text-ink-faint">VS</span>
                        <div className="flex flex-col items-center gap-1">
                          <PlayerAvatar player={result.duel[1]} size={56} ring="border-cyan" />
                          <span className="font-hud text-xs text-ink">{result.duel[1].nickname || result.duel[1].name}</span>
                        </div>
                      </div>
                    </GlassPanel>
                  )}

                  <GlassPanel className="p-6">
                    <p className="mb-3 flex items-center gap-2 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                      <Mic size={14} /> Comentario del relator
                    </p>
                    <div className="space-y-2">
                      {result.commentary.map((line, i) => (
                        <motion.p
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.25 }}
                          className="font-hud text-sm italic text-ink-dim"
                        >
                          &ldquo;{line}&rdquo;
                        </motion.p>
                      ))}
                    </div>
                  </GlassPanel>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </PageShell>
  );
}

function KeyPlayerCard({
  label,
  team,
  player,
  color,
}: {
  label: string;
  team: string;
  player?: { id: string; name: string; nickname?: string; photoUrl?: string | null };
  color: string;
}) {
  return (
    <GlassPanel className="flex flex-col items-center gap-2 p-4 text-center">
      <p className={`font-hud text-[10px] uppercase tracking-wide ${color}`}>{team}</p>
      {player ? (
        <>
          <PlayerAvatar player={player} size={48} />
          <p className="font-hud text-sm text-ink">{player.nickname || player.name}</p>
        </>
      ) : (
        <p className="font-hud text-xs text-ink-faint">Sin datos</p>
      )}
      <p className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">{label}</p>
    </GlassPanel>
  );
}
