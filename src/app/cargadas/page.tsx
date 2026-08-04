"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shuffle } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlowButton } from "@/components/ui/GlowButton";
import { CargadaCard } from "@/components/cargadas/CargadaCard";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { randomCargada } from "@/lib/cargadasPhrases";
import { whatsappLink } from "@/lib/whatsapp";

export default function CargadasPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const [query, setQuery] = useState("");

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(
    () =>
      players
        .filter((p) => p.active)
        .filter((p) =>
          query
            ? p.name.toLowerCase().includes(query.toLowerCase()) ||
              (p.nickname ?? "").toLowerCase().includes(query.toLowerCase())
            : true
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [players, query]
  );

  function surprise() {
    const pool = players.filter((p) => p.active);
    if (pool.length === 0) return;
    const target = pool[Math.floor(Math.random() * pool.length)];
    const phrase = randomCargada(target.nickname || target.name.split(" ")[0]);
    window.open(whatsappLink(phrase, target.phone), "_blank");
  }

  return (
    <PageShell>
      <TopBar
        title="Cargadas"
        subtitle="Humor entre amigos, nunca en serio"
        onBack={() => router.push("/")}
        right={
          <GlowButton variant="gold" onClick={surprise} className="flex items-center gap-2">
            <Shuffle size={15} /> Sorpréndeme
          </GlowButton>
        }
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <div className="relative mb-5 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar jugador…"
            className="w-full rounded-xl border border-line bg-white/5 py-2.5 pl-9 pr-3 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
          />
        </div>

        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <CargadaCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
