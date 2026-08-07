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
const H = 1760;
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
      <div style={{ position: "relative", padding: "44px 48px 16px", display: "flex", alignItems: "center", gap: 20 }}>
        <Crest size={68} />
        <div>
          <div style={{ fontFamily: "var(--font-hud), sans-serif", fontSize: 15, letterSpacing: 6, color: "#93a0bd", textTransform: "uppercase" }}>
            {dateLabel}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 40,
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
      <div style={{ position: "relative", margin: "6px 48px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))" }}>
        <TeamHeading name={match.teamAName} color={RED} align="left" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 68, lineHeight: 1, color: "#fff", textShadow: "0 0 30px rgba(255,255,255,0.25)" }}>
            {scoreA} - {scoreB}
          </div>
          <div style={{ fontFamily: "var(--font-hud), sans-serif", fontSize: 14, letterSpacing: 3, color: "#7c8bab", textTransform: "uppercase", marginTop: 6 }}>
            Resultado final
          </div>
        </div>
        <TeamHeading name={match.teamBName} color={BLUE} align="right" />
      </div>

      {mvp && (
        <div style={{ position: "relative", margin: "0 48px 22px", textAlign: "center", fontFamily: "var(--font-hud), sans-serif", fontSize: 22, fontWeight: 700, letterSpacing: 2, color: GOLD, textTransform: "uppercase", textShadow: "0 0 16px rgba(255,215,110,0.5)" }}>
          👑 MVP · {mvp.nickname || mvp.name}
        </div>
      )}

      {/* Pitch */}
      <div
        style={{
          position: "relative",
          margin: "0 48px",
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

      <div style={{ position: "relative", textAlign: "center", padding: "22px 0 12px", fontFamily: "var(--font-hud), sans-serif", fontSize: 14, letterSpacing: 4, color: "#5c6685", textTransform: "uppercase" }}>
        Generado en Fútbol Champagne App
      </div>
    </div>
  );
});

function TeamHeading({ name, color, align }: { name: string; color: string; align: "left" | "right" }) {
  return (
    <div style={{ textAlign: align, maxWidth: 260 }}>
      <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 34, textTransform: "uppercase", color, textShadow: `0 0 18px ${color}55` }}>{name}</div>
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
          <div
            style={{
              position: "absolute",
              top: -30,
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: 34,
              zIndex: 2,
              filter: "drop-shadow(0 0 12px rgba(255,215,110,0.9)) drop-shadow(0 2px 3px rgba(0,0,0,0.7))",
            }}
          >
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
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
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
        </div>
        {goals > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -14,
              minWidth: 40,
              height: 36,
              padding: "0 10px",
              borderRadius: 18,
              background: "#0b0d14",
              border: "4px solid #fff",
              boxShadow: "0 3px 10px rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-hud), sans-serif",
              fontWeight: 800,
              fontSize: 18,
              color: "#fff",
              zIndex: 1,
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
              left: -14,
              minWidth: 48,
              height: 34,
              padding: "0 10px",
              borderRadius: 17,
              background: "#0b0d14",
              border: `4px solid ${ratingColor(stat.rating)}`,
              boxShadow: "0 3px 10px rgba(0,0,0,0.65)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display), sans-serif",
              fontSize: 20,
              color: ratingColor(stat.rating),
              zIndex: 1,
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
          fontSize: 18,
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "3px 12px",
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
        margin: "26px 48px 0",
        padding: "30px 34px 22px",
        borderRadius: 22,
        border: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(160deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontFamily: "var(--font-hud), sans-serif",
          fontSize: 15,
          letterSpacing: 5,
          color: "#a9b4d0",
          textTransform: "uppercase",
          marginBottom: 26,
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
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 28, color: RED, width: 76 }}>
          {a}
          {suffix}
        </span>
        <span
          style={{
            fontFamily: "var(--font-hud), sans-serif",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 2,
            color: "#a9b4d0",
            textTransform: "uppercase",
            textAlign: "center",
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 28, color: BLUE, width: 76, textAlign: "right" }}>
          {b}
          {suffix}
        </span>
      </div>
      <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", background: "rgba(255,255,255,0.08)" }}>
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
