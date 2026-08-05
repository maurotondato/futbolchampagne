"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Shuffle, Eraser, Pencil } from "lucide-react";
import { Pitch } from "./Pitch";
import { SlotCard } from "./SlotCard";
import { SlotPicker } from "./SlotPicker";
import { ShareFormationButton } from "./ShareFormationButton";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { FORMATION_SLOTS, slotCoords } from "@/lib/formation";
import { nextMatchISODate } from "@/lib/matchDay";
import type { SlotCode } from "@/lib/data/types";

export function TeamBuilder() {
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);
  const setLineupSlot = useAppStore((s) => s.setLineupSlot);
  const removeLineupSlot = useAppStore((s) => s.removeLineupSlot);
  const clearLineup = useAppStore((s) => s.clearLineup);
  const updateMatch = useAppStore((s) => s.updateMatch);

  const [editingNames, setEditingNames] = useState(false);
  const [picker, setPicker] = useState<{ team: "A" | "B"; slot: SlotCode } | null>(null);
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
      date: nextMatchISODate(),
      teamAName: "Equipo Rojo",
      teamBName: "Equipo Azul",
      teamAScore: null,
      teamBScore: null,
      status: "scheduled",
    }).finally(() => {
      creatingRef.current = false;
    });
  }, [hydrated, match, addMatch]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const activeCount = players.filter((p) => p.active).length;
  const placedCount = match?.lineup.length ?? 0;

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

    function assign(team: "A" | "B", pool: typeof players) {
      const used = new Set<number>();
      const leftovers: typeof pool = [];
      const picks: typeof pool = [];
      pool.forEach((player) => {
        const idx = FORMATION_SLOTS.findIndex(
          (s, i) => s.pos === player.favoritePosition && !used.has(i)
        );
        if (idx !== -1) {
          used.add(idx);
          picks[idx] = player;
        } else {
          leftovers.push(player);
        }
      });
      const freeSlots = FORMATION_SLOTS.map((_, i) => i).filter((i) => !used.has(i));
      leftovers.forEach((player, k) => {
        const idx = freeSlots[k];
        if (idx === undefined) return;
        picks[idx] = player;
      });
      FORMATION_SLOTS.forEach((slotDef, i) => {
        const player = picks[i];
        if (player) setLineupSlot(matchId, { playerId: player.id, team, slot: slotDef.code });
      });
    }

    assign("A", pool.slice(0, 7));
    assign("B", pool.slice(7, 14));
  }

  const occupiedIds = new Set(match.lineup.map((l) => l.playerId));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {editingNames ? (
            <div className="flex items-center gap-2">
              <input
                defaultValue={match.teamAName}
                onBlur={(e) => updateMatch(match.id, { teamAName: e.target.value })}
                className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-team-a outline-none focus:border-team-a/60"
              />
              <span className="text-ink-faint">vs</span>
              <input
                defaultValue={match.teamBName}
                onBlur={(e) => updateMatch(match.id, { teamBName: e.target.value })}
                className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-team-b outline-none focus:border-team-b/60"
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
              <span className="text-team-a">{match.teamAName}</span>
              <span className="text-ink-faint">vs</span>
              <span className="text-team-b">{match.teamBName}</span>
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

      <GlassPanel className="mb-4 p-3 text-center">
        <p className="font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
          Tocá cualquier posición para asignar un jugador · {placedCount}/14 ubicados · {activeCount} en el plantel
        </p>
      </GlassPanel>

      <div className="mx-auto max-w-md sm:max-w-lg">
        <Pitch>
          {(["A", "B"] as const).flatMap((team) =>
            FORMATION_SLOTS.map((slotDef) => {
              const entry = match.lineup.find((l) => l.team === team && l.slot === slotDef.code);
              const player = entry ? byId.get(entry.playerId) : undefined;
              const { x, y } = slotCoords(slotDef.code, team);
              return (
                <SlotCard
                  key={`${team}-${slotDef.code}`}
                  x={x}
                  y={y}
                  team={team}
                  label={slotDef.label}
                  player={player}
                  onClick={() => setPicker({ team, slot: slotDef.code })}
                />
              );
            })
          )}
        </Pitch>
      </div>

      {picker && (
        <SlotPicker
          open={!!picker}
          onClose={() => setPicker(null)}
          slotCode={picker.slot}
          team={picker.team}
          players={players}
          occupiedIds={occupiedIds}
          currentPlayerId={
            match.lineup.find((l) => l.team === picker.team && l.slot === picker.slot)?.playerId
          }
          onSelect={(playerId) => {
            setLineupSlot(match.id, { playerId, team: picker.team, slot: picker.slot });
            setPicker(null);
          }}
          onClear={() => {
            const entry = match.lineup.find((l) => l.team === picker.team && l.slot === picker.slot);
            if (entry) removeLineupSlot(match.id, entry.playerId);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
