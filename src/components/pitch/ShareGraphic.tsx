import { forwardRef } from "react";
import { Crest } from "@/components/ui/Crest";
import { cssGradientFor } from "@/components/ui/PlayerAvatar";
import { initials } from "@/lib/utils";
import { GROUP_NAME } from "@/lib/data/demoData";
import type { LineupSlot, Match, Player } from "@/lib/data/types";

const W = 1000;
const H = 1400;

export const ShareGraphic = forwardRef<
  HTMLDivElement,
  { match: Match; players: Player[] }
>(function ShareGraphic({ match, players }, ref) {
  const byId = new Map(players.map((p) => [p.id, p]));
  const teamA = match.lineup.filter((s) => s.team === "A");
  const teamB = match.lineup.filter((s) => s.team === "B");
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
        background:
          "radial-gradient(ellipse at 50% 0%, #0d1526 0%, #05070d 55%, #030509 100%)",
        overflow: "hidden",
        color: "#eef1f8",
      }}
    >
      {/* Ambient glow accents */}
      <div style={{ position: "absolute", top: -200, left: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(53,226,226,0.18), transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -200, right: -150, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,201,121,0.16), transparent 70%)" }} />

      {/* Header */}
      <div style={{ position: "relative", padding: "48px 56px 18px", display: "flex", alignItems: "center", gap: 20 }}>
        <Crest size={72} />
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
      <div style={{ position: "relative", margin: "8px 56px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 28px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.1)", background: "linear-gradient(160deg, rgba(255,255,255,0.06), rgba(0,0,0,0.15))" }}>
        <TeamHeading name={match.teamAName} color="#e8c979" align="left" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-display), sans-serif", fontSize: 56, lineHeight: 1, color: "#fff" }}>
            {match.status === "played" ? `${match.teamAScore} - ${match.teamBScore}` : "VS"}
          </div>
          <div style={{ fontFamily: "var(--font-hud), sans-serif", fontSize: 13, letterSpacing: 3, color: "#5c6685", textTransform: "uppercase", marginTop: 4 }}>
            {match.status === "played" ? "Resultado final" : "Resultado pendiente"}
          </div>
        </div>
        <TeamHeading name={match.teamBName} color="#35e2e2" align="right" />
      </div>

      {/* Pitch */}
      <div
        style={{
          position: "relative",
          margin: "0 56px",
          height: 860,
          borderRadius: 24,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.12)",
          backgroundImage:
            "repeating-linear-gradient(90deg, #0b4d2b 0, #0b4d2b 8%, #06371f 8%, #06371f 16%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        <PitchLines />
        {teamA.map((slot) => (
          <Token key={slot.playerId} slot={slot} player={byId.get(slot.playerId)} color="#e8c979" />
        ))}
        {teamB.map((slot) => (
          <Token key={slot.playerId} slot={slot} player={byId.get(slot.playerId)} color="#35e2e2" />
        ))}
      </div>

      <div style={{ position: "relative", textAlign: "center", padding: "24px 0 12px", fontFamily: "var(--font-hud), sans-serif", fontSize: 13, letterSpacing: 4, color: "#5c6685", textTransform: "uppercase" }}>
        Generado en Fútbol Champagne App
      </div>
    </div>
  );
});

function TeamHeading({ name, color, align }: { name: string; color: string; align: "left" | "right" }) {
  return (
    <div style={{ textAlign: align, maxWidth: 260 }}>
      <div
        style={{
          fontFamily: "var(--font-display), sans-serif",
          fontSize: 30,
          textTransform: "uppercase",
          color,
        }}
      >
        {name}
      </div>
    </div>
  );
}

function Token({
  slot,
  player,
  color,
}: {
  slot: LineupSlot;
  player?: Player;
  color: string;
}) {
  if (!player) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: `${slot.x}%`,
        top: `${slot.y}%`,
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        width: 110,
      }}
    >
      <div
        style={{
          width: 76,
          height: 76,
          borderRadius: "50%",
          border: `3px solid ${color}`,
          boxShadow: `0 0 20px ${color}55, 0 6px 14px rgba(0,0,0,0.5)`,
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
          <img src={player.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials(player.name)
        )}
      </div>
      <div
        style={{
          fontFamily: "var(--font-hud), sans-serif",
          fontWeight: 700,
          fontSize: 15,
          textTransform: "uppercase",
          color: "#fff",
          background: "rgba(0,0,0,0.55)",
          padding: "2px 10px",
          borderRadius: 999,
          whiteSpace: "nowrap",
          maxWidth: 130,
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {player.nickname || player.name.split(" ")[0]}
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
