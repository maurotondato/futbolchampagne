/** Base path the app is deployed under (e.g. "/futbolchampagne" on GitHub
 * Pages, empty on Vercel/root domains). Baked in at build time. */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Prefixes an app-owned root-relative path ("/players/x.jpg") with the
 * base path. Leaves external URLs and data: URIs untouched, so it's safe
 * to wrap any src regardless of where it came from (Supabase storage,
 * pasted link, local /public asset, base64 upload).
 */
export function withBasePath(path?: string | null) {
  if (!path) return path ?? "";
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path) || path.startsWith("data:")) {
    return path;
  }
  return `${BASE_PATH}${path}`;
}
