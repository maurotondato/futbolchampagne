export type DominantFoot = "izquierda" | "derecha" | "ambidiestro";

export type FieldPosition = "ARQ" | "DEF" | "MED" | "DEL";

/** Posiciones fijas de la formación: 1 arquero, 3 defensores (lateral
 * izquierdo, central, lateral derecho), 2 mediocampistas, 1 delantero. */
export type SlotCode = "ARQ" | "LI" | "DFC" | "LD" | "MED1" | "MED2" | "DEL";

export interface FunnyAttributes {
  aguante: number;
  estadoFisico: number;
  llegarTarde: number;
  humo: number;
  definicion: number;
  quite: number;
  pase: number;
  iqFutbolistico: number;
  protestaArbitro: number;
  humor: number;
  garra: number;
  sangre: number;
}

export const DEFAULT_ATTRIBUTES: FunnyAttributes = {
  aguante: 70,
  estadoFisico: 70,
  llegarTarde: 50,
  humo: 50,
  definicion: 70,
  quite: 65,
  pase: 68,
  iqFutbolistico: 65,
  protestaArbitro: 55,
  humor: 75,
  garra: 72,
  sangre: 60,
};

export interface Player {
  id: string;
  name: string;
  nickname?: string;
  photoUrl?: string | null;
  /** Número de WhatsApp en formato local AR (10 dígitos, sin 0 ni 15). */
  phone?: string | null;
  birthdate?: string | null;
  dominantFoot: DominantFoot;
  favoritePosition: FieldPosition;
  debutDate?: string | null;
  attributes: FunnyAttributes;
  active: boolean;
}

export interface PlayerMatchStat {
  playerId: string;
  team: "A" | "B";
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  errors: number;
  /** Goles recibidos mientras jugó de arquero. Solo se carga si isGoalkeeper. */
  goalsAgainst: number;
  rating: number; // 1-10
  isMvp: boolean;
  isGoalkeeper: boolean;
  minutesLate: number;
}

export interface LineupSlot {
  playerId: string;
  team: "A" | "B";
  slot: SlotCode;
}

export type MatchStatus = "scheduled" | "played";

export interface MatchMedia {
  id: string;
  matchId: string;
  type: "gol" | "atajada" | "papelon";
  url: string;
  caption?: string;
  votes: number;
}

export interface Match {
  id: string;
  date: string; // ISO date
  teamAName: string;
  teamBName: string;
  teamAScore: number | null;
  teamBScore: number | null;
  status: MatchStatus;
  mvpPlayerId?: string | null;
  comments?: string;
  lineup: LineupSlot[];
  stats: PlayerMatchStat[];
  media: MatchMedia[];
}

export type AwardType =
  | "balon-de-oro"
  | "revelacion"
  | "peor-contratacion"
  | "mejor-dupla"
  | "gol-del-mes"
  | "mas-puntual"
  | "menos-puntual"
  | "mas-vendido"
  | "mas-termo"
  | "mas-picante"
  | "mas-tercer-tiempo";

export interface Award {
  id: string;
  type: AwardType;
  season: string;
  playerId?: string;
  playerIds?: string[]; // for duo awards
  note?: string;
}

export interface PlayerSummary {
  player: Player;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  mvps: number;
  cleanSheets: number;
  avgRating: number;
  /** goals / played, 0 if the player hasn't played yet */
  avgGoals: number;
  points: number;
  elo: number;
  winStreak: number;
  loseStreak: number;
  minutesPlayed: number;
  timesLate: number;
}
