import type { PlayerSummary } from "./types";
import { FORMATION_SLOTS } from "@/lib/formation";

/** Picks the best-rated player available for each formation slot's position. */
export function computeIdealXi(summaries: PlayerSummary[]) {
  const eligible = summaries.filter((s) => s.played > 0).sort((a, b) => b.avgRating - a.avgRating);
  const used = new Set<string>();

  return FORMATION_SLOTS.map((slot) => {
    const pick = eligible.find((s) => s.player.favoritePosition === slot.pos && !used.has(s.player.id));
    if (pick) used.add(pick.player.id);
    return { slot, summary: pick };
  });
}
