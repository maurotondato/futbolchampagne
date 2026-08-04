"use client";

import { ATTRIBUTE_META } from "@/lib/data/attributeMeta";
import type { FunnyAttributes } from "@/lib/data/types";

export function AttributeEditor({
  attributes,
  onChange,
}: {
  attributes: FunnyAttributes;
  onChange: (key: keyof FunnyAttributes, value: number) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {ATTRIBUTE_META.map((meta) => (
        <div key={meta.key}>
          <div className="mb-1 flex items-center justify-between font-hud text-xs uppercase tracking-wide text-ink-dim">
            <span>
              {meta.emoji} {meta.label}
            </span>
            <span className="text-gold">{attributes[meta.key]}</span>
          </div>
          <input
            type="range"
            min={1}
            max={99}
            value={attributes[meta.key]}
            onChange={(e) => onChange(meta.key, Number(e.target.value))}
            className="fc-slider w-full"
          />
        </div>
      ))}
    </div>
  );
}
