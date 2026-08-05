"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Film, Pencil, Users, CalendarDays } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { Pitch } from "@/components/pitch/Pitch";
import { PlayerToken } from "@/components/pitch/PlayerToken";
import { MatchStatsForm } from "@/components/historial/MatchStatsForm";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { cn, formatDate } from "@/lib/utils";
import { isValidSlotCode, slotCoords } from "@/lib/formation";

function MatchDetailContent() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const updateMatch = useAppStore((s) => s.updateMatch);
  const pitchRef = useRef<HTMLDivElement>(null);
  const [editingDate, setEditingDate] = useState(false);

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

  // "Armar Partido" always opens the earliest scheduled match — only offer
  // the shortcut when that's actually this one, so it can't silently take
  // someone into editing a different match's formation.
  const nextScheduledId = [...matches]
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => a.date.localeCompare(b.date))[0]?.id;
  const canEditFormation = match.status === "scheduled" && match.id === nextScheduledId;

  return (
    <PageShell>
      <TopBar title={formatDate(match.date)} subtitle={`${match.teamAName} vs ${match.teamBName}`} onBack={() => router.push("/historial")} />
      <div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        <GlassPanel className="flex items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="shrink-0 text-ink-faint" />
            {editingDate ? (
              <input
                type="date"
                defaultValue={match.date}
                autoFocus
                onBlur={(e) => {
                  if (e.target.value) updateMatch(match.id, { date: e.target.value });
                  setEditingDate(false);
                }}
                className="rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-sm text-ink outline-none focus:border-gold/50"
              />
            ) : (
              <p className="font-hud text-sm text-ink">{formatDate(match.date)}</p>
            )}
          </div>
          {!editingDate && (
            <button
              onClick={() => setEditingDate(true)}
              className="flex items-center gap-1.5 font-hud text-xs uppercase tracking-wide text-ink-faint hover:text-gold"
            >
              <Pencil size={13} /> Editar fecha
            </button>
          )}
        </GlassPanel>

        {match.lineup.length > 0 && (
          <div className="mx-auto max-w-sm">
            <Pitch ref={pitchRef}>
              {match.lineup.map((slot) => {
                const player = players.find((p) => p.id === slot.playerId);
                if (!player || !isValidSlotCode(slot.slot)) return null;
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
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <p className="font-hud text-sm text-ink-dim">
                Este partido todavía no tiene formación cargada.
              </p>
              {canEditFormation ? (
                <Link href="/armar-partido">
                  <GlowButton variant="gold" className="flex items-center gap-2">
                    <Users size={15} /> Armar equipos
                  </GlowButton>
                </Link>
              ) : (
                <p className="font-hud text-xs text-ink-faint">
                  No se puede armar formación para este partido — ya no es el próximo programado.
                </p>
              )}
            </div>
          ) : (
            <>
              {canEditFormation && (
                <div className="mb-4 flex justify-end">
                  <Link
                    href="/armar-partido"
                    className="flex items-center gap-1.5 font-hud text-xs uppercase tracking-wide text-cyan hover:underline"
                  >
                    <Pencil size={13} /> Editar formación
                  </Link>
                </div>
              )}
              <MatchStatsForm match={match} participants={participants} players={players} />
            </>
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
