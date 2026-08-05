import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** A bare "YYYY-MM-DD" string is parsed by `new Date()` as UTC midnight, per
 * spec — formatting that in any timezone behind UTC (all of the Americas)
 * rolls it back to the previous day. Anchoring to local noon sidesteps it:
 * no realistic UTC offset is large enough to shift noon across a day
 * boundary. Strings that already carry a time (or a Date instance) pass
 * through untouched. */
function toLocalDate(date: string | Date): Date {
  if (typeof date !== "string") return date;
  return new Date(date.includes("T") ? date : `${date}T12:00:00`);
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(toLocalDate(date));
}

export function formatShortDate(date: string | Date) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(toLocalDate(date));
}

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export function average(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
