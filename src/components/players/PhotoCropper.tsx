"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";
import { GlowButton } from "@/components/ui/GlowButton";
import { Portal } from "@/components/ui/Portal";
import { useBodyScrollLock } from "@/lib/useBodyScrollLock";

const VIEW_SIZE = 280;
const OUTPUT_SIZE = 480;

interface Pos {
  x: number;
  y: number;
}

/** Clamps pan so the image always fully covers the (square) crop viewport —
 * never leaves a gap on any side. */
function clampPos(pos: Pos, dispW: number, dispH: number): Pos {
  const minX = Math.min(0, VIEW_SIZE - dispW);
  const minY = Math.min(0, VIEW_SIZE - dispH);
  return {
    x: Math.max(minX, Math.min(0, pos.x)),
    y: Math.max(minY, Math.min(0, pos.y)),
  };
}

export function PhotoCropper({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (dataUrl: string) => void;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const src = useMemo(() => URL.createObjectURL(file), [file]);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState<Pos>({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  useEffect(() => {
    return () => URL.revokeObjectURL(src);
  }, [src]);

  useBodyScrollLock(true);

  const baseScale = natural.w && natural.h ? VIEW_SIZE / Math.min(natural.w, natural.h) : 1;
  const scale = baseScale * zoom;
  const dispW = natural.w * scale;
  const dispH = natural.h * scale;

  function handleImgLoad() {
    const img = imgRef.current;
    if (!img) return;
    const w = img.naturalWidth;
    const h = img.naturalHeight;
    const bScale = VIEW_SIZE / Math.min(w, h);
    setNatural({ w, h });
    setPos(clampPos({ x: (VIEW_SIZE - w * bScale) / 2, y: (VIEW_SIZE - h * bScale) / 2 }, w * bScale, h * bScale));
  }

  function handlePointerDown(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y };
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPos(clampPos({ x: dragRef.current.origX + dx, y: dragRef.current.origY + dy }, dispW, dispH));
  }
  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleZoomChange(z: number) {
    const newScale = baseScale * z;
    const newDispW = natural.w * newScale;
    const newDispH = natural.h * newScale;
    // Zoom around the crop's center, not the image's top-left corner.
    setPos((prev) =>
      clampPos(
        { x: prev.x - (newDispW - dispW) / 2, y: prev.y - (newDispH - dispH) / 2 },
        newDispW,
        newDispH
      )
    );
    setZoom(z);
  }

  function handleConfirm() {
    const img = imgRef.current;
    if (!img || !natural.w) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const sx = -pos.x / scale;
    const sy = -pos.y / scale;
    const sSize = VIEW_SIZE / scale;
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onConfirm(canvas.toDataURL("image/jpeg", 0.9));
  }

  return (
    <Portal>
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="glass-strong w-full max-w-sm rounded-2xl border border-line p-5">
        <p className="mb-1 text-center font-hud text-sm uppercase tracking-wide text-ink">Ajustá la foto</p>
        <p className="mb-4 text-center font-hud text-xs text-ink-faint">Arrastrá para mover, deslizá para hacer zoom</p>
        <div
          className="relative mx-auto touch-none select-none overflow-hidden rounded-full border-2 border-gold/60"
          style={{ width: VIEW_SIZE, height: VIEW_SIZE, cursor: "grab" }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            draggable={false}
            onLoad={handleImgLoad}
            className="absolute max-w-none select-none"
            style={{ width: dispW || undefined, height: dispH || undefined, left: pos.x, top: pos.y }}
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <ZoomIn size={16} className="shrink-0 text-ink-faint" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="fc-slider flex-1"
          />
        </div>
        <div className="mt-5 flex gap-2">
          <GlowButton variant="ghost" onClick={onCancel} className="flex flex-1 items-center justify-center gap-2">
            <X size={15} /> Cancelar
          </GlowButton>
          <GlowButton variant="gold" onClick={handleConfirm} className="flex flex-1 items-center justify-center gap-2">
            <Check size={15} /> Usar foto
          </GlowButton>
        </div>
      </div>
    </div>
    </Portal>
  );
}
