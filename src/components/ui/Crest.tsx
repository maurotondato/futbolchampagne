import { cn } from "@/lib/utils";

export function Crest({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 116"
      className={cn("drop-shadow-[0_0_18px_rgba(232,201,121,0.45)]", className)}
    >
      <defs>
        <linearGradient id="crestGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff6da" />
          <stop offset="45%" stopColor="#e8c979" />
          <stop offset="100%" stopColor="#a8863f" />
        </linearGradient>
        <linearGradient id="crestPitch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f5c33" />
          <stop offset="100%" stopColor="#06371f" />
        </linearGradient>
      </defs>
      <path
        d="M50 2 L96 16 V54 C96 88 76 106 50 114 C24 106 4 88 4 54 V16 Z"
        fill="url(#crestPitch)"
        stroke="url(#crestGold)"
        strokeWidth="3"
      />
      <path
        d="M50 8 L90 20 V54 C90 84 72 100 50 108 C28 100 10 84 10 54 V20 Z"
        fill="none"
        stroke="url(#crestGold)"
        strokeWidth="1"
        opacity="0.5"
      />
      <circle cx="50" cy="46" r="19" fill="none" stroke="url(#crestGold)" strokeWidth="2.5" />
      <polygon points="50,33 58,39 55,48 45,48 42,39" fill="url(#crestGold)" opacity="0.9" />
      <path d="M31 46a19 19 0 0 1 8-15" stroke="url(#crestGold)" strokeWidth="2" opacity="0.6" fill="none" />
      <text
        x="50"
        y="82"
        textAnchor="middle"
        fontFamily="var(--font-bebas), sans-serif"
        fontSize="15"
        fill="url(#crestGold)"
        letterSpacing="1"
      >
        FC
      </text>
      <text
        x="50"
        y="97"
        textAnchor="middle"
        fontFamily="var(--font-rajdhani), sans-serif"
        fontSize="7"
        fill="#e8c979"
        letterSpacing="2"
        opacity="0.85"
      >
        MARTES
      </text>
    </svg>
  );
}
