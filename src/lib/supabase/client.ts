import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Lazily creates a singleton browser Supabase client. Returns null when the
 * project isn't configured yet, so the app can fall back to demo data
 * instead of crashing during local preview / first deploy.
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(url!, anonKey!);
  }
  return browserClient;
}
