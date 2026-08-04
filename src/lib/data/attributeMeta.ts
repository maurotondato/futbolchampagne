import type { FunnyAttributes } from "./types";

export const ATTRIBUTE_META: {
  key: keyof FunnyAttributes;
  emoji: string;
  label: string;
  short: string;
}[] = [
  { key: "aguante", emoji: "🍺", label: "Aguante", short: "AGU" },
  { key: "estadoFisico", emoji: "🏃", label: "Estado físico", short: "FIS" },
  { key: "llegarTarde", emoji: "😴", label: "Llegar tarde", short: "TAR" },
  { key: "humo", emoji: "🤡", label: "Humo", short: "HUM" },
  { key: "definicion", emoji: "⚽", label: "Definición", short: "GOL" },
  { key: "quite", emoji: "🦴", label: "Quite", short: "QUI" },
  { key: "pase", emoji: "🎯", label: "Pase", short: "PAS" },
  { key: "iqFutbolistico", emoji: "🧠", label: "IQ Futbolístico", short: "IQ" },
  { key: "protestaArbitro", emoji: "😡", label: "Protesta al árbitro", short: "REF" },
  { key: "humor", emoji: "😂", label: "Humor", short: "LOL" },
  { key: "garra", emoji: "💪", label: "Garra", short: "GAR" },
  { key: "sangre", emoji: "🔥", label: "Sangre", short: "FUE" },
];

const CARD_KEYS: (keyof FunnyAttributes)[] = [
  "definicion",
  "pase",
  "quite",
  "estadoFisico",
  "garra",
  "iqFutbolistico",
];

export function cardFaceAttributes(attrs: FunnyAttributes) {
  return ATTRIBUTE_META.filter((m) => CARD_KEYS.includes(m.key)).map((m) => ({
    ...m,
    value: attrs[m.key],
  }));
}

export function computeOverall(attrs: FunnyAttributes) {
  const values = Object.values(attrs) as number[];
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

export function tierFor(ovr: number): "icon" | "gold" | "silver" | "bronze" {
  if (ovr >= 88) return "icon";
  if (ovr >= 78) return "gold";
  if (ovr >= 65) return "silver";
  return "bronze";
}

export const TIER_STYLES: Record<
  ReturnType<typeof tierFor>,
  { bg: string; border: string; text: string; label: string }
> = {
  icon: {
    bg: "linear-gradient(160deg,#3a2a05,#0d0902 60%,#000)",
    border: "linear-gradient(160deg,#fff6da,#e8c979 40%,#a8863f)",
    text: "#ffe9a8",
    label: "ÍCONO",
  },
  gold: {
    bg: "linear-gradient(160deg,#3d3210,#1a1608 60%,#0a0803)",
    border: "linear-gradient(160deg,#ffe9a8,#e8c979,#a8863f)",
    text: "#e8c979",
    label: "ORO",
  },
  silver: {
    bg: "linear-gradient(160deg,#2a2f3d,#141822 60%,#0a0c12)",
    border: "linear-gradient(160deg,#e7ecf7,#b7c0d6,#7d879e)",
    text: "#d7dceb",
    label: "PLATA",
  },
  bronze: {
    bg: "linear-gradient(160deg,#3a2418,#1c130c 60%,#0d0806)",
    border: "linear-gradient(160deg,#e0a870,#b97a44,#7a4d27)",
    text: "#dba876",
    label: "BRONCE",
  },
};
