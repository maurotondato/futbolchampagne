/** Formato de equipo elegido al crear el grupo — determina tamaño de
 * plantel, suplentes disponibles y la formación táctica disponible. */
export type TeamFormat = "7-amistoso" | "7-torneo" | "11-torneo";

export interface TeamFormatConfig {
  id: TeamFormat;
  label: string;
  squadSize: number; // titulares en cancha por equipo
  benchSize: number; // suplentes habilitados
}

/** "amigos": el grupo arma y controla los dos equipos de cada partido
 * (como la app hoy). "club": el grupo controla un solo plantel propio y
 * juega contra rivales externos (torneo/equipo amateur o profesional). El
 * modo se deriva del formato, no se pregunta por separado. */
export type TeamMode = "amigos" | "club";

export const TEAM_FORMATS: Record<TeamFormat, TeamFormatConfig & { mode: TeamMode }> = {
  "7-amistoso": { id: "7-amistoso", label: "Fútbol 7 · Amistoso entre amigos", squadSize: 7, benchSize: 3, mode: "amigos" },
  "7-torneo": { id: "7-torneo", label: "Fútbol 7 · Torneo", squadSize: 7, benchSize: 5, mode: "club" },
  "11-torneo": { id: "11-torneo", label: "Fútbol 11 · Torneo", squadSize: 11, benchSize: 7, mode: "club" },
};

export function modeForFormat(format: TeamFormat): TeamMode {
  return TEAM_FORMATS[format].mode;
}

/** "humor": atributos y contenido en joda (como la app hoy: Cargadas,
 * premios tipo "más termo", atributos como Humo o Garra). "serio":
 * atributos reales de fútbol, sin Cargadas ni premios en joda — pensado
 * para equipos amateurs o profesionales que quieren una herramienta seria. */
export type TeamTone = "humor" | "serio";

/** Módulos opcionales de la app. Cada grupo elige cuáles quiere en el
 * cuestionario de alta (con un preset según el modo) y los puede prender o
 * apagar después desde Configuración — nada de esto es fijo. */
export type FeatureKey =
  | "enfermeria"
  | "viaticos"
  | "multas"
  | "cuotas"
  | "entrenamientos"
  | "convocatoria"
  | "camposPersonalizados"
  | "sponsors"
  | "multiEquipo"
  | "tablaPosiciones"
  | "calendarioUnificado"
  | "reservaCancha";

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  enfermeria: "Enfermería (lesionados y apto físico)",
  viaticos: "Viáticos (gastos compartidos)",
  multas: "Multas internas",
  cuotas: "Cuotas de socio",
  entrenamientos: "Entrenamientos",
  convocatoria: "Convocatoria a partido",
  camposPersonalizados: "Campos personalizados en la ficha",
  sponsors: "Auspiciantes / sponsors",
  multiEquipo: "Múltiples equipos/categorías bajo un mismo club",
  tablaPosiciones: "Tabla de posiciones del torneo (carga manual)",
  calendarioUnificado: "Calendario único (partidos + entrenamientos)",
  reservaCancha: "Reserva de cancha",
};

export type GroupFeatures = Record<FeatureKey, boolean>;

export const DEFAULT_FEATURES_BY_MODE: Record<TeamMode, GroupFeatures> = {
  amigos: {
    enfermeria: true,
    viaticos: true,
    multas: false,
    cuotas: false,
    entrenamientos: false,
    convocatoria: false,
    camposPersonalizados: false,
    sponsors: false,
    multiEquipo: false,
    tablaPosiciones: false,
    calendarioUnificado: false,
    reservaCancha: false,
  },
  club: {
    enfermeria: true,
    viaticos: true,
    multas: true,
    cuotas: true,
    entrenamientos: true,
    convocatoria: true,
    camposPersonalizados: true,
    sponsors: true,
    multiEquipo: false,
    tablaPosiciones: true,
    calendarioUnificado: true,
    reservaCancha: true,
  },
};

export type GroupPlan = "free" | "pro";

/** Paraguas opcional para clubes con más de un equipo/categoría (primera,
 * reserva, sub-15, femenino...). Cada categoría sigue siendo un Group
 * independiente (su propio plantel, partidos, etc.) que referencia la
 * misma Organization para compartir escudo, nombre de club y sponsors. */
export interface Organization {
  id: string;
  name: string;
  crestUrl?: string | null;
}

export interface Group {
  id: string;
  organizationId?: string | null;
  name: string;
  slug: string;
  /** Código corto para que el resto del plantel se sume al grupo sin que
   * un admin los tenga que dar de alta a mano uno por uno. */
  inviteCode: string;
  crestUrl?: string | null;
  format: TeamFormat;
  tone: TeamTone;
  plan: GroupPlan;
  features: GroupFeatures;
  createdAt: string;
}

export type GroupRole = "admin" | "member";

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  joinedAt: string;
}

export type StaffRole = "dt" | "ayudante-de-campo" | "preparador-fisico" | "kinesiologo" | "otro";

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  dt: "Director técnico",
  "ayudante-de-campo": "Ayudante de campo",
  "preparador-fisico": "Preparador físico",
  kinesiologo: "Kinesiólogo/a",
  otro: "Otro",
};

export interface StaffMember {
  id: string;
  groupId: string;
  name: string;
  role: StaffRole;
  photoUrl?: string | null;
  notes?: string;
}

export type ExpenseCategory = "gasto" | "cancha";

export interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidByPlayerId: string;
  date: string; // ISO date
  /** IDs de jugadores entre los que se divide el gasto. */
  splitAmong: string[];
}

/** Multas y cuotas de socio: a diferencia de Expense (uno paga y se
 * divide entre varios), acá cada jugador le debe un monto fijo al grupo.
 * "cuota" además lleva `period` (ej. "2026-08") para las mensualidades. */
export type PlayerChargeType = "multa" | "cuota";

export interface PlayerCharge {
  id: string;
  groupId: string;
  playerId: string;
  type: PlayerChargeType;
  description: string;
  amount: number;
  period?: string | null;
  date: string; // ISO date
  paid: boolean;
  paidDate?: string | null;
}

export interface Sponsor {
  id: string;
  groupId: string;
  name: string;
  logoUrl?: string | null;
  linkUrl?: string | null;
}

/** Un pago puntual que salda (total o parcialmente) lo que un jugador le
 * debe a otro por gastos compartidos. */
export interface ExpenseSettlement {
  id: string;
  groupId: string;
  fromPlayerId: string;
  toPlayerId: string;
  amount: number;
  date: string; // ISO date
  note?: string;
}

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

/** Atributos reales de fútbol, para grupos con tono "serio" (equipos
 * amateurs/profesionales que no quieren la joda de FunnyAttributes). Misma
 * escala 0-99 y misma cantidad de campos, para que el cálculo de OVR y el
 * resto de la ficha funcionen igual sin importar el tono del grupo. */
export interface SeriousAttributes {
  velocidad: number;
  resistencia: number;
  tecnica: number;
  definicion: number;
  pase: number;
  vision: number;
  marca: number;
  fisico: number;
  cabeceo: number;
  atajada: number;
  liderazgo: number;
  regularidad: number;
}

export const DEFAULT_SERIOUS_ATTRIBUTES: SeriousAttributes = {
  velocidad: 70,
  resistencia: 70,
  tecnica: 68,
  definicion: 65,
  pase: 68,
  vision: 65,
  marca: 65,
  fisico: 70,
  cabeceo: 60,
  atajada: 50,
  liderazgo: 60,
  regularidad: 70,
};

/** Campos de ficha configurables por grupo/DT, además de los fijos
 * (nombre, apodo, foto, teléfono, fecha de nacimiento) que ya tiene todo
 * jugador porque el resto de la app depende de ellos. Cada grupo arranca
 * con DEFAULT_PLAYER_FIELDS y puede agregar, sacar o renombrar libremente. */
export type PlayerFieldType = "text" | "number" | "date" | "boolean" | "select";

export interface PlayerFieldDefinition {
  id: string;
  groupId: string;
  key: string; // slug único dentro del grupo, ej. "direccion"
  label: string;
  type: PlayerFieldType;
  options?: string[]; // solo para type: "select"
  order: number;
}

export const DEFAULT_PLAYER_FIELDS: Omit<PlayerFieldDefinition, "id" | "groupId">[] = [
  { key: "direccion", label: "Dirección", type: "text", order: 0 },
  { key: "peso", label: "Peso (kg)", type: "number", order: 1 },
  { key: "altura", label: "Altura (cm)", type: "number", order: 2 },
  { key: "contactoEmergencia", label: "Contacto de emergencia", type: "text", order: 3 },
  {
    key: "grupoSanguineo",
    label: "Grupo sanguíneo",
    type: "select",
    options: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    order: 4,
  },
];

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
  /** Valores de los campos configurables (PlayerFieldDefinition.key -> valor). */
  customFields?: Record<string, string | number | boolean | null>;
  /** ISO date de vencimiento del apto físico, si el grupo lleva ese control. */
  fitnessCertExpiry?: string | null;
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
  /** Solo en modo "club": nombre del rival externo (sin plantel cargado en
   * la app) y a qué temporada/torneo pertenece el partido, para agrupar el
   * resumen de campaña. En modo "amigos" quedan sin usar. */
  rivalName?: string | null;
  isHome?: boolean | null;
  season?: string | null;
}

/** Fila de la tabla de posiciones general de un torneo, cargada a mano por
 * el usuario (la app no tiene forma de conocer los resultados de los
 * partidos entre otros equipos, así que no se calcula sola). */
export interface LeagueStandingRow {
  id: string;
  groupId: string;
  season: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  /** Orden manual en la tabla (posición), por si el usuario quiere fijarlo
   * en vez de que se ordene solo por puntos. */
  position?: number | null;
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

export interface Injury {
  id: string;
  playerId: string;
  injuryName: string;
  /** ISO date the injury was reported. */
  startDate: string;
  /** ISO date of estimated return — null if unknown. */
  estimatedReturnDate?: string | null;
  notes?: string;
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

/** Sesión de entrenamiento (pensado para equipos que entrenan aparte de
 * jugar el partido/torneo). El aviso al plantel se resuelve generando un
 * mensaje de WhatsApp con estos datos, igual que el resto de la app — no
 * hay notificaciones push hasta la fase de la app nativa. */
export interface TrainingSession {
  id: string;
  groupId: string;
  date: string; // ISO date
  time?: string | null; // "19:30"
  location?: string | null;
  /** Qué se va a trabajar / de qué se trata la práctica. */
  notes?: string | null;
  /** Qué tienen que llevar (botines de campo, canilleras, etc.), opcional. */
  bringItems?: string | null;
}

export type RsvpStatus = "va" | "no-va" | "sin-responder";

/** Confirmación de asistencia, tanto para entrenamientos como para la
 * convocatoria a un partido — mismo mecanismo, distinto `context`. */
export type RsvpContext = "entrenamiento" | "partido";

export interface Rsvp {
  id: string;
  groupId: string;
  context: RsvpContext;
  /** trainingSessionId o matchId según `context`. */
  contextId: string;
  playerId: string;
  status: RsvpStatus;
  respondedAt?: string | null;
}
