"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Loader2 } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { ResultGraphic } from "./ResultGraphic";
import type { Match, Player } from "@/lib/data/types";
import { whatsappLink } from "@/lib/whatsapp";
import { captureNodeToPng } from "@/lib/captureNode";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";
import { Portal } from "@/components/ui/Portal";

export function ShareResultButton({
  match,
  players,
}: {
  match: Match;
  players: Player[];
}) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useBodyScrollLock(open);

  async function handleShareClick() {
    setOpen(true);
    setLoading(true);
    setError(false);
    setImgUrl(null);
    try {
      const node = nodeRef.current;
      if (!node) throw new Error("no node");
      const dataUrl = await captureNodeToPng(node);
      setImgUrl(dataUrl);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `futbol-champagne-resultado-${match.date}.png`;
    a.click();
  }

  async function handleNativeShare() {
    if (!imgUrl) return;
    try {
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const file = new File([blob], `futbol-champagne-resultado-${match.date}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Fútbol Champagne de los Martes",
          text: `${match.teamAName} ${match.teamAScore} - ${match.teamBScore} ${match.teamBName}`,
        });
        return;
      }
    } catch {
      // fall through to WhatsApp text link below
    }
    window.open(
      whatsappLink(
        `🍾⚽ ${match.teamAName} ${match.teamAScore} - ${match.teamBScore} ${match.teamBName}. Descargá la imagen y mandala al grupo`
      ),
      "_blank"
    );
  }

  return (
    <>
      <GlowButton variant="cyan" onClick={handleShareClick} className="flex items-center gap-2">
        <Share2 size={16} /> Compartir por WhatsApp
      </GlowButton>

      {/* Hidden full-resolution node used purely for capture */}
      <div style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }} aria-hidden>
        <ResultGraphic ref={nodeRef} match={match} players={players} />
      </div>

      <Portal>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative max-h-[90vh] w-full max-w-sm overflow-y-auto rounded-2xl border border-line p-4"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-ink hover:bg-white/20"
              >
                <X size={16} />
              </button>

              {loading && (
                <div className="flex h-80 flex-col items-center justify-center gap-3 text-ink-dim">
                  <Loader2 className="animate-spin" size={28} />
                  <p className="font-hud text-xs uppercase tracking-wider">Generando gráfica…</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex h-80 flex-col items-center justify-center gap-2 text-center text-ink-dim">
                  <p className="font-hud text-sm">No se pudo generar la imagen.</p>
                  <button onClick={handleShareClick} className="text-cyan underline">
                    Reintentar
                  </button>
                </div>
              )}

              {imgUrl && !loading && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgUrl} alt="Resultado" className="w-full rounded-xl border border-line" />
                  <div className="mt-4 flex gap-2">
                    <GlowButton variant="ghost" onClick={handleDownload} className="flex flex-1 items-center justify-center gap-2">
                      <Download size={16} /> Descargar
                    </GlowButton>
                    <GlowButton variant="cyan" onClick={handleNativeShare} className="flex flex-1 items-center justify-center gap-2">
                      <Share2 size={16} /> WhatsApp
                    </GlowButton>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </Portal>
    </>
  );
}
