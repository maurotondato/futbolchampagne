"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Film } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { Pitch } from "@/components/pitch/Pitch";
import { PlayerToken } from "@/components/pitch/PlayerToken";
import { ParticipantPicker } from "@/components/historial/ParticipantPicker";
import { MatchStatsForm } from "@/components/historial/MatchStatsForm";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { cn, formatDate } from "@/lib/utils";
import { slotCoords } from "@/lib/formation";

function MatchDetailContent() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const pitchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const match = matches.find((m) => m.id === id);

  if (!hydrated) {
    return (
      <PageShell>
        <TopBar title="Partido" onBack={() => router.push("/historial")} />
        <p className="py-20 text-center font-hud text-ink-faint">Cargando…</p>
      </PageShell>
    );
  }

  if (!match) {
    return (
      <PageShell>
        <TopBar title="Partido" onBack={() => router.push("/historial")} />
        <p className="py-20 text-center font-hud text-ink-faint">No encontramos ese partido.</p>
      </PageShell>
    );
  }

  const participants = match.lineup
    .map((slot) => ({ player: players.find((p) => p.id === slot.playerId), team: slot.team }))
    .filter((p): p is { player: (typeof players)[number]; team: "A" | "B" } => Boolean(p.player));

  return (
    <PageShell>
      <TopBar title={formatDate(match.date)} subtitle={`${match.teamAName} vs ${match.teamBName}`} onBack={() => router.push("/historial")} />
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {match.lineup.length > 0 && (
          <div className="mx-auto max-w-sm">
            <Pitch ref={pitchRef}>
              {match.lineup.map((slot) => {
                const player = players.find((p) => p.id === slot.playerId);
                if (!player) return null;
                const { x, y } = slotCoords(slot.slot, slot.team);
                return (
                  <PlayerToken
                    key={slot.playerId}
                    player={player}
                    x={x}
                    y={y}
                    team={slot.team}
                    pitchRef={pitchRef}
                    onMove={() => {}}
                    onRemove={() => {}}
                    readOnly
                  />
                );
              })}
            </Pitch>
          </div>
        )}

        <GlassPanel className="flex items-center justify-between p-4">
          <p className="font-hud text-sm text-ink-dim">
            🎥 Momentos del partido (goles, atajadas, papelones)
          </p>
          <Link
            href={`/momentos?match=${match.id}`}
            className="flex items-center gap-1.5 font-hud text-xs uppercase tracking-wide text-cyan hover:underline"
          >
            <Film size={14} /> Ver / subir
          </Link>
        </GlassPanel>

        <GlassPanel className="p-5">
          <p className={cn("font-hud text-xs uppercase tracking-[0.25em] text-ink-faint", match.status === "played" && "mb-4")}>
            {match.status === "played" ? "Editar resultado y estadísticas" : "Cargar resultado y estadísticas"}
          </p>
          {match.status !== "played" && (
            <p className="mb-4 mt-1 font-hud text-xs text-ink-faint">
              Se completa después del partido — normalmente al otro día — y ahí se arman solas la tabla y las
              estadísticas.
            </p>
          )}
          {match.lineup.length === 0 ? (
            <ParticipantPicker matchId={match.id} players={players.filter((p) => p.active)} />
          ) : (
            <MatchStatsForm match={match} participants={participants} />
          )}
        </GlassPanel>
      </div>
    </PageShell>
  );
}

export default function MatchDetailPage() {
  return (
    <Suspense fallback={<PageShell><p className="py-20 text-center font-hud text-ink-faint">Cargando…</p></PageShell>}>
      <MatchDetailContent />
    </Suspense>
  );
}
