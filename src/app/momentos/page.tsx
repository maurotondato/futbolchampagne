"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { MediaCard } from "@/components/momentos/MediaCard";
import { MediaUploadForm } from "@/components/momentos/MediaUploadForm";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { cn } from "@/lib/utils";
import type { MatchMedia } from "@/lib/data/types";

const TABS: { value: MatchMedia["type"] | "todos"; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "gol", label: "⚽ Goles" },
  { value: "atajada", label: "🧤 Atajadas" },
  { value: "papelon", label: "🤡 Papelones" },
];

function MomentosContent() {
  const router = useRouter();
  const params = useSearchParams();
  const matchId = params.get("match");
  const { loadAll, hydrated } = useHydrateStore();
  const matches = useAppStore((s) => s.matches);
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("todos");

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const match = matchId ? matches.find((m) => m.id === matchId) : null;

  const allMedia = useMemo(() => {
    const source = match ? [match] : matches;
    return source
      .flatMap((m) => m.media.map((med) => ({ media: med, date: m.date })))
      .filter((row) => (tab === "todos" ? true : row.media.type === tab))
      .sort((a, b) => b.media.votes - a.media.votes);
  }, [match, matches, tab]);

  return (
    <PageShell>
      <TopBar
        title="Momentos"
        subtitle={match ? `${match.teamAName} vs ${match.teamBName}` : "Goles, atajadas y papelones"}
        onBack={() => router.push(match ? `/historial/detalle?id=${match.id}` : "/")}
      />
      <div className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
        {!hydrated ? (
          <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
        ) : (
          <>
            {match && (
              <GlassPanel className="p-5">
                <p className="mb-3 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                  Subir un momento de este partido
                </p>
                <MediaUploadForm matchId={match.id} />
              </GlassPanel>
            )}

            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTab(t.value)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 font-hud text-xs uppercase tracking-wide transition",
                    tab === t.value ? "border-gold/70 bg-gold/10 text-gold" : "border-line text-ink-faint hover:text-ink"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {allMedia.length === 0 ? (
              <p className="py-16 text-center font-hud text-ink-faint">
                Todavía no hay nada subido. ¡Sé el primero en inmortalizar un blooper!
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allMedia.map(({ media, date }) => (
                  <MediaCard key={media.id} media={media} matchDate={date} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

export default function MomentosPage() {
  return (
    <Suspense fallback={<PageShell><p className="py-20 text-center font-hud text-ink-faint">Cargando…</p></PageShell>}>
      <MomentosContent />
    </Suspense>
  );
}
