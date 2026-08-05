"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AdminGate } from "@/components/admin/AdminGate";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { formatDate } from "@/lib/utils";
import { nextMatchISODate } from "@/lib/matchDay";

export default function AdminPartidosPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const matches = useAppStore((s) => s.matches);
  const addMatch = useAppStore((s) => s.addMatch);
  const deleteMatch = useAppStore((s) => s.deleteMatch);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const sorted = [...matches].sort((a, b) => b.date.localeCompare(a.date));

  async function handleNew() {
    const m = await addMatch({
      date: nextMatchISODate(),
      teamAName: "Equipo Rojo",
      teamBName: "Equipo Azul",
      teamAScore: null,
      teamBScore: null,
      status: "scheduled",
    });
    router.push(`/historial/detalle?id=${m.id}`);
  }

  return (
    <PageShell>
      <TopBar
        title="Partidos"
        subtitle="Cargar, editar o borrar fechas"
        onBack={() => router.push("/admin")}
        right={
          <GlowButton variant="gold" onClick={handleNew} className="flex items-center gap-2">
            <Plus size={15} /> Nuevo
          </GlowButton>
        }
      />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <AdminGate>
          {!hydrated ? (
            <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
          ) : (
            <div className="space-y-2">
              {sorted.map((m) => (
                <GlassPanel key={m.id} className="flex items-center justify-between gap-3 p-3">
                  <Link href={`/historial/detalle?id=${m.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-hud text-sm font-semibold text-ink">
                        {m.teamAName} vs {m.teamBName}
                      </p>
                      <p className="font-hud text-[11px] uppercase tracking-wide text-ink-faint">
                        {formatDate(m.date)} · {m.status === "played" ? `${m.teamAScore}-${m.teamBScore}` : "Pendiente"}
                      </p>
                    </div>
                    <ChevronRight size={16} className="ml-auto shrink-0 text-ink-faint" />
                  </Link>
                  <button
                    onClick={() => confirm("¿Eliminar este partido?") && deleteMatch(m.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-faint transition hover:bg-magenta/20 hover:text-magenta"
                  >
                    <Trash2 size={15} />
                  </button>
                </GlassPanel>
              ))}
            </div>
          )}
        </AdminGate>
      </div>
    </PageShell>
  );
}
