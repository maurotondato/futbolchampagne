import type { FieldPosition, SlotCode } from "./data/types";

export interface FormationSlot {
  code: SlotCode;
  label: string;
  pos: FieldPosition;
  x: number;
  y: number;
}

/** 1 arquero, 3 defensores (LI - central - LD), 2 mediocampistas, 1 delantero.
 * Coordenadas para el equipo A (mitad inferior, ataca hacia arriba). El
 * equipo B usa las mismas x con la y espejada. */
// Las coordenadas evitan que dos posiciones (de cualquiera de los dos
// equipos) compartan columna y queden muy cerca en el eje vertical — con
// ambos equipos espejados en una sola cancha, cualquier x repetida entre
// equipos se traduce en avatares superpuestos cerca del medio.
export const FORMATION_SLOTS: FormationSlot[] = [
  { code: "ARQ", label: "ARQ", pos: "ARQ", x: 50, y: 94 },
  { code: "LI", label: "LI", pos: "DEF", x: 15, y: 76 },
  { code: "DFC", label: "DFC", pos: "DEF", x: 50, y: 78 },
  { code: "LD", label: "LD", pos: "DEF", x: 85, y: 76 },
  { code: "MED1", label: "MED", pos: "MED", x: 30, y: 60 },
  { code: "MED2", label: "MED", pos: "MED", x: 70, y: 60 },
  { code: "DEL", label: "DEL", pos: "DEL", x: 50, y: 58 },
];

export function mirrorY(y: number) {
  return 100 - y;
}

export function slotByCode(code: SlotCode): FormationSlot {
  const found = FORMATION_SLOTS.find((s) => s.code === code);
  if (!found) throw new Error(`Unknown slot code: ${code}`);
  return found;
}

export function slotCoords(code: SlotCode, team: "A" | "B") {
  const s = slotByCode(code);
  return { x: s.x, y: team === "A" ? s.y : mirrorY(s.y) };
}
