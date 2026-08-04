"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Save } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useAppStore } from "@/store/appStore";
import type { Match, Player, PlayerMatchStat } from "@/lib/data/types";
import { cn } from "@/lib/utils";

type Draft = Record<string, PlayerMatchStat>;

function defaultStat(playerId: string, team: "A" | "B", existing?: PlayerMatchStat): PlayerMatchStat {
  return (
    existing ?? {
      playerId,
      team,
      goals: 0,
      assists: 0,
      yellowCards: 0,
      redCards: 0,
      saves: 0,
      errors: 0,
      rating: 6,
      isMvp: false,
      isGoalkeeper: false,
      minutesLate: 0,
    }
  );
}

export function MatchStatsForm({
  match,
  participants,
}: {
  match: Match;
  participants: { player: Player; team: "A" | "B" }[];
}) {
  const updateMatch = useAppStore((s) => s.updateMatch);
  const upsertStat = useAppStore((s) => s.upsertStat);

  const [scoreA, setScoreA] = useState(match.teamAScore ?? 0);
  const [scoreB, setScoreB] = useState(match.teamBScore ?? 0);
  const [comments, setComments] = useState(match.comments ?? "");
  const [mvpId, setMvpId] = useState(match.mvpPlayerId ?? "");
  const [draft, setDraft] = useState<Draft>(() => {
    const initial: Draft = {};
    participants.forEach(({ player, team }) => {
      const existing = match.stats.find((s) => s.playerId === player.id);
      initial[player.id] = defaultStat(player.id, team, existing);
    });
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(playerId: string, patch: Partial<PlayerMatchStat>) {
    setDraft((prev) => ({ ...prev, [playerId]: { ...prev[playerId], ...patch } }));
  }

  async function handleSave() {
    setSaving(true);
    await updateMatch(match.id, {
      teamAScore: scoreA,
      teamBScore: scoreB,
      status: "played",
      comments,
      mvpPlayerId: mvpId || null,
    });
    for (const { player } of participants) {
      const stat = draft[player.id];
      await upsertStat(match.id, { ...stat, isMvp: player.id === mvpId });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="glass flex items-center justify-center gap-6 rounded-2xl border border-line p-6">
        <TeamScore label={match.teamAName} value={scoreA} onChange={setScoreA} color="text-gold" />
        <span className="font-display text-3xl text-ink-faint">—</span>
        <TeamScore label={match.teamBName} value={scoreB} onChange={setScoreB} color="text-cyan" />
      </div>

      {/* Tarjetas — celular: una tarjeta compacta por jugador, sin scroll horizontal */}
      <div className="space-y-3 sm:hidden">
        {participants.map(({ player, team }) => {
          const stat = draft[player.id];
          const isMvp = mvpId === player.id;
          return (
            <div
              key={player.id}
              className={cn(
                "glass rounded-2xl border p-3",
                isMvp ? "border-gold/60" : "border-line"
              )}
            >
              <div className="mb-3 flex items-center gap-2.5">
                <PlayerAvatar
                  player={player}
                  size={38}
                  ring={team === "A" ? "border-gold/60" : "border-cyan/60"}
                />
                <span className="min-w-0 flex-1 truncate font-hud text-sm font-semibold text-ink">
                  {player.nickname || player.name.split(" ")[0]}
                </span>
                <button
                  onClick={() => setMvpId(player.id)}
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                    isMvp ? "border-gold bg-gold/20 text-gold" : "border-line text-ink-faint"
                  )}
                  aria-label="Marcar MVP"
                >
                  <Star size={16} fill={isMvp ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <MiniField label="⚽ Gol" value={stat.goals} onChange={(v) => update(player.id, { goals: v })} />
                <MiniField label="🅰️ Asist" value={stat.assists} onChange={(v) => update(player.id, { assists: v })} />
                <MiniField label="🟨 Am." value={stat.yellowCards} max={2} onChange={(v) => update(player.id, { yellowCards: v })} />
                <MiniField label="🟥 Roja" value={stat.redCards} max={1} onChange={(v) => update(player.id, { redCards: v })} />
                <MiniField label="Ataj" value={stat.saves} disabled={!stat.isGoalkeeper} onChange={(v) => update(player.id, { saves: v })} />
                <MiniField label="Error" value={stat.errors} onChange={(v) => update(player.id, { errors: v })} />
                <MiniField label="Tarde" value={stat.minutesLate} onChange={(v) => update(player.id, { minutesLate: v })} />
                <MiniField
                  label="Nota"
                  value={stat.rating}
                  step={0.5}
                  min={1}
                  max={10}
                  gold
                  onChange={(v) => update(player.id, { rating: v })}
                />
              </div>

              <label className="mt-3 flex items-center gap-2 font-hud text-xs text-ink-faint">
                <input
                  type="checkbox"
                  checked={stat.isGoalkeeper}
                  onChange={(e) => update(player.id, { isGoalkeeper: e.target.checked })}
                  className="h-4 w-4 accent-cyan"
                />
                🧤 Jugó de arquero
              </label>
            </div>
          );
        })}
      </div>

      {/* Tabla — desde tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line sm:block">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-white/5 font-hud text-[10px] uppercase tracking-wider text-ink-faint">
              <th className="px-3 py-2">Jugador</th>
              <th className="px-2 py-2 text-center">⚽</th>
              <th className="px-2 py-2 text-center">🅰️</th>
              <th className="px-2 py-2 text-center">🟨</th>
              <th className="px-2 py-2 text-center">🟥</th>
              <th className="px-2 py-2 text-center">Ataj</th>
              <th className="px-2 py-2 text-center">Err</th>
              <th className="px-2 py-2 text-center">Tarde</th>
              <th className="px-2 py-2 text-center">🧤</th>
              <th className="px-2 py-2 text-center">Nota</th>
              <th className="px-2 py-2 text-center">⭐ MVP</th>
            </tr>
          </thead>
          <tbody>
            {participants.map(({ player, team }) => {
              const stat = draft[player.id];
              return (
                <tr key={player.id} className="border-b border-line/60 font-hud text-sm">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar player={player} size={30} ring={team === "A" ? "border-gold/60" : "border-cyan/60"} />
                      <span className="truncate">{player.nickname || player.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  <NumCell value={stat.goals} onChange={(v) => update(player.id, { goals: v })} />
                  <NumCell value={stat.assists} onChange={(v) => update(player.id, { assists: v })} />
                  <NumCell value={stat.yellowCards} max={2} onChange={(v) => update(player.id, { yellowCards: v })} />
                  <NumCell value={stat.redCards} max={1} onChange={(v) => update(player.id, { redCards: v })} />
                  <NumCell
                    value={stat.saves}
                    onChange={(v) => update(player.id, { saves: v })}
                    disabled={!stat.isGoalkeeper}
                  />
                  <NumCell value={stat.errors} onChange={(v) => update(player.id, { errors: v })} />
                  <NumCell value={stat.minutesLate} onChange={(v) => update(player.id, { minutesLate: v })} />
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={stat.isGoalkeeper}
                      onChange={(e) => update(player.id, { isGoalkeeper: e.target.checked })}
                      className="h-4 w-4 accent-cyan"
                    />
                  </td>
                  <td className="px-2 py-2">
                    <input
                      type="number"
                      min={1}
                      max={10}
                      step={0.1}
                      value={stat.rating}
                      onChange={(e) => update(player.id, { rating: Number(e.target.value) })}
                      className="w-14 rounded-md border border-line bg-white/5 px-1.5 py-1 text-center outline-none focus:border-gold/50"
                    />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => setMvpId(player.id)}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border transition",
                        mvpId === player.id
                          ? "border-gold bg-gold/20 text-gold"
                          : "border-line text-ink-faint hover:text-ink"
                      )}
                    >
                      <Star size={14} fill={mvpId === player.id ? "currentColor" : "none"} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div>
        <p className="mb-2 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
          Comentarios de la fecha
        </p>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          placeholder="Partidazo, Nico se mandó un hat-trick..."
          className="w-full rounded-xl border border-line bg-white/5 p-3 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
        />
      </div>

      <div className="flex items-center gap-3">
        <GlowButton variant="gold" onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save size={16} /> {saving ? "Guardando…" : "Guardar resultado"}
        </GlowButton>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-hud text-sm text-emerald"
          >
            ✓ Estadísticas guardadas
          </motion.span>
        )}
      </div>
    </div>
  );
}

function TeamScore({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="text-center">
      <p className={cn("font-hud text-xs uppercase tracking-wide", color)}>{label}</p>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="mt-1 w-16 rounded-lg border border-line bg-white/5 py-1 text-center font-display text-3xl text-ink outline-none focus:border-gold/50"
      />
    </div>
  );
}

function NumCell({
  value,
  onChange,
  max = 20,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  max?: number;
  disabled?: boolean;
}) {
  return (
    <td className="px-2 py-2 text-center">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-12 rounded-md border border-line bg-white/5 px-1 py-1 text-center outline-none focus:border-gold/50 disabled:opacity-30"
      />
    </td>
  );
}

function MiniField({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
  step = 1,
  disabled,
  gold,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  gold?: boolean;
}) {
  return (
    <label className="flex flex-col items-center gap-1">
      <span className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">{label}</span>
      <input
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
        className={cn(
          "w-full rounded-lg border border-line bg-white/5 py-1.5 text-center font-hud text-sm outline-none focus:border-gold/50 disabled:opacity-30",
          gold && "font-bold text-gold"
        )}
      />
    </label>
  );
}
