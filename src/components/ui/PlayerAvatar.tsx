import { cn, initials } from "@/lib/utils";
import { withBasePath } from "@/lib/basePath";
import type { Player } from "@/lib/data/types";

const GRADIENTS = [
  "from-[#3a7bff] to-[#0b2a6b]",
  "from-[#35e2e2] to-[#0a5f5f]",
  "from-[#e8c979] to-[#7a5c1e]",
  "from-[#ff3d7f] to-[#6b0f30]",
  "from-[#22e07f] to-[#0d5c30]",
  "from-[#b48cff] to-[#3d2170]",
];

export function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

const CSS_GRADIENTS: Record<string, [string, string]> = {
  "from-[#3a7bff] to-[#0b2a6b]": ["#3a7bff", "#0b2a6b"],
  "from-[#35e2e2] to-[#0a5f5f]": ["#35e2e2", "#0a5f5f"],
  "from-[#e8c979] to-[#7a5c1e]": ["#e8c979", "#7a5c1e"],
  "from-[#ff3d7f] to-[#6b0f30]": ["#ff3d7f", "#6b0f30"],
  "from-[#22e07f] to-[#0d5c30]": ["#22e07f", "#0d5c30"],
  "from-[#b48cff] to-[#3d2170]": ["#b48cff", "#3d2170"],
};

/** CSS-string gradient (for contexts like html-to-image capture that don't run Tailwind). */
export function cssGradientFor(id: string) {
  const [from, to] = CSS_GRADIENTS[gradientFor(id)];
  return `linear-gradient(160deg, ${from}, ${to})`;
}

export function PlayerAvatar({
  player,
  size = 48,
  className,
  ring,
}: {
  player: Pick<Player, "id" | "name" | "photoUrl">;
  size?: number;
  className?: string;
  ring?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 bg-gradient-to-br font-display text-ink shadow-inner",
        gradientFor(player.id),
        ring ?? "border-white/20",
        className
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {player.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={withBasePath(player.photoUrl)}
          alt={player.name}
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="drop-shadow">{initials(player.name)}</span>
      )}
    </div>
  );
}
