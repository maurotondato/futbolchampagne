"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Shuffle, Eraser, Pencil, Save } from "lucide-react";
import { Pitch } from "./Pitch";
import { SlotCard } from "./SlotCard";
import { SlotPicker } from "./SlotPicker";
import { ShareFormationButton } from "./ShareFormationButton";
import { GlowButton } from "@/components/ui/GlowButton";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { FORMATION_SLOTS, slotCoords } from "@/lib/formation";
import { nextMatchISODate } from "@/lib/matchDay";
import type { LineupSlot, Match, SlotCode } from "@/lib/data/types";

const DEFAULT_TEAM_A = "Equipo Rojo";
const DEFAULT_TEAM_B = "Equipo Azul";

export function TeamBuilder() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);
  const setLineupSlot = useAppStore((s) => s.setLineupSlot);
  const clearLineup = useAppStore((s) => s.clearLineup);
  const updateMatch = useAppStore((s) => s.updateMatch);

  const [editingNames, setEditingNames] = useState(false);
  const [picker, setPicker] = useState<{ team: "A" | "B"; slot: SlotCode } | null>(null);
  const [draftNames, setDraftNames] = useState({ a: DEFAULT_TEAM_A, b: DEFAULT_TEAM_B });
  // Everything below lives only in local state until Guardar / Compartir y
  // guardar is pressed — nothing touches the store (and so nothing shows up
  // in historial) just from placing players or opening this screen.
  const [draftLineup, setDraftLineup] = useState<LineupSlot[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const seededRef = useRef(false);
  const ensureMatchRef = useRef<Promise<Match> | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const match = [...matches]
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  // Seed the draft from an already-saved formation exactly once (editing an
  // existing scheduled match) — later store updates (e.g. our own save)
  // must not clobber in-progress edits.
  useEffect(() => {
    if (!hydrated || seededRef.current || !match) return;
    seededRef.current = true;
    setDraftLineup(match.lineup);
    setDraftNames({ a: match.teamAName, b: match.teamBName });
  }, [hydrated, match]);

  function ensureMatch(): Promise<Match> {
    if (match) return Promise.resolve(match);
    if (!ensureMatchRef.current) {
      ensureMatchRef.current = addMatch({
        date: nextMatchISODate(),
        teamAName: draftNames.a,
        teamBName: draftNames.b,
        teamAScore: null,
        teamBScore: null,
        status: "scheduled",
      });
    }
    return ensureMatchRef.current;
  }

  async function commitDraft(): Promise<Match> {
    const activeMatch = await ensureMatch();
    if (activeMatch.teamAName !== draftNames.a || activeMatch.teamBName !== draftNames.b) {
      await updateMatch(activeMatch.id, { teamAName: draftNames.a, teamBName: draftNames.b });
    }
    // Replace the persisted lineup wholesale so it exactly matches the
    // draft, regardless of what was saved (or not) before.
    await clearLineup(activeMatch.id);
    await Promise.all(draftLineup.map((slot) => setLineupSlot(activeMatch.id, slot)));
    return { ...activeMatch, teamAName: draftNames.a, teamBName: draftNames.b, lineup: draftLineup };
  }

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const activeCount = players.filter((p) => p.active).length;
  const placedCount = draftLineup.length;

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-ink-dim font-hud uppercase tracking-widest">
        Cargando cancha…
      </div>
    );
  }

  function handleTeamNameChange(team: "A" | "B", value: string) {
    if (!value.trim()) return;
    setDraftNames((prev) => ({ ...prev, [team === "A" ? "a" : "b"]: value }));
    setSaved(false);
  }

  async function handleGuardar() {
    setSaving(true);
    try {
      await commitDraft();
      setSaved(true);
      router.push("/historial");
    } finally {
      setSaving(false);
    }
  }

  async function handleShareAndSave() {
    await commitDraft();
    setSaved(true);
  }

  function handleSortear() {
    const pool = players.filter((p) => p.active).sort(() => Math.random() - 0.5);
    const next: LineupSlot[] = [];

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
        if (player) next.push({ playerId: player.id, team, slot: slotDef.code });
      });
    }

    assign("A", pool.slice(0, 7));
    assign("B", pool.slice(7, 14));
    setDraftLineup(next);
    setSaved(false);
  }

  const occupiedIds = new Set(draftLineup.map((l) => l.playerId));
  const draftMatch: Match = {
    id: match?.id ?? "draft",
    date: match?.date ?? nextMatchISODate(),
    teamAName: draftNames.a,
    teamBName: draftNames.b,
    teamAScore: match?.teamAScore ?? null,
    teamBScore: match?.teamBScore ?? null,
    status: match?.status ?? "scheduled",
    mvpPlayerId: match?.mvpPlayerId ?? null,
    lineup: draftLineup,
    stats: match?.stats ?? [],
    media: match?.media ?? [],
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {editingNames ? (
            <div className="flex items-center gap-2">
              <input
                defaultValue={draftNames.a}
                onBlur={(e) => handleTeamNameChange("A", e.target.value)}
                className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-team-a outline-none focus:border-team-a/60"
              />
              <span className="text-ink-faint">vs</span>
              <input
                defaultValue={draftNames.b}
                onBlur={(e) => handleTeamNameChange("B", e.target.value)}
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
              <span className="text-team-a">{draftNames.a}</span>
              <span className="text-ink-faint">vs</span>
              <span className="text-team-b">{draftNames.b}</span>
              <Pencil size={13} className="opacity-50" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <GlowButton variant="ghost" onClick={handleSortear} className="flex items-center gap-2">
            <Shuffle size={15} /> Sortear equipos
          </GlowButton>
          <GlowButton
            variant="ghost"
            onClick={() => {
              setDraftLineup([]);
              setSaved(false);
            }}
            className="flex items-center gap-2"
          >
            <Eraser size={15} /> Vaciar cancha
          </GlowButton>
          <GlowButton variant="cyan" onClick={handleGuardar} disabled={saving} className="flex items-center gap-2">
            <Save size={15} /> {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
          </GlowButton>
          <ShareFormationButton match={draftMatch} players={players} onBeforeShare={handleShareAndSave} />
        </div>
      </div>

      <GlassPanel className="mb-4 p-3 text-center">
        <p className="font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
          Tocá cualquier posición para asignar un jugador · {placedCount}/14 ubicados · {activeCount} en el plantel
          · No se guarda hasta que apretás Guardar
        </p>
      </GlassPanel>

      <div className="mx-auto max-w-md sm:max-w-lg">
        <Pitch>
          {(["A", "B"] as const).flatMap((team) =>
            FORMATION_SLOTS.map((slotDef) => {
              const entry = draftLineup.find((l) => l.team === team && l.slot === slotDef.code);
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
            draftLineup.find((l) => l.team === picker.team && l.slot === picker.slot)?.playerId
          }
          onSelect={(playerId) => {
            setDraftLineup((prev) => [
              ...prev.filter((l) => !(l.team === picker.team && l.slot === picker.slot)),
              { playerId, team: picker.team, slot: picker.slot },
            ]);
            setSaved(false);
            setPicker(null);
          }}
          onClear={() => {
            setDraftLineup((prev) => prev.filter((l) => !(l.team === picker.team && l.slot === picker.slot)));
            setSaved(false);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}
