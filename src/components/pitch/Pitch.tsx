"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Pitch = forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
  function Pitch({ children, className }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full select-none overflow-hidden rounded-2xl border border-line shadow-[0_20px_60px_rgba(0,0,0,0.55)]",
          className
        )}
        style={{ aspectRatio: "68 / 100" }}
      >
        <div className="turf absolute inset-0" />
        <div className="vignette absolute inset-0" />
        <div className="scanline absolute inset-0 opacity-40" />

        <svg
          viewBox="0 0 68 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
        >
          <g stroke="rgba(255,255,255,0.65)" strokeWidth="0.4" fill="none">
            <rect x="1.5" y="1.5" width="65" height="97" rx="1" />
            <line x1="1.5" y1="50" x2="66.5" y2="50" />
            <circle cx="34" cy="50" r="9.15" />
            <circle cx="34" cy="50" r="0.5" fill="rgba(255,255,255,0.65)" />
            {/* Área grande superior (equipo B) */}
            <rect x="13.84" y="1.5" width="40.32" height="16.5" />
            <rect x="24.84" y="1.5" width="18.32" height="6" />
            <path d="M 27 18 A 9.15 9.15 0 0 0 41 18" />
            <circle cx="34" cy="12" r="0.5" fill="rgba(255,255,255,0.65)" />
            {/* Área grande inferior (equipo A) */}
            <rect x="13.84" y="82" width="40.32" height="16.5" />
            <rect x="24.84" y="92.5" width="18.32" height="6" />
            <path d="M 27 82 A 9.15 9.15 0 0 1 41 82" />
            <circle cx="34" cy="88" r="0.5" fill="rgba(255,255,255,0.65)" />
            {/* Arcos de córner */}
            <path d="M 1.5 3.5 A 2 2 0 0 1 3.5 1.5" />
            <path d="M 66.5 3.5 A 2 2 0 0 0 64.5 1.5" />
            <path d="M 1.5 96.5 A 2 2 0 0 0 3.5 98.5" />
            <path d="M 66.5 96.5 A 2 2 0 0 1 64.5 98.5" />
          </g>
        </svg>

        <div className="absolute inset-x-0 top-0 flex justify-center pt-1">
          <span className="font-hud text-[9px] uppercase tracking-[0.3em] text-white/25">
            Equipo B
          </span>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
          <span className="font-hud text-[9px] uppercase tracking-[0.3em] text-white/25">
            Equipo A
          </span>
        </div>

        <div className="absolute inset-0">{children}</div>
      </div>
    );
  }
);
