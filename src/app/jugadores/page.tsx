"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { PlayerListCard } from "@/components/players/PlayerListCard";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import type { FieldPosition } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const FILTERS: { label: string; value: FieldPosition | "TODOS" }[] = [
  { label: "Todos", value: "TODOS" },
  { label: "Arqueros", value: "ARQ" },
  { label: "Defensores", value: "DEF" },
  { label: "Mediocampistas", value: "MED" },
  { label: "Delanteros", value: "DEL" },
];

export default function JugadoresPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FieldPosition | "TODOS">("TODOS");

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => {
    return players
      .filter((p) => p.active)
      .filter((p) => (filter === "TODOS" ? true : p.favoritePosition === filter))
      .filter((p) =>
        query
          ? p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.nickname ?? "").toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, filter, query]);

  return (
    <PageShell>
      <TopBar title="Jugadores" subtitle={`${players.filter((p) => p.active).length} en el plantel`} onBack={() => router.push("/")} />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar jugador…"
              className="w-full rounded-xl border border-line bg-white/5 py-2.5 pl-9 pr-3 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-hud text-xs uppercase tracking-wide transition",
                  filter === f.value
                    ? "border-gold/70 bg-gold/10 text-gold"
                    : "border-line text-ink-faint hover:text-ink"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando plantel…</p>
        ) : filtered.length === 0 ? (
          <p className="py-16 text-center font-hud text-ink-faint">No encontramos a nadie con ese filtro.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <PlayerListCard key={p.id} player={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
