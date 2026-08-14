"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { getCurrentUserId, onAuthStateChange } from "@/lib/supabase/auth";
import { getGroupForUser } from "@/lib/supabase/groups";

// Rutas de autenticación/alta: no tienen que quedar atrapadas atrás de su
// propio gate, si no nadie podría loguearse ni crear un grupo.
const EXEMPT_PATHS = ["/login", "/onboarding", "/join"];

/** Reemplazo multi-cuenta de PasswordGate: exige sesión real de Supabase
 * Auth y un grupo asociado antes de mostrar la app. Todavía no está
 * conectado en layout.tsx — se activa a propósito en un paso aparte. */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "ready" | "redirecting">("checking");

  useEffect(() => {
    if (EXEMPT_PATHS.includes(pathname)) {
      setStatus("ready");
      return;
    }

    let cancelled = false;

    async function check() {
      const userId = await getCurrentUserId();
      if (cancelled) return;
      if (!userId) {
        setStatus("redirecting");
        router.replace("/login");
        return;
      }
      const group = await getGroupForUser(userId);
      if (cancelled) return;
      if (!group) {
        setStatus("redirecting");
        router.replace("/onboarding");
        return;
      }
      setStatus("ready");
    }

    check();
    const unsubscribe = onAuthStateChange(() => check());
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [pathname, router]);

  if (!isSupabaseConfigured) return <>{children}</>;
  if (status !== "ready") return <div className="fixed inset-0 z-[200] bg-void" />;
  return <>{children}</>;
}
