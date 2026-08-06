"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, UserMinus } from "lucide-react";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import type { Player, SlotCode } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { slotByCode } from "@/lib/formation";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { Portal } from "@/components/ui/Portal";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function SlotPicker({
  open,
  onClose,
  slotCode,
  team,
  players,
  occupiedIds,
  currentPlayerId,
  onSelect,
  onClear,
}: {
  open: boolean;
  onClose: () => void;
  slotCode: SlotCode;
  team: "A" | "B";
  players: Player[];
  /** Jugadores ya ubicados en otra posición de este partido. */
  occupiedIds: Set<string>;
  currentPlayerId?: string;
  onSelect: (playerId: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const slotDef = slotByCode(slotCode);

  // On iOS, focusing the search input while the background page can still
  // scroll makes Safari auto-scroll the page to "reveal" the input — which
  // drags this fixed-position sheet down out of the viewport with it (looks
  // like it vanished; it's just below the fold). Locking body scroll while
  // open keeps the page from moving out from under it.
  useBodyScrollLock(open);

  const available = useMemo(() => {
    const q = normalize(query.trim());
    return players
      .filter((p) => p.active)
      .filter((p) => p.id === currentPlayerId || !occupiedIds.has(p.id))
      .filter((p) => !q || normalize(p.name).includes(q) || normalize(p.nickname ?? "").includes(q))
      .sort((a, b) => {
        const aMatch = a.favoritePosition === slotDef.pos ? 0 : 1;
        const bMatch = b.favoritePosition === slotDef.pos ? 0 : 1;
        if (aMatch !== bMatch) return aMatch - bMatch;
        return a.name.localeCompare(b.name);
      });
  }, [players, query, occupiedIds, currentPlayerId, slotDef.pos]);

  return (
    <Portal>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            // Fixed height (not max-height) on mobile so the sheet never
            // resizes as the results list shrinks while typing — a
            // shrinking sheet moves the focused search input's on-screen
            // position, which makes iOS re-trigger its "scroll to keep the
            // focused input visible" behavior and pan the whole page.
            className="glass-strong flex h-[75dvh] w-full flex-col rounded-t-2xl border border-line sm:h-auto sm:max-h-[80vh] sm:max-w-sm sm:rounded-2xl"
          >
            <div className="flex items-center justify-between border-b border-line p-4">
              <p className="font-hud text-sm uppercase tracking-wide text-ink">
                <span className={team === "A" ? "text-team-a" : "text-team-b"}>
                  {team === "A" ? "Equipo A" : "Equipo B"}
                </span>{" "}
                · {slotDef.label}
              </p>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-ink"
                aria-label="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3">
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Escribí un nombre…"
                  className="w-full rounded-xl border border-line bg-white/5 py-2.5 pl-9 pr-3 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-4">
              {currentPlayerId && (
                <button
                  onClick={onClear}
                  className="flex w-full items-center gap-2 rounded-xl border border-magenta/40 bg-magenta/10 p-3 font-hud text-sm text-magenta"
                >
                  <UserMinus size={16} /> Quitar de esta posición
                </button>
              )}
              {available.length === 0 && (
                <p className="py-8 text-center font-hud text-sm text-ink-faint">
                  No hay jugadores disponibles con ese nombre.
                </p>
              )}
              {available.map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelect(p.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition",
                    p.id === currentPlayerId
                      ? "border-gold/60 bg-gold/10"
                      : "border-line hover:border-gold/40 hover:bg-white/5"
                  )}
                >
                  <PlayerAvatar player={p} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-hud text-sm text-ink">{p.nickname || p.name}</p>
                    <p className="font-hud text-[10px] uppercase tracking-wide text-ink-faint">
                      {p.favoritePosition}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </Portal>
  );
}
