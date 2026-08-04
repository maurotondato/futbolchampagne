"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, LogOut } from "lucide-react";
import { useAuth } from "@/lib/supabase/useAuth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, isDemo } = useAuth();

  useEffect(() => {
    if (!isDemo && !loading && !user) router.replace("/login");
  }, [isDemo, loading, user, router]);

  if (loading) {
    return <p className="py-20 text-center font-hud text-ink-faint">Verificando acceso…</p>;
  }

  if (!isDemo && !user) {
    return null;
  }

  return (
    <div>
      {isDemo && (
        <div className="mx-auto mb-6 flex max-w-4xl items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-hud text-xs text-cyan">
          <AlertTriangle size={14} />
          Modo demo: los cambios se guardan en este navegador. Conectá Supabase para persistir de
          verdad y exigir login.
        </div>
      )}
      {!isDemo && user && (
        <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between rounded-xl border border-line bg-white/5 px-4 py-2.5 font-hud text-xs text-ink-dim">
          <span>Conectado como {user.email}</span>
          <button
            onClick={async () => {
              await getSupabaseBrowserClient()?.auth.signOut();
              router.push("/");
            }}
            className="flex items-center gap-1 text-magenta hover:underline"
          >
            <LogOut size={13} /> Salir
          </button>
        </div>
      )}
      {children}
    </div>
  );
}
