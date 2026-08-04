import type { Award, FunnyAttributes, Match, Player } from "./types";
import { DEFAULT_ATTRIBUTES } from "./types";

function attrs(overrides: Partial<FunnyAttributes> = {}): FunnyAttributes {
  return { ...DEFAULT_ATTRIBUTES, ...overrides };
}

// Plantel real del grupo. Sin fotos ni apodos todavía — se cargan desde el
// panel de Administración. Las posiciones son un punto de partida y se
// pueden editar libremente, igual que los atributos de la carta.
export const DEMO_PLAYERS: Player[] = [
  { id: "p1", name: "Mariano Alcuaz", phone: "2223428916", photoUrl: "/players/mariano-alcuaz.jpg", dominantFoot: "derecha", favoritePosition: "ARQ", active: true, attributes: attrs() },
  { id: "p2", name: "German Fiordelli", phone: "2223431407", photoUrl: "/players/german-fiordelli.jpg", dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p3", name: "Mauri Fiordelli", phone: "2223674209", photoUrl: "/players/mauri-fiordelli.jpg", dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p4", name: "Ezequiel Jaime", phone: "2223534574", photoUrl: "/players/ezequiel-jaime.jpg", dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p5", name: "Nico Leoni", phone: "2223464220", photoUrl: "/players/nico-leoni.jpg", dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p6", name: "Marcos Llanos", phone: "2223432496", photoUrl: "/players/marcos-llanos.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p7", name: "Juan M Muñoz", phone: "1132361413", photoUrl: "/players/juan-m-munoz.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p8", name: "Jonas Manso", phone: "2223574213", photoUrl: "/players/jonas-manso.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p9", name: "Manu Mendizabal", phone: "2216208746", photoUrl: "/players/manuel-mendizabal.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p10", name: "Mateo Manso", phone: "2223502767", photoUrl: "/players/mateo-manso.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p11", name: "Franco Nieto", phone: "2223464183", photoUrl: "/players/franco-nieto.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p12", name: "Natalio Napolitani", phone: "1155829579", photoUrl: "/players/natalio-napolitani.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p13", name: "Rodrigo Olivera", phone: "2223513781", photoUrl: "/players/rodrigo-olivera.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p14", name: "Pablo Piazza", phone: "2223461938", photoUrl: "/players/pablo-piazza.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p15", name: "Ramiro Rey", phone: "2223428304", photoUrl: "/players/ramiro-rey.jpg", dominantFoot: "derecha", favoritePosition: "ARQ", active: true, attributes: attrs() },
  { id: "p16", name: "Augusto Rossi", phone: "2223504190", photoUrl: "/players/augusto-ross.jpg", dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p17", name: "Marcos Rivaletto", phone: "2223463198", photoUrl: "/players/marcos-rivaletto.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p18", name: "Fede Sargiotti", phone: "2223511073", photoUrl: "/players/fede-sargiotti.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p19", name: "Matias Yornet", phone: "2223505173", photoUrl: "/players/matias-yornet.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p20", name: "Mario Llanos", phone: "2223425586", photoUrl: null, dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p21", name: "Santi Cupparo", phone: "2223463681", photoUrl: "/players/santi-cupparo.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
  { id: "p22", name: "Beto", phone: "2223433889", photoUrl: null, dominantFoot: "derecha", favoritePosition: "DEF", active: true, attributes: attrs() },
  { id: "p23", name: "Toto Cardozo", phone: "2223490648", photoUrl: "/players/toto-cardozo.jpg", dominantFoot: "derecha", favoritePosition: "MED", active: true, attributes: attrs() },
  { id: "p24", name: "Mauro Tondato", phone: "2223431190", photoUrl: "/players/mauro-tondato.jpg", dominantFoot: "derecha", favoritePosition: "DEL", active: true, attributes: attrs() },
];

// Todavía no hay partidos jugados cargados: arranca en cero y cada martes
// se suma uno real desde Historial / Admin. Se deja un próximo partido
// "programado" (sin resultado) solo para mostrar el armado de equipos.
export const DEMO_MATCHES: Match[] = [
  {
    id: "m-proximo",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    teamAName: "Equipo Champagne",
    teamBName: "Equipo Fernet",
    teamAScore: null,
    teamBScore: null,
    status: "scheduled",
    lineup: [
      { playerId: "p1", team: "A", x: 50, y: 92 },
      { playerId: "p2", team: "A", x: 25, y: 75 },
      { playerId: "p3", team: "A", x: 75, y: 75 },
      { playerId: "p6", team: "A", x: 30, y: 55 },
      { playerId: "p7", team: "A", x: 70, y: 55 },
      { playerId: "p11", team: "A", x: 35, y: 30 },
      { playerId: "p12", team: "A", x: 65, y: 30 },
      { playerId: "p15", team: "B", x: 50, y: 8 },
      { playerId: "p4", team: "B", x: 25, y: 25 },
      { playerId: "p5", team: "B", x: 75, y: 25 },
      { playerId: "p8", team: "B", x: 30, y: 45 },
      { playerId: "p9", team: "B", x: 70, y: 45 },
      { playerId: "p13", team: "B", x: 35, y: 70 },
      { playerId: "p14", team: "B", x: 65, y: 70 },
    ],
    stats: [],
    media: [],
  },
];

export const DEMO_AWARDS: Award[] = [];

export const GROUP_NAME = "Fútbol Champagne de los Martes";
