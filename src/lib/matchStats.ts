/** Generates plausible-looking match stats (posesión, tiros, corners,
 * faltas) that skew toward whichever team won and by how much — there's no
 * real data for these (nobody's tracking corners at a Tuesday kickabout),
 * but a FIFA-style result card looks empty without them. Seeded by the
 * match id so the same match always produces the same numbers instead of
 * reshuffling every time someone re-shares it. */

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export interface InventedMatchStats {
  possessionA: number;
  possessionB: number;
  shotsA: number;
  shotsB: number;
  shotsOnTargetA: number;
  shotsOnTargetB: number;
  cornersA: number;
  cornersB: number;
  foulsA: number;
  foulsB: number;
}

export function generateInventedStats(matchId: string, scoreA: number, scoreB: number): InventedMatchStats {
  const rand = mulberry32(hashSeed(matchId));
  const diff = clamp(scoreA - scoreB, -6, 6);

  const possessionA = Math.round(clamp(50 + diff * 3.5 + (rand() * 8 - 4), 32, 68));
  const possessionB = 100 - possessionA;

  const shotsA = Math.max(scoreA, Math.round(7 + diff * 1.1 + rand() * 4));
  const shotsB = Math.max(scoreB, Math.round(7 - diff * 1.1 + rand() * 4));
  const shotsOnTargetA = Math.min(shotsA, Math.max(scoreA, Math.round(shotsA * (0.35 + rand() * 0.25))));
  const shotsOnTargetB = Math.min(shotsB, Math.max(scoreB, Math.round(shotsB * (0.35 + rand() * 0.25))));

  const cornersA = Math.max(0, Math.round(3 + diff * 0.5 + rand() * 3));
  const cornersB = Math.max(0, Math.round(3 - diff * 0.5 + rand() * 3));

  const foulsA = Math.max(0, Math.round(5 - diff * 0.25 + rand() * 3));
  const foulsB = Math.max(0, Math.round(5 + diff * 0.25 + rand() * 3));

  return {
    possessionA,
    possessionB,
    shotsA,
    shotsB,
    shotsOnTargetA,
    shotsOnTargetB,
    cornersA,
    cornersB,
    foulsA,
    foulsB,
  };
}
