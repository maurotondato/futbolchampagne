"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Shuffle, Eraser, Pencil } from "lucide-react";
import { Pitch } from "./Pitch";
import { PlayerToken } from "./PlayerToken";
import { BenchChip } from "./BenchChip";
import { ShareFormationButton } from "./ShareFormationButton";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { FORMATION_7, mirrorY } from "@/lib/formation";

export function TeamBuilder() {
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);
  const setLineupSlot = useAppStore((s) => s.setLineupSlot);
  const removeLineupSlot = useAppStore((s) => s.removeLineupSlot);
  const clearLineup = useAppStore((s) => s.clearLineup);
  const updateMatch = useAppStore((s) => s.updateMatch);

  const pitchRef = useRef<HTMLDivElement>(null);
  const [pendingTeam, setPendingTeam] = useState<Record<string, "A" | "B">>({});
  const [editingNames, setEditingNames] = useState(false);
  const creatingRef = useRef(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const match = [...matches]
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  useEffect(() => {
    if (!hydrated || match || creatingRef.current) return;
    creatingRef.current = true;
    addMatch({
      date: new Date().toISOString().slice(0, 10),
      teamAName: "Equipo Champagne",
      teamBName: "Equipo Fernet",
      teamAScore: null,
      teamBScore: null,
      status: "scheduled",
    }).finally(() => {
      creatingRef.current = false;
    });
  }, [hydrated, match, addMatch]);

  const placedIds = useMemo(
    () => new Set(match?.lineup.map((l) => l.playerId) ?? []),
    [match]
  );
  const bench = players.filter((p) => p.active && !placedIds.has(p.id));

  useEffect(() => {
    // Merges newly-benched players into local staging state (which team they'll
    // join when dropped) without clobbering picks the user already toggled.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingTeam((prev) => {
      const next = { ...prev };
      let changed = false;
      bench.forEach((p, i) => {
        if (!next[p.id]) {
          next[p.id] = i % 2 === 0 ? "A" : "B";
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bench.length]);

  if (!hydrated || !match) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-dim font-hud uppercase tracking-widest">
        Cargando cancha…
      </div>
    );
  }

  function handleSortear() {
    if (!match) return;
    const matchId = match.id;
    const pool = players.filter((p) => p.active).sort(() => Math.random() - 0.5);
    const teamA = pool.slice(0, 7);
    const teamB = pool.slice(7, 14);

    function assign(team: typeof teamA, side: "A" | "B") {
      const slots = [...FORMATION_7];
      const used = new Set<number>();
      const byPos = new Map<string, number[]>();
      slots.forEach((s, i) => {
        byPos.set(s.pos, [...(byPos.get(s.pos) ?? []), i]);
      });
      const leftovers: typeof team = [];
      team.forEach((player) => {
        const candidates = byPos.get(player.favoritePosition) ?? [];
        const idx = candidates.find((i) => !used.has(i));
        if (idx !== undefined) {
          used.add(idx);
          const slot = slots[idx];
          const y = side === "A" ? slot.y : mirrorY(slot.y);
          setLineupSlot(matchId, { playerId: player.id, team: side, x: slot.x, y });
        } else {
          leftovers.push(player);
        }
      });
      const freeSlots = slots.map((_, i) => i).filter((i) => !used.has(i));
      leftovers.forEach((player, k) => {
        const idx = freeSlots[k];
        if (idx === undefined) return;
        const slot = slots[idx];
        const y = side === "A" ? slot.y : mirrorY(slot.y);
        setLineupSlot(matchId, { playerId: player.id, team: side, x: slot.x, y });
      });
    }

    assign(teamA, "A");
    assign(teamB, "B");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {editingNames ? (
            <div className="flex items-center gap-2">
              <input
                defaultValue={match.teamAName}
                onBlur={(e) => updateMatch(match.id, { teamAName: e.target.value })}
                className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-gold outline-none focus:border-gold/60"
              />
              <span className="text-ink-faint">vs</span>
              <input
                defaultValue={match.teamBName}
                onBlur={(e) => updateMatch(match.id, { teamBName: e.target.value })}
                className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-cyan outline-none focus:border-cyan/60"
              />
              <button onClick={() => setEditingNames(false)} className="text-xs text-ink-faint underline">
                listo
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingNames(true)}
              className="flex items-center gap-2 font-hud text-sm uppercase tracking-wide text-ink-dim hover:text-ink"
            >
              <span className="text-gold">{match.teamAName}</span>
              <span className="text-ink-faint">vs</span>
              <span className="text-cyan">{match.teamBName}</span>
              <Pencil size={13} className="opacity-50" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <GlowButton variant="ghost" onClick={handleSortear} className="flex items-center gap-2">
            <Shuffle size={15} /> Sortear equipos
          </GlowButton>
          <GlowButton variant="ghost" onClick={() => clearLineup(match.id)} className="flex items-center gap-2">
            <Eraser size={15} /> Vaciar cancha
          </GlowButton>
          <ShareFormationButton match={match} players={players} />
        </div>
      </div>

      <div className="mx-auto max-w-md sm:max-w-lg">
        <Pitch ref={pitchRef}>
          {match.lineup.map((slot) => {
            const player = players.find((p) => p.id === slot.playerId);
            if (!player) return null;
            return (
              <PlayerToken
                key={`${slot.playerId}-${slot.x.toFixed(1)}-${slot.y.toFixed(1)}`}
                player={player}
                x={slot.x}
                y={slot.y}
                team={slot.team}
                pitchRef={pitchRef}
                onMove={(x, y) => setLineupSlot(match.id, { playerId: player.id, team: slot.team, x, y })}
                onRemove={() => removeLineupSlot(match.id, player.id)}
              />
            );
          })}
        </Pitch>
      </div>

      <GlassPanel className="mt-6 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
            Plantel disponible · arrastrá a la cancha
          </p>
          <p className="font-hud text-xs text-ink-faint">{bench.length} sin ubicar</p>
        </div>
        {bench.length === 0 ? (
          <p className="py-6 text-center font-hud text-sm text-ink-faint">
            Ya ubicaste a todo el plantel activo 🍾
          </p>
        ) : (
          <motion.div layout className="flex gap-3 overflow-x-auto pb-2">
            {bench.map((player) => (
              <BenchChip
                key={player.id}
                player={player}
                team={pendingTeam[player.id] ?? "A"}
                onToggleTeam={() =>
                  setPendingTeam((prev) => ({
                    ...prev,
                    [player.id]: prev[player.id] === "A" ? "B" : "A",
                  }))
                }
                pitchRef={pitchRef}
                onPlace={(x, y) =>
                  setLineupSlot(match.id, {
                    playerId: player.id,
                    team: pendingTeam[player.id] ?? "A",
                    x,
                    y,
                  })
                }
              />
            ))}
          </motion.div>
        )}
      </GlassPanel>
    </div>
  );
}
