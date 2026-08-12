import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./client";

/** Login real por email/contraseña vía Supabase Auth, para el modo
 * multi-grupo (distinto del gate de contraseña compartida "fulbito" que
 * sigue siendo el acceso por defecto hasta que se decida el cutover). */

export function authAvailable() {
  return isSupabaseConfigured;
}

export async function signUp(email: string, password: string) {
  const sb = getSupabaseBrowserClient();
  if (!sb) return { error: { message: "Supabase no está configurado." } };
  return sb.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  const sb = getSupabaseBrowserClient();
  if (!sb) return { error: { message: "Supabase no está configurado." } };
  return sb.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const sb = getSupabaseBrowserClient();
  if (!sb) return;
  await sb.auth.signOut();
}

export async function getSession() {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session;
}

export async function getCurrentUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

export function onAuthStateChange(callback: (userId: string | null) => void) {
  const sb = getSupabaseBrowserClient();
  if (!sb) return () => {};
  const { data } = sb.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
    callback(session?.user.id ?? null);
  });
  return () => data.subscription.unsubscribe();
}
