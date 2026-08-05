"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Save, Minus, Plus } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { ShareResultButton } from "@/components/pitch/ShareResultButton";
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
      goalsAgainst: 0,
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
  players,
}: {
  match: Match;
  participants: { player: Player; team: "A" | "B" }[];
  players: Player[];
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
  const [saved, setSaved] = useState(match.status === "played");

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
  }

  return (
    <div className="space-y-6">
      <div className="glass flex items-center justify-center gap-6 rounded-2xl border border-line p-6">
        <TeamScore label={match.teamAName} value={scoreA} onChange={setScoreA} color="text-team-a" />
        <span className="font-display text-3xl text-ink-faint">—</span>
        <TeamScore label={match.teamBName} value={scoreB} onChange={setScoreB} color="text-team-b" />
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
                  ring={team === "A" ? "border-team-a/70" : "border-team-b/70"}
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

              <div className="flex flex-wrap justify-center gap-x-2 gap-y-3">
                <MiniField label="⚽ Goles" value={stat.goals} onChange={(v) => update(player.id, { goals: v })} />
                <MiniField label="⏰ Tarde (min)" value={stat.minutesLate} onChange={(v) => update(player.id, { minutesLate: v })} />
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
              {stat.isGoalkeeper && (
                <div className="mt-2 flex justify-center">
                  <MiniField
                    label="🥅 En contra"
                    value={stat.goalsAgainst}
                    onChange={(v) => update(player.id, { goalsAgainst: v })}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tabla — desde tablet */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line sm:block">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-line bg-white/5 font-hud text-[10px] uppercase tracking-wider text-ink-faint">
              <th className="px-3 py-2">Jugador</th>
              <th className="px-2 py-2 text-center">⚽ Goles</th>
              <th className="px-2 py-2 text-center">⏰ Tarde</th>
              <th className="px-2 py-2 text-center">🧤 Arq</th>
              <th className="px-2 py-2 text-center">🥅 En contra</th>
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
                      <PlayerAvatar player={player} size={30} ring={team === "A" ? "border-team-a/70" : "border-team-b/70"} />
                      <span className="truncate">{player.nickname || player.name.split(" ")[0]}</span>
                    </div>
                  </td>
                  <NumCell value={stat.goals} onChange={(v) => update(player.id, { goals: v })} />
                  <NumCell value={stat.minutesLate} onChange={(v) => update(player.id, { minutesLate: v })} />
                  <td className="px-2 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={stat.isGoalkeeper}
                      onChange={(e) => update(player.id, { isGoalkeeper: e.target.checked })}
                      className="h-4 w-4 accent-cyan"
                    />
                  </td>
                  <NumCell
                    value={stat.goalsAgainst}
                    onChange={(v) => update(player.id, { goalsAgainst: v })}
                    disabled={!stat.isGoalkeeper}
                  />
                  <NumCell
                    value={stat.rating}
                    onChange={(v) => update(player.id, { rating: v })}
                    min={1}
                    max={10}
                    step={0.5}
                    width="w-14"
                  />
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

      <div className="flex flex-wrap items-center gap-3">
        <GlowButton variant="gold" onClick={handleSave} disabled={saving} className="flex items-center gap-2">
          <Save size={16} /> {saving ? "Guardando…" : "Guardar resultado"}
        </GlowButton>
        {saved && (
          <>
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="font-hud text-sm text-emerald"
            >
              ✓ Guardado
            </motion.span>
            <ShareResultButton match={match} players={players} />
          </>
        )}
      </div>
    </div>
  );
}

function StepButton({
  onClick,
  disabled,
  children,
  size = "sm",
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  size?: "sm" | "lg";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      tabIndex={-1}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-line bg-white/5 text-ink-dim transition hover:border-gold/50 hover:text-gold active:scale-90 disabled:opacity-20 disabled:hover:border-line disabled:hover:text-ink-dim",
        size === "sm" ? "h-6 w-6" : "h-9 w-9"
      )}
    >
      {children}
    </button>
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
      <div className="mt-1 flex items-center gap-1.5">
        <StepButton size="lg" onClick={() => onChange(Math.max(0, value - 1))} disabled={value <= 0}>
          <Minus size={16} />
        </StepButton>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
          className="w-14 rounded-lg border border-line bg-white/5 py-1 text-center font-display text-3xl text-ink outline-none focus:border-gold/50"
        />
        <StepButton size="lg" onClick={() => onChange(value + 1)}>
          <Plus size={16} />
        </StepButton>
      </div>
    </div>
  );
}

function NumCell({
  value,
  onChange,
  min = 0,
  max = 20,
  step = 1,
  disabled,
  width = "w-10",
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  width?: string;
}) {
  return (
    <td className="px-2 py-2">
      <div className="flex items-center justify-center gap-1">
        <StepButton onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} disabled={disabled || value <= min}>
          <Minus size={11} />
        </StepButton>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className={cn(
            "rounded-md border border-line bg-white/5 px-1 py-1 text-center outline-none focus:border-gold/50 disabled:opacity-30",
            width
          )}
        />
        <StepButton onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} disabled={disabled || value >= max}>
          <Plus size={11} />
        </StepButton>
      </div>
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
    <div className="flex flex-col items-center gap-1">
      <span className="font-hud text-[9px] uppercase tracking-wide text-ink-faint">{label}</span>
      <div className="flex items-center gap-1">
        <StepButton onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))} disabled={disabled || value <= min}>
          <Minus size={12} />
        </StepButton>
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className={cn(
            "w-10 rounded-lg border border-line bg-white/5 py-1.5 text-center font-hud text-sm outline-none focus:border-gold/50 disabled:opacity-30",
            gold && "font-bold text-gold"
          )}
        />
        <StepButton onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))} disabled={disabled || value >= max}>
          <Plus size={12} />
        </StepButton>
      </div>
    </div>
  );
}
