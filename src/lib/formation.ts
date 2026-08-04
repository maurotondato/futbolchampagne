import type { FieldPosition } from "./data/types";

export const FORMATION_7: { pos: FieldPosition; x: number; y: number }[] = [
  { pos: "ARQ", x: 50, y: 94 },
  { pos: "DEF", x: 22, y: 78 },
  { pos: "DEF", x: 78, y: 78 },
  { pos: "MED", x: 30, y: 64 },
  { pos: "MED", x: 70, y: 64 },
  { pos: "DEL", x: 40, y: 54 },
  { pos: "DEL", x: 60, y: 54 },
];

export function mirrorY(y: number) {
  return 100 - y;
}
