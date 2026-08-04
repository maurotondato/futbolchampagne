"use client";

import { motion } from "framer-motion";
import { ArrowBigUp } from "lucide-react";
import { useAppStore } from "@/store/appStore";
import { formatShortDate } from "@/lib/utils";
import type { MatchMedia } from "@/lib/data/types";

const TYPE_LABEL: Record<MatchMedia["type"], { label: string; emoji: string }> = {
  gol: { label: "Gol", emoji: "⚽" },
  atajada: { label: "Atajada", emoji: "🧤" },
  papelon: { label: "Papelón", emoji: "🤡" },
};

function isVideo(url: string) {
  return /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.startsWith("data:video");
}

export function MediaCard({ media, matchDate }: { media: MatchMedia; matchDate?: string }) {
  const voteMedia = useAppStore((s) => s.voteMedia);
  const meta = TYPE_LABEL[media.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass overflow-hidden rounded-2xl border border-line"
    >
      <div className="relative aspect-video bg-black/40">
        {media.url ? (
          isVideo(media.url) ? (
            <video src={media.url} controls className="h-full w-full object-cover" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={media.url} alt={media.caption ?? meta.label} className="h-full w-full object-cover" />
          )
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">{meta.emoji}</div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2.5 py-1 font-hud text-[10px] uppercase tracking-wide text-white">
          {meta.emoji} {meta.label}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate font-hud text-sm text-ink">{media.caption || "Sin descripción"}</p>
          {matchDate && (
            <p className="font-hud text-[10px] uppercase tracking-wide text-ink-faint">
              {formatShortDate(matchDate)}
            </p>
          )}
        </div>
        <button
          onClick={() => voteMedia(media.matchId, media.id, 1)}
          className="flex shrink-0 flex-col items-center rounded-lg border border-line px-2.5 py-1 text-gold transition hover:border-gold/60"
        >
          <ArrowBigUp size={16} />
          <span className="font-hud text-xs font-bold">{media.votes}</span>
        </button>
      </div>
    </motion.div>
  );
}
