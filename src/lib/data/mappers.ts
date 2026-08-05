import type {
  Award,
  AwardType,
  DominantFoot,
  FieldPosition,
  LineupSlot,
  Match,
  MatchMedia,
  MatchStatus,
  Player,
  PlayerMatchStat,
} from "./types";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function playerFromRow(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname ?? undefined,
    phone: row.phone ?? null,
    photoUrl: row.photo_url,
    birthdate: row.birthdate,
    dominantFoot: (row.dominant_foot ?? "derecha") as DominantFoot,
    favoritePosition: (row.favorite_position ?? "MED") as FieldPosition,
    debutDate: row.debut_date,
    active: row.active ?? true,
    attributes: {
      aguante: row.aguante ?? 70,
      estadoFisico: row.estado_fisico ?? 70,
      llegarTarde: row.llegar_tarde ?? 50,
      humo: row.humo ?? 50,
      definicion: row.definicion ?? 70,
      quite: row.quite ?? 65,
      pase: row.pase ?? 68,
      iqFutbolistico: row.iq_futbolistico ?? 65,
      protestaArbitro: row.protesta_arbitro ?? 55,
      humor: row.humor ?? 75,
      garra: row.garra ?? 72,
      sangre: row.sangre ?? 60,
    },
  };
}

export function playerToRow(p: Partial<Player>) {
  const row: Record<string, unknown> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.nickname !== undefined) row.nickname = p.nickname || null;
  if (p.phone !== undefined) row.phone = p.phone || null;
  if (p.photoUrl !== undefined) row.photo_url = p.photoUrl;
  if (p.birthdate !== undefined) row.birthdate = p.birthdate || null;
  if (p.dominantFoot !== undefined) row.dominant_foot = p.dominantFoot;
  if (p.favoritePosition !== undefined) row.favorite_position = p.favoritePosition;
  if (p.debutDate !== undefined) row.debut_date = p.debutDate || null;
  if (p.active !== undefined) row.active = p.active;
  if (p.attributes) {
    row.aguante = p.attributes.aguante;
    row.estado_fisico = p.attributes.estadoFisico;
    row.llegar_tarde = p.attributes.llegarTarde;
    row.humo = p.attributes.humo;
    row.definicion = p.attributes.definicion;
    row.quite = p.attributes.quite;
    row.pase = p.attributes.pase;
    row.iq_futbolistico = p.attributes.iqFutbolistico;
    row.protesta_arbitro = p.attributes.protestaArbitro;
    row.humor = p.attributes.humor;
    row.garra = p.attributes.garra;
    row.sangre = p.attributes.sangre;
  }
  return row;
}

export function matchFromRow(
  row: any,
  lineup: LineupSlot[],
  stats: PlayerMatchStat[],
  media: MatchMedia[]
): Match {
  return {
    id: row.id,
    date: row.date,
    teamAName: row.team_a_name,
    teamBName: row.team_b_name,
    teamAScore: row.team_a_score,
    teamBScore: row.team_b_score,
    status: row.status as MatchStatus,
    mvpPlayerId: row.mvp_player_id,
    comments: row.comments ?? undefined,
    lineup,
    stats,
    media,
  };
}

export function matchToRow(m: Partial<Match>) {
  const row: Record<string, unknown> = {};
  if (m.date !== undefined) row.date = m.date;
  if (m.teamAName !== undefined) row.team_a_name = m.teamAName;
  if (m.teamBName !== undefined) row.team_b_name = m.teamBName;
  if (m.teamAScore !== undefined) row.team_a_score = m.teamAScore;
  if (m.teamBScore !== undefined) row.team_b_score = m.teamBScore;
  if (m.status !== undefined) row.status = m.status;
  if (m.mvpPlayerId !== undefined) row.mvp_player_id = m.mvpPlayerId || null;
  if (m.comments !== undefined) row.comments = m.comments;
  return row;
}

export function lineupFromRow(row: any): LineupSlot {
  return {
    playerId: row.player_id,
    team: row.team,
    slot: row.slot,
  };
}

export function statFromRow(row: any): PlayerMatchStat {
  return {
    playerId: row.player_id,
    team: row.team,
    goals: row.goals ?? 0,
    assists: row.assists ?? 0,
    yellowCards: row.yellow_cards ?? 0,
    redCards: row.red_cards ?? 0,
    saves: row.saves ?? 0,
    errors: row.errors ?? 0,
    goalsAgainst: row.goals_against ?? 0,
    rating: Number(row.rating ?? 6),
    isMvp: row.is_mvp ?? false,
    isGoalkeeper: row.is_goalkeeper ?? false,
    minutesLate: row.minutes_late ?? 0,
  };
}

export function statToRow(matchId: string, s: PlayerMatchStat) {
  return {
    match_id: matchId,
    player_id: s.playerId,
    team: s.team,
    goals: s.goals,
    assists: s.assists,
    yellow_cards: s.yellowCards,
    red_cards: s.redCards,
    saves: s.saves,
    errors: s.errors,
    goals_against: s.goalsAgainst,
    rating: s.rating,
    is_mvp: s.isMvp,
    is_goalkeeper: s.isGoalkeeper,
    minutes_late: s.minutesLate,
  };
}

export function mediaFromRow(row: any): MatchMedia {
  return {
    id: row.id,
    matchId: row.match_id,
    type: row.type,
    url: row.url,
    caption: row.caption ?? undefined,
    votes: row.votes ?? 0,
  };
}

export function awardFromRow(row: any): Award {
  return {
    id: row.id,
    type: row.type as AwardType,
    season: row.season,
    playerId: row.player_id ?? undefined,
    playerIds: row.player_ids ?? undefined,
    note: row.note ?? undefined,
  };
}
