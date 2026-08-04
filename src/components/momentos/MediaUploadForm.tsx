"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { useAppStore } from "@/store/appStore";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { dataUrlToBlob, fileToResizedDataUrl } from "@/lib/image";
import type { MatchMedia } from "@/lib/data/types";
import { cn } from "@/lib/utils";

const TYPES: { value: MatchMedia["type"]; label: string; emoji: string }[] = [
  { value: "gol", label: "Gol", emoji: "⚽" },
  { value: "atajada", label: "Atajada", emoji: "🧤" },
  { value: "papelon", label: "Papelón", emoji: "🤡" },
];

export function MediaUploadForm({ matchId }: { matchId: string }) {
  const addMedia = useAppStore((s) => s.addMedia);
  const [type, setType] = useState<MatchMedia["type"]>("gol");
  const [caption, setCaption] = useState("");
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      if (isSupabaseConfigured) {
        const sb = getSupabaseBrowserClient();
        const path = `${matchId}/${Date.now()}-${file.name}`;
        const { error } = await sb!.storage.from("match-media").upload(path, file, { upsert: true });
        if (!error) {
          const { data } = sb!.storage.from("match-media").getPublicUrl(path);
          await addMedia(matchId, { type, url: data.publicUrl, caption });
          setCaption("");
        }
      } else if (file.type.startsWith("image/")) {
        const dataUrl = await fileToResizedDataUrl(file, 900);
        void dataUrlToBlob; // reserved for future direct-upload path
        await addMedia(matchId, { type, url: dataUrl, caption });
        setCaption("");
      } else {
        alert("Para subir videos directo desde acá, conectá Supabase. Mientras tanto pegá un link.");
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleUrlAdd() {
    if (!url.trim()) return;
    await addMedia(matchId, { type, url: url.trim(), caption });
    setUrl("");
    setCaption("");
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-line p-4">
      <div className="flex gap-2">
        {TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-hud text-xs uppercase tracking-wide transition",
              type === t.value ? "border-gold/70 bg-gold/10 text-gold" : "border-line text-ink-faint"
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Descripción (opcional)"
        className="w-full rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm outline-none placeholder:text-ink-faint focus:border-gold/50"
      />
      <div className="flex flex-wrap gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Pegá un link (video o imagen)…"
          className="min-w-[200px] flex-1 rounded-lg border border-line bg-white/5 px-3 py-2 font-hud text-sm outline-none placeholder:text-ink-faint focus:border-gold/50"
        />
        <GlowButton variant="ghost" onClick={handleUrlAdd} disabled={!url.trim()}>
          Agregar link
        </GlowButton>
        <GlowButton
          variant="gold"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          <Upload size={14} /> {uploading ? "Subiendo…" : "Subir archivo"}
        </GlowButton>
        <input ref={fileRef} type="file" accept="image/*,video/*" hidden onChange={handleFile} />
      </div>
    </div>
  );
}
