/**
 * localStorage/sessionStorage can throw (not just return null) in Safari
 * private browsing, with "Block all cookies" enabled, or under some iOS
 * privacy settings — accessing the property itself can raise a
 * SecurityError. An uncaught throw here during initial render takes down
 * the whole React tree with no fallback UI, which reads as a blank black
 * screen. Every read/write goes through these helpers instead.
 */
type Area = "local" | "session";

function area(kind: Area): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function safeGet(kind: Area, key: string): string | null {
  try {
    return area(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function safeSet(kind: Area, key: string, value: string): boolean {
  try {
    area(kind)?.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(kind: Area, key: string) {
  try {
    area(kind)?.removeItem(key);
  } catch {
    // Nothing we can do — ignore.
  }
}
