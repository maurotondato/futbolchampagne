"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, CalendarDays, Download, Upload, Trophy } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { AdminGate } from "@/components/admin/AdminGate";
import { useAppStore, useHydrateStore } from "@/store/appStore";

export default function AdminPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const awards = useAppStore((s) => s.awards);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function handleExport() {
    const data = JSON.stringify({ players, matches, awards }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `futbol-champagne-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportClick() {
    fileRef.current?.click();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (parsed.players && parsed.matches) {
        useAppStore.setState({
          players: parsed.players,
          matches: parsed.matches,
          awards: parsed.awards ?? [],
        });
        alert("Datos importados en este navegador.");
      } else {
        alert("El archivo no tiene el formato esperado.");
      }
    } catch {
      alert("No se pudo leer el archivo.");
    } finally {
      e.target.value = "";
    }
  }

  return (
    <PageShell>
      <TopBar title="Administración" subtitle="Panel de control" onBack={() => router.push("/")} />
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">
        <AdminGate>
          {!hydrated ? (
            <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <AdminLink href="/admin/jugadores" icon={Users} label="Jugadores" caption={`${players.length} en el plantel`} />
                <AdminLink href="/admin/partidos" icon={CalendarDays} label="Partidos" caption={`${matches.length} cargados`} />
                <AdminLink href="/premios" icon={Trophy} label="Premios" caption="Gestionar temporada" />
              </div>

              <GlassPanel className="p-5">
                <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                  Exportar / Importar datos
                </p>
                <div className="flex flex-wrap gap-3">
                  <GlowButton variant="ghost" onClick={handleExport} className="flex items-center gap-2">
                    <Download size={15} /> Exportar JSON
                  </GlowButton>
                  <GlowButton variant="ghost" onClick={handleImportClick} className="flex items-center gap-2">
                    <Upload size={15} /> Importar JSON
                  </GlowButton>
                  <input ref={fileRef} type="file" accept="application/json" hidden onChange={handleImportFile} />
                </div>
              </GlassPanel>
            </div>
          )}
        </AdminGate>
      </div>
    </PageShell>
  );
}

function AdminLink({
  href,
  icon: Icon,
  label,
  caption,
}: {
  href: string;
  icon: typeof Users;
  label: string;
  caption: string;
}) {
  return (
    <Link href={href}>
      <div className="glass flex flex-col gap-2 rounded-2xl border border-line p-5 transition hover:border-gold/50">
        <Icon size={22} className="text-gold" />
        <p className="font-display text-xl text-ink">{label}</p>
        <p className="font-hud text-xs text-ink-faint">{caption}</p>
      </div>
    </Link>
  );
}
