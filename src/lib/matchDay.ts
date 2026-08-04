/** Se juega todos los martes. Estos helpers calculan la fecha del partido
 * de la semana (hoy si es martes, si no el próximo) y si ya toca cargar
 * el resultado. */

const TUESDAY = 2;

export function nextMatchDate(from = new Date()): Date {
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Dom, 1=Lun, 2=Mar, ...
  const diff = (TUESDAY - day + 7) % 7; // 0 si hoy ya es martes
  d.setDate(d.getDate() + diff);
  return d;
}

export function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function nextMatchISODate(from = new Date()) {
  return toISODate(nextMatchDate(from));
}

export function isToday(dateIso: string) {
  return dateIso === toISODate(new Date());
}

/** Un partido "scheduled" cuya fecha ya llegó o pasó — falta cargar el resultado. */
export function isAwaitingResult(dateIso: string, status: string) {
  if (status !== "scheduled") return false;
  return dateIso <= toISODate(new Date());
}
