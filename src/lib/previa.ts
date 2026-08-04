import type { Match, Player, PlayerSummary } from "./data/types";
import { average } from "./utils";

export interface PreviaResult {
  probA: number;
  probB: number;
  keyPlayerA?: Player;
  keyPlayerB?: Player;
  duel?: [Player, Player];
  predictedA: number;
  predictedB: number;
  commentary: string[];
}

const COMMENTARY_TEMPLATES = [
  "Las estadísticas favorecen a {fav}, pero {rival} viene con ganas de dar el batacazo.",
  "{fav} llega como favorito según nuestro modelo, aunque en Fútbol Champagne nada está escrito.",
  "El dato clave: {clave} está en un momento brillante y puede inclinar la balanza para {favTeam}.",
  "{rival} necesita reaccionar rápido si no quiere quedar relegado en la tabla de los martes.",
  "Ojo con el arranque: los nervios del primer gol suelen definir estos clásicos improvisados.",
  "El clima está picante en la previa — se viene un partido con condimento extra.",
];

function logistic(diff: number) {
  return 1 / (1 + Math.exp(-diff / 220));
}

export function generatePreview(
  match: Match,
  players: Player[],
  summaries: PlayerSummary[]
): PreviaResult {
  const byId = new Map(players.map((p) => [p.id, p]));
  const summaryById = new Map(summaries.map((s) => [s.player.id, s]));

  const teamAIds = match.lineup.filter((l) => l.team === "A").map((l) => l.playerId);
  const teamBIds = match.lineup.filter((l) => l.team === "B").map((l) => l.playerId);

  const eloA = average(teamAIds.map((id) => summaryById.get(id)?.elo ?? 1200));
  const eloB = average(teamBIds.map((id) => summaryById.get(id)?.elo ?? 1200));

  const probA = Math.round(logistic(eloA - eloB) * 100);
  const probB = 100 - probA;

  function keyPlayer(ids: string[]) {
    let best: Player | undefined;
    let bestScore = -1;
    ids.forEach((id) => {
      const s = summaryById.get(id);
      const score = s && s.played > 0 ? s.avgRating * 10 + s.goals : Math.random() * 10;
      if (score > bestScore) {
        bestScore = score;
        best = byId.get(id);
      }
    });
    return best;
  }

  const keyPlayerA = keyPlayer(teamAIds);
  const keyPlayerB = keyPlayer(teamBIds);

  let duel: [Player, Player] | undefined;
  if (keyPlayerA && keyPlayerB) duel = [keyPlayerA, keyPlayerB];

  const totalGoals = 5 + Math.round(Math.random() * 4);
  const shareA = probA / 100;
  const predictedA = Math.max(0, Math.round(totalGoals * shareA + (Math.random() - 0.5)));
  const predictedB = Math.max(0, totalGoals - predictedA + Math.round((Math.random() - 0.5)));

  const favTeam = probA >= probB ? match.teamAName : match.teamBName;
  const rivalTeam = probA >= probB ? match.teamBName : match.teamAName;
  const claveName =
    (probA >= probB ? keyPlayerA : keyPlayerB)?.nickname ??
    (probA >= probB ? keyPlayerA : keyPlayerB)?.name ??
    "la figura de la fecha";

  const shuffled = [...COMMENTARY_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, 3);
  const commentary = shuffled.map((t) =>
    t
      .replaceAll("{fav}", favTeam)
      .replaceAll("{favTeam}", favTeam)
      .replaceAll("{rival}", rivalTeam)
      .replaceAll("{clave}", claveName)
  );

  return { probA, probB, keyPlayerA, keyPlayerB, duel, predictedA, predictedB, commentary };
}
