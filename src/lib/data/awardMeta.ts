import type { AwardType } from "./types";

export const AWARD_META: { type: AwardType; emoji: string; label: string; dual?: boolean }[] = [
  { type: "balon-de-oro", emoji: "🏆", label: "Balón de Oro" },
  { type: "revelacion", emoji: "🌟", label: "Jugador revelación" },
  { type: "peor-contratacion", emoji: "🪦", label: "Peor contratación del año" },
  { type: "mejor-dupla", emoji: "🤝", label: "Mejor dupla", dual: true },
  { type: "gol-del-mes", emoji: "🎯", label: "Gol del mes" },
  { type: "mas-puntual", emoji: "⏰", label: "Jugador más puntual" },
  { type: "menos-puntual", emoji: "🐌", label: "Jugador más impuntual" },
  { type: "mas-vendido", emoji: "💸", label: "Jugador más vendido" },
  { type: "mas-termo", emoji: "🥶", label: "Jugador más termo" },
  { type: "mas-picante", emoji: "🌶", label: "Jugador más picante" },
  { type: "mas-tercer-tiempo", emoji: "🍻", label: "Rey del tercer tiempo" },
];
