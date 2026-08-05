"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Check, Laugh, Phone, Camera } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { FifaCard } from "@/components/players/FifaCard";
import { AttributeEditor } from "@/components/players/AttributeEditor";
import { PhotoCropper } from "@/components/players/PhotoCropper";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { computePlayerSummaries } from "@/lib/data/stats";
import { formatShortDate } from "@/lib/utils";
import { randomCargada } from "@/lib/cargadasPhrases";
import { whatsappLink } from "@/lib/whatsapp";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { dataUrlToBlob } from "@/lib/image";
import type { FieldPosition, FunnyAttributes, Player } from "@/lib/data/types";

const POSITIONS: FieldPosition[] = ["ARQ", "DEF", "MED", "DEL"];
const FEET: Player["dominantFoot"][] = ["derecha", "izquierda", "ambidiestro"];

function age(birthdate?: string | null) {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  const diff = Date.now() - b.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}

const FOOT_LABEL: Record<string, string> = {
  izquierda: "Izquierda",
  derecha: "Derecha",
  ambidiestro: "Ambidiestro",
};

function PlayerProfileContent() {
  const id = useSearchParams().get("id") ?? "";
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const matches = useAppStore((s) => s.matches);
  const updatePlayer = useAppStore((s) => s.updatePlayer);

  const [editing, setEditing] = useState(false);
  const [draftAttrs, setDraftAttrs] = useState<FunnyAttributes | null>(null);
  const [cargada, setCargada] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const player = players.find((p) => p.id === id);
  const summary = useMemo(() => {
    if (!player) return null;
    return computePlayerSummaries(players, matches).find((s) => s.player.id === id) ?? null;
  }, [players, matches, id, player]);

  useEffect(() => {
    // Randomized on purpose — not derivable from render-time state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (player) setCargada(randomCargada(player.nickname || player.name.split(" ")[0]));
  }, [player]);

  if (!hydrated) {
    return (
      <PageShell>
        <TopBar title="Jugador" onBack={() => router.back()} />
        <p className="py-20 text-center font-hud text-ink-faint">Cargando…</p>
      </PageShell>
    );
  }

  if (!player) {
    return (
      <PageShell>
        <TopBar title="Jugador" onBack={() => router.push("/jugadores")} />
        <p className="py-20 text-center font-hud text-ink-faint">No encontramos a ese jugador.</p>
      </PageShell>
    );
  }

  const attrs = draftAttrs ?? player.attributes;

  function startEdit() {
    setDraftAttrs({ ...player!.attributes });
    setEditing(true);
  }

  function saveEdit() {
    if (draftAttrs) updatePlayer(player!.id, { attributes: draftAttrs });
    setEditing(false);
    setDraftAttrs(null);
  }

  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setPendingFile(file);
  }

  async function handleCropped(dataUrl: string) {
    setPendingFile(null);
    setUploading(true);
    try {
      const sb = getSupabaseBrowserClient();
      if (isSupabaseConfigured && sb) {
        const blob = dataUrlToBlob(dataUrl);
        const path = `${player!.id}/${Date.now()}.jpg`;
        const { error } = await sb.storage.from("player-photos").upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
        if (!error) {
          const { data } = sb.storage.from("player-photos").getPublicUrl(path);
          updatePlayer(player!.id, { photoUrl: data.publicUrl });
        } else {
          updatePlayer(player!.id, { photoUrl: dataUrl });
        }
      } else {
        updatePlayer(player!.id, { photoUrl: dataUrl });
      }
    } finally {
      setUploading(false);
    }
  }

  const playerAge = age(player.birthdate);

  return (
    <PageShell>
      <TopBar
        title={player.nickname || player.name}
        subtitle={player.nickname ? player.name : player.favoritePosition}
        onBack={() => router.push("/jugadores")}
      />

      <div className="mx-auto grid max-w-5xl gap-8 px-4 pb-16 pt-6 sm:px-6 lg:grid-cols-[300px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <FifaCard player={{ ...player, attributes: attrs }} />
          <div className="flex flex-wrap justify-center gap-2">
            {!editing ? (
              <GlowButton variant="ghost" onClick={startEdit} className="flex items-center gap-2">
                <Pencil size={14} /> Editar ficha
              </GlowButton>
            ) : (
              <GlowButton variant="gold" onClick={saveEdit} className="flex items-center gap-2">
                <Check size={14} /> Guardar carta
              </GlowButton>
            )}
            <GlowButton
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Camera size={14} /> {uploading ? "Subiendo…" : "Cambiar foto"}
            </GlowButton>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhotoSelect} />
            {pendingFile && (
              <PhotoCropper file={pendingFile} onCancel={() => setPendingFile(null)} onConfirm={handleCropped} />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <GlassPanel className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3">
            {editing ? (
              <>
                <EditField label="Fecha de nacimiento">
                  <input
                    type="date"
                    defaultValue={player.birthdate ?? ""}
                    onBlur={(e) => updatePlayer(player.id, { birthdate: e.target.value || null })}
                    className="w-full rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-xs text-ink outline-none focus:border-gold/50"
                  />
                </EditField>
                <EditField label="Pierna hábil">
                  <select
                    value={player.dominantFoot}
                    onChange={(e) => updatePlayer(player.id, { dominantFoot: e.target.value as Player["dominantFoot"] })}
                    className="w-full rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-xs text-ink outline-none focus:border-gold/50"
                  >
                    {FEET.map((f) => (
                      <option key={f} value={f} className="bg-panel">
                        {FOOT_LABEL[f]}
                      </option>
                    ))}
                  </select>
                </EditField>
                <EditField label="Posición favorita">
                  <select
                    value={player.favoritePosition}
                    onChange={(e) => updatePlayer(player.id, { favoritePosition: e.target.value as FieldPosition })}
                    className="w-full rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-xs text-ink outline-none focus:border-gold/50"
                  >
                    {POSITIONS.map((pos) => (
                      <option key={pos} value={pos} className="bg-panel">
                        {pos}
                      </option>
                    ))}
                  </select>
                </EditField>
                <EditField label="Debut">
                  <input
                    type="date"
                    defaultValue={player.debutDate ?? ""}
                    onBlur={(e) => updatePlayer(player.id, { debutDate: e.target.value || null })}
                    className="w-full rounded-lg border border-line bg-white/5 px-2 py-1 font-hud text-xs text-ink outline-none focus:border-gold/50"
                  />
                </EditField>
              </>
            ) : (
              <>
                <Info label="Edad" value={playerAge ? `${playerAge} años` : "Sin definir"} />
                <Info label="Pierna hábil" value={FOOT_LABEL[player.dominantFoot]} />
                <Info label="Posición favorita" value={player.favoritePosition} />
                <Info label="Debut" value={player.debutDate ? formatShortDate(player.debutDate) : "Sin definir"} />
              </>
            )}
            <Info label="Partidos" value={String(summary?.played ?? 0)} />
            <Info label="Promedio" value={summary?.avgRating ? summary.avgRating.toFixed(1) : "—"} />
          </GlassPanel>

          {editing && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <GlassPanel className="p-5">
                <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
                  Exagerá tu carta (o no)
                </p>
                <AttributeEditor
                  attributes={attrs}
                  onChange={(key, value) =>
                    setDraftAttrs((prev) => ({ ...(prev ?? player.attributes), [key]: value }))
                  }
                />
              </GlassPanel>
            </motion.div>
          )}

          <GlassPanel className="p-5">
            <p className="mb-4 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
              Estadísticas reales
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Goles" value={summary?.goals ?? 0} />
              <Stat label="Asistencias" value={summary?.assists ?? 0} />
              <Stat label="MVP" value={summary?.mvps ?? 0} />
              <Stat label="Vallas invictas" value={summary?.cleanSheets ?? 0} />
              <Stat label="Victorias" value={summary?.wins ?? 0} />
              <Stat label="Empates" value={summary?.draws ?? 0} />
              <Stat label="Derrotas" value={summary?.losses ?? 0} />
              <Stat label="Amarillas" value={summary?.yellowCards ?? 0} />
            </div>
          </GlassPanel>

          <GlassPanel className="p-5">
            <div className="mb-3 flex items-center gap-2 font-hud text-xs uppercase tracking-[0.25em] text-ink-faint">
              <Laugh size={14} /> Mandale una cargada
            </div>
            <p className="mb-4 font-hud text-base text-ink">&ldquo;{cargada}&rdquo;</p>
            <div className="flex flex-wrap gap-2">
              <GlowButton
                variant="ghost"
                onClick={() => setCargada(randomCargada(player.nickname || player.name.split(" ")[0]))}
              >
                🎲 Otra
              </GlowButton>
              <GlowButton
                variant="cyan"
                onClick={() => window.open(whatsappLink(cargada, player.phone), "_blank")}
                className="flex items-center gap-2"
              >
                <Phone size={14} /> Enviar por WhatsApp
              </GlowButton>
            </div>
          </GlassPanel>
        </div>
      </div>
    </PageShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      <p className="mt-0.5 font-hud text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 font-hud text-[10px] uppercase tracking-[0.2em] text-ink-faint">{label}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-line bg-white/5 p-3 text-center">
      <p className="font-display text-2xl text-gold">{value}</p>
      <p className="font-hud text-[10px] uppercase tracking-wide text-ink-faint">{label}</p>
    </div>
  );
}

export default function PlayerProfilePage() {
  return (
    <Suspense fallback={<PageShell><p className="py-20 text-center font-hud text-ink-faint">Cargando…</p></PageShell>}>
      <PlayerProfileContent />
    </Suspense>
  );
}
