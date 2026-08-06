import type { Match, Player, PlayerSummary } from "./types";
import { average } from "@/lib/utils";

const STARTING_ELO = 1200;
const K_FACTOR = 24;

function eloExpected(a: number, b: number) {
  return 1 / (1 + 10 ** ((b - a) / 400));
}

export function computePlayerSummaries(
  players: Player[],
  matches: Match[]
): PlayerSummary[] {
  const played = matches
    .filter((m) => m.status === "played" && m.teamAScore != null && m.teamBScore != null)
    .sort((a, b) => a.date.localeCompare(b.date));

  const elo = new Map<string, number>();
  players.forEach((p) => elo.set(p.id, STARTING_ELO));

  const acc = new Map<
    string,
    {
      played: number;
      wins: number;
      draws: number;
      losses: number;
      goals: number;
      assists: number;
      yellow: number;
      red: number;
      mvps: number;
      cleanSheets: number;
      ratings: number[];
      results: ("W" | "D" | "L")[];
      minutes: number;
      late: number;
    }
  >();

  function bucket(id: string) {
    let b = acc.get(id);
    if (!b) {
      b = {
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals: 0,
        assists: 0,
        yellow: 0,
        red: 0,
        mvps: 0,
        cleanSheets: 0,
        ratings: [],
        results: [],
        minutes: 0,
        late: 0,
      };
      acc.set(id, b);
    }
    return b;
  }

  for (const match of played) {
    const scoreA = match.teamAScore ?? 0;
    const scoreB = match.teamBScore ?? 0;
    const outcome: "A" | "B" | "D" =
      scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : "D";

    const teamAIds = new Set(match.stats.filter((s) => s.team === "A").map((s) => s.playerId));
    const teamBIds = new Set(match.stats.filter((s) => s.team === "B").map((s) => s.playerId));

    // ELO update — treat each match as a team-vs-team result using team
    // average rating as the pre-match strength.
    const teamAAvgElo = average([...teamAIds].map((id) => elo.get(id) ?? STARTING_ELO));
    const teamBAvgElo = average([...teamBIds].map((id) => elo.get(id) ?? STARTING_ELO));
    const scoreForA = outcome === "A" ? 1 : outcome === "B" ? 0 : 0.5;
    const expectedA = eloExpected(teamAAvgElo, teamBAvgElo);
    const deltaA = K_FACTOR * (scoreForA - expectedA);
    const deltaB = -deltaA;

    for (const stat of match.stats) {
      const b = bucket(stat.playerId);
      b.played += 1;
      b.goals += stat.goals;
      b.assists += stat.assists;
      b.yellow += stat.yellowCards;
      b.red += stat.redCards;
      if (stat.isMvp) b.mvps += 1;
      b.ratings.push(stat.rating);
      b.minutes += 70;
      if (stat.minutesLate > 0) b.late += 1;

      const onTeamA = stat.team === "A";
      const won = (onTeamA && outcome === "A") || (!onTeamA && outcome === "B");
      const lost = (onTeamA && outcome === "B") || (!onTeamA && outcome === "A");
      if (outcome === "D") b.draws += 1;
      else if (won) b.wins += 1;
      else if (lost) b.losses += 1;
      b.results.push(outcome === "D" ? "D" : won ? "W" : "L");

      if (
        stat.isGoalkeeper &&
        ((onTeamA && scoreB === 0) || (!onTeamA && scoreA === 0))
      ) {
        b.cleanSheets += 1;
      }

      const currentElo = elo.get(stat.playerId) ?? STARTING_ELO;
      elo.set(stat.playerId, currentElo + (onTeamA ? deltaA : deltaB));
    }
  }

  return players.map((player) => {
    const b = acc.get(player.id);
    const results = b?.results ?? [];
    let winStreak = 0;
    let loseStreak = 0;
    let curWin = 0;
    let curLose = 0;
    for (const r of results) {
      if (r === "W") {
        curWin += 1;
        curLose = 0;
      } else if (r === "L") {
        curLose += 1;
        curWin = 0;
      } else {
        curWin = 0;
        curLose = 0;
      }
      winStreak = Math.max(winStreak, curWin);
      loseStreak = Math.max(loseStreak, curLose);
    }

    return {
      player,
      played: b?.played ?? 0,
      wins: b?.wins ?? 0,
      draws: b?.draws ?? 0,
      losses: b?.losses ?? 0,
      goals: b?.goals ?? 0,
      assists: b?.assists ?? 0,
      yellowCards: b?.yellow ?? 0,
      redCards: b?.red ?? 0,
      mvps: b?.mvps ?? 0,
      cleanSheets: b?.cleanSheets ?? 0,
      avgRating: b ? Number(average(b.ratings).toFixed(2)) : 0,
      avgGoals: b && b.played > 0 ? Number((b.goals / b.played).toFixed(2)) : 0,
      points: (b?.wins ?? 0) * 3 + (b?.draws ?? 0),
      elo: Math.round(elo.get(player.id) ?? STARTING_ELO),
      winStreak,
      loseStreak,
      minutesPlayed: b?.minutes ?? 0,
      timesLate: b?.late ?? 0,
    };
  });
}

export function sortBy<T>(arr: T[], key: (t: T) => number, dir: "asc" | "desc" = "desc") {
  return [...arr].sort((a, b) => (dir === "desc" ? key(b) - key(a) : key(a) - key(b)));
}
