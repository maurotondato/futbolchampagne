"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, Trash2 } from "lucide-react";
import { PageShell, TopBar } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GlowButton } from "@/components/ui/GlowButton";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { AdminGate } from "@/components/admin/AdminGate";
import { useAppStore, useHydrateStore } from "@/store/appStore";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { fileToResizedDataUrl, dataUrlToBlob } from "@/lib/image";
import { DEFAULT_ATTRIBUTES, type FieldPosition, type Player } from "@/lib/data/types";

const POSITIONS: FieldPosition[] = ["ARQ", "DEF", "MED", "DEL"];

export default function AdminJugadoresPage() {
  const router = useRouter();
  const { loadAll, hydrated } = useHydrateStore();
  const players = useAppStore((s) => s.players);
  const addPlayer = useAppStore((s) => s.addPlayer);
  const updatePlayer = useAppStore((s) => s.updatePlayer);
  const deletePlayer = useAppStore((s) => s.deletePlayer);

  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAdd() {
    if (!newName.trim()) return;
    await addPlayer({
      name: newName.trim(),
      dominantFoot: "derecha",
      favoritePosition: "MED",
      active: true,
      attributes: { ...DEFAULT_ATTRIBUTES },
    });
    setNewName("");
  }

  return (
    <PageShell>
      <TopBar title="Jugadores" subtitle="Alta, baja y edición del plantel" onBack={() => router.push("/admin")} />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-6 sm:px-6">
        <AdminGate>
          <GlassPanel className="mb-6 flex flex-wrap items-center gap-3 p-4">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Nombre y apellido del nuevo jugador…"
              className="min-w-[220px] flex-1 rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm outline-none focus:border-gold/50"
            />
            <GlowButton variant="gold" onClick={handleAdd} className="flex items-center gap-2">
              <Plus size={15} /> Agregar
            </GlowButton>
          </GlassPanel>

          {!hydrated ? (
            <p className="py-16 text-center font-hud text-ink-faint">Cargando…</p>
          ) : (
            <div className="space-y-2">
              {players.map((p) => (
                <PlayerRow key={p.id} player={p} onUpdate={updatePlayer} onDelete={deletePlayer} />
              ))}
            </div>
          )}
        </AdminGate>
      </div>
    </PageShell>
  );
}

function PlayerRow({
  player,
  onUpdate,
  onDelete,
}: {
  player: Player;
  onUpdate: (id: string, patch: Partial<Player>) => void;
  onDelete: (id: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToResizedDataUrl(file, 400);
      const sb = getSupabaseBrowserClient();
      if (isSupabaseConfigured && sb) {
        const blob = dataUrlToBlob(dataUrl);
        const path = `${player.id}/${Date.now()}.jpg`;
        const { error } = await sb.storage.from("player-photos").upload(path, blob, {
          upsert: true,
          contentType: "image/jpeg",
        });
        if (!error) {
          const { data } = sb.storage.from("player-photos").getPublicUrl(path);
          onUpdate(player.id, { photoUrl: data.publicUrl });
        } else {
          onUpdate(player.id, { photoUrl: dataUrl });
        }
      } else {
        onUpdate(player.id, { photoUrl: dataUrl });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <GlassPanel className="flex flex-wrap items-center gap-3 p-3">
      <button
        onClick={() => fileRef.current?.click()}
        className="group relative shrink-0"
        title="Subir foto"
      >
        <PlayerAvatar player={player} size={44} />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <Camera size={16} className="text-white" />
        </div>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handlePhoto} />

      <input
        defaultValue={player.name}
        onBlur={(e) => onUpdate(player.id, { name: e.target.value })}
        className="w-40 rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-sm outline-none focus:border-gold/50"
      />
      <input
        defaultValue={player.nickname ?? ""}
        placeholder="Apodo"
        onBlur={(e) => onUpdate(player.id, { nickname: e.target.value })}
        className="w-28 rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-sm outline-none placeholder:text-ink-faint focus:border-gold/50"
      />
      <input
        defaultValue={player.phone ?? ""}
        placeholder="Teléfono"
        onBlur={(e) => onUpdate(player.id, { phone: e.target.value })}
        className="w-32 rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-sm outline-none placeholder:text-ink-faint focus:border-gold/50"
      />
      <select
        value={player.favoritePosition}
        onChange={(e) => onUpdate(player.id, { favoritePosition: e.target.value as FieldPosition })}
        className="rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-sm outline-none focus:border-gold/50"
      >
        {POSITIONS.map((pos) => (
          <option key={pos} value={pos} className="bg-panel">
            {pos}
          </option>
        ))}
      </select>
      <select
        value={player.dominantFoot}
        onChange={(e) => onUpdate(player.id, { dominantFoot: e.target.value as Player["dominantFoot"] })}
        className="rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-sm outline-none focus:border-gold/50"
      >
        <option value="derecha" className="bg-panel">Derecha</option>
        <option value="izquierda" className="bg-panel">Izquierda</option>
        <option value="ambidiestro" className="bg-panel">Ambidiestro</option>
      </select>
      <input
        type="date"
        defaultValue={player.birthdate ?? ""}
        onBlur={(e) => onUpdate(player.id, { birthdate: e.target.value })}
        className="rounded-lg border border-line bg-white/5 px-2 py-1.5 font-hud text-xs outline-none focus:border-gold/50"
        title="Fecha de nacimiento"
      />
      <label className="flex items-center gap-1.5 font-hud text-xs text-ink-faint">
        <input
          type="checkbox"
          checked={player.active}
          onChange={(e) => onUpdate(player.id, { active: e.target.checked })}
          className="accent-gold"
        />
        Activo
      </label>
      <button
        onClick={() => confirm(`¿Eliminar a ${player.name}?`) && onDelete(player.id)}
        className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-ink-faint transition hover:bg-magenta/20 hover:text-magenta"
      >
        <Trash2 size={15} />
      </button>
    </GlassPanel>
  );
}
