"use client";

import { useState } from "react";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { useAppStore } from "@/store/appStore";
import { FORMATION_7, mirrorY } from "@/lib/formation";
import type { Player } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export function ParticipantPicker({ matchId, players }: { matchId: string; players: Player[] }) {
  const setLineupSlot = useAppStore((s) => s.setLineupSlot);
  const [selection, setSelection] = useState<Record<string, "A" | "B" | undefined>>({});

  const countA = Object.values(selection).filter((v) => v === "A").length;
  const countB = Object.values(selection).filter((v) => v === "B").length;

  function toggle(id: string, team: "A" | "B") {
    setSelection((prev) => ({ ...prev, [id]: prev[id] === team ? undefined : team }));
  }

  function confirm() {
    const teamA = players.filter((p) => selection[p.id] === "A").slice(0, 7);
    const teamB = players.filter((p) => selection[p.id] === "B").slice(0, 7);
    teamA.forEach((player, i) => {
      const slot = FORMATION_7[i];
      setLineupSlot(matchId, { playerId: player.id, team: "A", x: slot.x, y: slot.y });
    });
    teamB.forEach((player, i) => {
      const slot = FORMATION_7[i];
      setLineupSlot(matchId, { playerId: player.id, team: "B", x: slot.x, y: mirrorY(slot.y) });
    });
  }

  return (
    <div className="space-y-4">
      <p className="font-hud text-sm text-ink-dim">
        Este partido no tiene formación cargada. Elegí quiénes jugaron en cada equipo (tocá el nombre
        una vez para Equipo A, dos para Equipo B).
      </p>
      <div className="flex flex-wrap gap-2">
        {players.map((p) => {
          const team = selection[p.id];
          return (
            <button
              key={p.id}
              onClick={() => toggle(p.id, team === "A" ? "B" : "A")}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 font-hud text-xs transition",
                team === "A" && "border-gold/70 bg-gold/10 text-gold",
                team === "B" && "border-cyan/70 bg-cyan/10 text-cyan",
                !team && "border-line text-ink-faint hover:text-ink"
              )}
            >
              <PlayerAvatar player={p} size={20} />
              {p.nickname || p.name.split(" ")[0]}
            </button>
          );
        })}
      </div>
      <p className="font-hud text-xs text-ink-faint">
        Equipo A: {countA}/7 · Equipo B: {countB}/7
      </p>
      <GlowButton variant="gold" onClick={confirm} disabled={countA === 0 && countB === 0}>
        Confirmar plantel
      </GlowButton>
    </div>
  );
}
