import { forwardRef } from "react";
import { Crest } from "@/components/ui/Crest";
import { cssGradientFor } from "@/components/ui/PlayerAvatar";
import { initials } from "@/lib/utils";
import { withBasePath } from "@/lib/basePath";
import { GROUP_NAME } from "@/lib/data/demoData";
import { isValidSlotCode, slotCoords } from "@/lib/formation";
import { generateInventedStats, type InventedMatchStats } from "@/lib/matchStats";
import type { LineupSlot, Match, Player, PlayerMatchStat } from "@/lib/data/types";

const W = 1000;
const H = 1790;
const RED = "#ef4444";
const BLUE = "#3a7bff";
const GOLD = "#ffd76a";

function ratingColor(rating: number) {
  if (rating >= 8) return "#22e07f";
  if (rating >= 6.5) return "#e8c979";
  if (rating >= 5) return "#ff9f45";
  return "#ff5d6c";
}

export const ResultGraphic = forwardRef<
  HTMLDivElement,
  { match: Match; players: Player[] }
>(function ResultGraphic({ match, players }, ref) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const statById = new Map(match.stats.map((s) => [s.playerId, s]));
  const teamA = match.lineup.filter((s) => s.team === "A");
  const teamB = match.lineup.filter((s) => s.team === "B");
  const scoreA = match.teamAScore ?? 0;
  const scoreB = match.teamBScore ?? 0;
  const mvp = match.mvpPlayerId ? byId.get(match.mvpPlayerId) : undefined;
  const stats = generateInventedStats(match.id, scoreA, scoreB);
  const dateLabel = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(new Date(`${match.date}T12:00:00`));

  return (
    <div
      ref={ref}
      style={{
        width: W,
        height: H,
        position: "relative",
        fontFamily: "var(--font-barlow), sans-serif",
        background: "radial-gradient(ellipse at 50% 0%, #0d1526 0%, #05070d 55%, #030509 100%)",
        overflow: "hidden",
        color: "#eef1f8",
      }}
    >
      <div style={{ position: "absolute", top: -200, left: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(53,226,226,0.14), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -200, right: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,201,121,0.14), transparent 70%)" }} />

      {/* Header */}
      <div style={{ position: "relative", padding: "44px 56px 16px", display: "flex", alignItems: "center", gap: 20 }}>
        <Crest size={64} />
        <div>
          <div style={{ fontFamily: "var(--font-hud), sans-serif", fontSize: 14, letterSpacing: 6, color: "#93a0bd", textTransform: "uppercase" }}>
            {dateLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 36,
              letterSpacing: 1,
              textTransform: "uppercase",
              backgroundImage: "linear-gradient(100deg,#a8863f,#ffe9a8,#e8c979)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {GROUP_NAME}
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div style={{ position: "relative", margin: "6px 56px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))" }}>
        <TeamHeading name={match.teamAName} color={RED} align="left" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 52, lineHeight: 1, color: "#fff" }}>
            {scoreA} - {scoreB}
          </div>
          <div style={{ fontFamily: "var(--font-hud), sans-serif", fontSize: 12, letterSpacing: 3, color: "#5c6685", textTransform: "uppercase", marginTop: 4 }}>
            Resultado final
          </div>
        </div>
        <TeamHeading name={match.teamBName} color={BLUE} align="right" />
      </div>

      {mvp && (
        <div style={{ position: "relative", margin: "0 56px 20px", textAlign: "center", fontFamily: "var(--font-hud), sans-serif", fontSize: 15, letterSpacing: 2, color: GOLD, textTransform: "uppercase" }}>
          👑 MVP · {mvp.nickname || mvp.name}
        </div>
      )}

      {/* Pitch */}
      <div
        style={{
          position: "relative",
          margin: "0 56px",
          height: 760,
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          backgroundImage: "repeating-linear-gradient(90deg, #0b4d2b 0, #0b4d2b 8%, #06371f 8%, #06371f 16%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <PitchLines />
        {teamA.map((slot) => (
          <ResultToken key={slot.playerId} slot={slot} player={byId.get(slot.playerId)} color={RED} stat={statById.get(slot.playerId)} />
        ))}
        {teamB.map((slot) => (
          <ResultToken key={slot.playerId} slot={slot} player={byId.get(slot.playerId)} color={BLUE} stat={statById.get(slot.playerId)} />
        ))}
      </div>

      <StatsPanel stats={stats} />

      <div style={{ position: "relative", textAlign: "center", padding: "20px 0 10px", fontFamily: "var(--font-hud), sans-serif", fontSize: 13, letterSpacing: 4, color: "#5c6685", textTransform: "uppercase" }}>
        Generado en Fútbol Champagne App
      </div>
    </div>
  );
});

function TeamHeading({ name, color, align }: { name: string; color: string; align: "left" | "right" }) {
  return (
    <div style={{ textAlign: align, maxWidth: 260 }}>
      <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 28, textTransform: "uppercase", color }}>{name}</div>
    </div>
  );
}

function ResultToken({
  slot,
  player,
  color,
  stat,
}: {
  slot: LineupSlot;
  player?: Player;
  color: string;
  stat?: PlayerMatchStat;
}) {
  if (!player || !isValidSlotCode(slot.slot)) return null;
  const { x, y } = slotCoords(slot.slot, slot.team);
  const isMvp = stat?.isMvp;
  const goals = stat?.goals ?? 0;
  const ringColor = isMvp ? GOLD : color;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        width: 140,
      }}
    >
      <div style={{ position: "relative" }}>
        {isMvp && (
          <div style={{ position: "absolute", top: -18, left: "50%", transform: "translateX(-50%)", fontSize: 22, zIndex: 2, filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.7))" }}>
            👑
          </div>
        )}
        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: "50%",
            border: `3px solid ${ringColor}`,
            boxShadow: `0 0 20px ${ringColor}66, 0 6px 14px rgba(0,0,0,0.5)`,
            background: cssGradientFor(player.id),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display), sans-serif",
            fontSize: 26,
            color: "#fff",
            overflow: "hidden",
          }}
        >
          {player.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={withBasePath(player.photoUrl)} alt="" crossOrigin="anonymous" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            initials(player.name)
          )}
        </div>
        {goals > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -6,
              minWidth: 26,
              height: 26,
              padding: "0 6px",
              borderRadius: 13,
              background: "#0b0d14",
              border: "2px solid #fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-hud), sans-serif",
              fontWeight: 800,
              fontSize: 12,
              color: "#fff",
            }}
          >
            ⚽{goals > 1 ? `x${goals}` : ""}
          </div>
        )}
        {stat && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              left: -6,
              minWidth: 30,
              height: 22,
              padding: "0 6px",
              borderRadius: 11,
              background: "#0b0d14",
              border: `2px solid ${ratingColor(stat.rating)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 13,
              color: ratingColor(stat.rating),
            }}
          >
            {stat.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-hud), sans-serif",
          fontWeight: 700,
          fontSize: 17,
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "2px 11px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          maxWidth: 150,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {player.nickname || player.name.split(" ")[0]}
      </div>
    </div>
  );
}

function StatsPanel({ stats }: { stats: InventedMatchStats }) {
  return (
    <div
      style={{
        position: "relative",
        margin: "24px 56px 0",
        padding: "26px 32px 18px",
        borderRadius: 20,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-hud), sans-serif",
          fontSize: 13,
          letterSpacing: 5,
          color: "#93a0bd",
          textTransform: "uppercase",
          marginBottom: 22,
        }}
      >
        Estadísticas del partido
      </div>
      <StatRow label="Posesión" a={stats.possessionA} b={stats.possessionB} suffix="%" />
      <StatRow label="Tiros al arco" a={stats.shotsOnTargetA} b={stats.shotsOnTargetB} />
      <StatRow label="Tiros totales" a={stats.shotsA} b={stats.shotsB} />
      <StatRow label="Corners" a={stats.cornersA} b={stats.cornersB} />
      <StatRow label="Faltas" a={stats.foulsA} b={stats.foulsB} />
    </div>
  );
}

function StatRow({ label, a, b, suffix = "" }: { label: string; a: number; b: number; suffix?: string }) {
  const total = a + b || 1;
  const pctA = (a / total) * 100;
  const pctB = (b / total) * 100;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 20, color: RED, width: 60 }}>
          {a}
          {suffix}
        </span>
        <span
          style={{
            fontFamily: "var(--font-hud), sans-serif",
            fontSize: 12,
            letterSpacing: 2,
            color: "#93a0bd",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 20, color: BLUE, width: 60, textAlign: "right" }}>
          {b}
          {suffix}
        </span>
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
        <div style={{ width: `${pctA}%`, background: `linear-gradient(90deg, #b91c1c, ${RED})` }} />
        <div style={{ width: `${pctB}%`, background: `linear-gradient(90deg, ${BLUE}, #1d4ed8)` }} />
      </div>
    </div>
  );
}

function PitchLines() {
  return (
    <svg viewBox="0 0 68 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" fill="none">
        <rect x="1.5" y="1.5" width="65" height="97" rx="1" />
        <line x1="1.5" y1="50" x2="66.5" y2="50" />
        <circle cx="34" cy="50" r="9.15" />
        <rect x="13.84" y="1.5" width="40.32" height="16.5" />
        <path d="M 27 18 A 9.15 9.15 0 0 0 41 18" />
        <rect x="13.84" y="82" width="40.32" height="16.5" />
        <path d="M 27 82 A 9.15 9.15 0 0 1 41 82" />
      </g>
    </svg>
  );
}
