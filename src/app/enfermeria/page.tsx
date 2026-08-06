"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Cross, Plus, X, CheckCircle2, HeartPulse } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { Portal } from "@/components/ui/Portal";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { formatShortDate, cn } from "@/lib/utils";
import type { Injury } from "@/lib/data/types";

const COMMON_INJURIES = [
  "Esguince de tobillo",
  "Desgarro muscular",
  "Sobrecarga muscular",
  "Golpe / contusión",
  "Rotura de ligamentos",
  "Pubalgia",
  "Lumbalgia",
];

function daysUntil(dateIso: string) {
  const target = new Date(`${dateIso}T12:00:00`);
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function statusFor(injury: Injury): { label: string; tone: "critical" | "warning" | "good" } {
  if (!injury.estimatedReturnDate) return { label: "Fecha a confirmar", tone: "critical" };
  const days = daysUntil(injury.estimatedReturnDate);
  if (days <= 0) return { label: "Alta estimada", tone: "good" };
  if (days <= 7) return { label: `Vuelve en ${days}d`, tone: "warning" };
  return { label: `Vuelve en ${days}d`, tone: "critical" };
}

const TONE_CLASSES: Record<"critical" | "warning" | "good", string> = {
  critical: "border-magenta/40 bg-magenta/10 text-magenta",
  warning: "border-gold/40 bg-gold/10 text-gold",
  good: "border-emerald/40 bg-emerald/10 text-emerald",
};

export default function EnfermeriaPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const injuries = useAppStore((s) => s.injuries);
  const addInjury = useAppStore((s) => s.addInjury);
  const deleteInjury = useAppStore((s) => s.deleteInjury);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
  const sorted = useMemo(
    () =>
      [...injuries].sort((a, b) => {
        if (a.estimatedReturnDate && b.estimatedReturnDate) {
          return a.estimatedReturnDate.localeCompare(b.estimatedReturnDate);
        }
        if (a.estimatedReturnDate) return -1;
        if (b.estimatedReturnDate) return 1;
        return b.startDate.localeCompare(a.startDate);
      }),
    [injuries]
  );

  const injuredIds = new Set(injuries.map((i) => i.playerId));
  const available = players.filter((p) => p.active && !injuredIds.has(p.id));

  return (
    <PageShell>
      <TopBar
        title="Enfermería"
        subtitle="Parte médico del plantel"
        onBack={() => router.push("/")}
        right={
          <GlowButton variant="danger" onClick={() => setOpen(true)} className="flex items-center gap-2">
            <Plus size={15} /> Agregar
          </GlowButton>
        }
      />

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : sorted.length === 0 ? (
          <GlassPanel className="flex flex-col items-center gap-3 p-10 text-center">
            <CheckCircle2 size={40} className="text-emerald" />
            <p className="font-display text-2xl text-emerald">Plantel 100% disponible</p>
            <p className="font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
              Ningún jugador en la enfermería
            </p>
          </GlassPanel>
        ) : (
          <div className="space-y-3">
            {sorted.map((injury, i) => {
              const player = byId.get(injury.playerId);
              if (!player) return null;
              const status = statusFor(injury);
              return (
                <motion.div
                  key={injury.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.4) }}
                >
                  <GlassPanel className="relative overflow-hidden border-magenta/20 p-4">
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-magenta via-magenta/60 to-transparent"
                      aria-hidden
                    />
                    <div className="flex items-start gap-3 pl-2">
                      <div className="relative shrink-0">
                        <PlayerAvatar player={player} size={52} ring="border-magenta/50" />
                        <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-void bg-magenta text-white">
                          <Cross size={12} strokeWidth={3} />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-hud text-sm font-semibold text-ink">
                          {player.nickname || player.name}
                        </p>
                        <p className="mt-0.5 truncate font-display text-lg text-white/90">
                          {injury.injuryName}
                        </p>
                        <p className="mt-1 font-hud text-[10px] uppercase tracking-wide text-ink-faint">
                          Desde el {formatShortDate(injury.startDate)}
                          {injury.notes ? ` · ${injury.notes}` : ""}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <span
                          className={cn(
                            "rounded-full border px-2.5 py-1 font-hud text-[10px] font-bold uppercase tracking-wide",
                            TONE_CLASSES[status.tone]
                          )}
                        >
                          {status.label}
                        </span>
                        {injury.estimatedReturnDate && (
                          <span className="font-hud text-[10px] text-ink-faint">
                            {formatShortDate(injury.estimatedReturnDate)}
                          </span>
                        )}
                        <button
                          onClick={() => deleteInjury(injury.id)}
                          className="flex items-center gap-1 rounded-full border border-line bg-white/5 px-2.5 py-1 font-hud text-[10px] uppercase tracking-wide text-ink-faint transition hover:border-emerald/50 hover:text-emerald"
                        >
                          <CheckCircle2 size={12} /> Dar de alta
                        </button>
                      </div>
                    </div>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <AddInjuryModal
          players={available}
          onClose={() => setOpen(false)}
          onSubmit={async (data) => {
            await addInjury(data);
            setOpen(false);
          }}
        />
      )}
    </PageShell>
  );
}

function AddInjuryModal({
  players,
  onClose,
  onSubmit,
}: {
  players: ReturnType<typeof useAppStore.getState>["players"];
  onClose: () => void;
  onSubmit: (data: Omit<Injury, "id">) => void | Promise<void>;
}) {
  const [playerId, setPlayerId] = useState(players[0]?.id ?? "");
  const [injuryName, setInjuryName] = useState("");
  const [estimatedReturnDate, setEstimatedReturnDate] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useBodyScrollLock(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!playerId || !injuryName.trim()) return;
    setSaving(true);
    try {
      await onSubmit({
        playerId,
        injuryName: injuryName.trim(),
        startDate: new Date().toISOString().slice(0, 10),
        estimatedReturnDate: estimatedReturnDate || null,
        notes: notes.trim() || undefined,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Portal>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.form
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="glass-strong relative w-full max-w-sm rounded-2xl border border-line p-5"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-ink hover:bg-white/20"
            >
              <X size={16} />
            </button>

            <div className="mb-4 flex items-center gap-2">
              <HeartPulse size={18} className="text-magenta" />
              <p className="font-hud text-sm uppercase tracking-wide text-ink">Nueva baja médica</p>
            </div>

            {players.length === 0 ? (
              <p className="py-6 text-center font-hud text-sm text-ink-faint">
                No hay jugadores disponibles para agregar (o ya están todos en la lista).
              </p>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    Jugador
                  </label>
                  <select
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm text-ink outline-none focus:border-magenta/50"
                  >
                    {players.map((p) => (
                      <option key={p.id} value={p.id} className="bg-panel">
                        {p.nickname || p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    Lesión
                  </label>
                  <input
                    value={injuryName}
                    onChange={(e) => setInjuryName(e.target.value)}
                    placeholder="Ej: Esguince de tobillo"
                    className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-magenta/50"
                  />
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {COMMON_INJURIES.map((label) => (
                      <button
                        type="button"
                        key={label}
                        onClick={() => setInjuryName(label)}
                        className="rounded-full border border-line bg-white/5 px-2.5 py-1 font-hud text-[10px] text-ink-faint transition hover:border-magenta/50 hover:text-magenta"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    Fecha estimada de alta (opcional)
                  </label>
                  <input
                    type="date"
                    value={estimatedReturnDate}
                    onChange={(e) => setEstimatedReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm text-ink outline-none focus:border-magenta/50"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                    Notas (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="En recuperación, kinesiología 3x semana…"
                    className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-magenta/50"
                  />
                </div>

                <GlowButton
                  type="submit"
                  variant="danger"
                  disabled={saving || !playerId || !injuryName.trim()}
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Cross size={15} /> {saving ? "Guardando…" : "Agregar a la enfermería"}
                </GlowButton>
              </div>
            )}
          </motion.form>
        </motion.div>
      </AnimatePresence>
    </Portal>
  );
}
