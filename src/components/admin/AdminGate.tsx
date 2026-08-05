"use client";

import { AlertTriangle, Database } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * No per-user login — the shared app password (PasswordGate) is the only
 * gate, on purpose, so anyone in the group can build teams and load
 * results without a separate account. This just surfaces where data is
 * actually being saved.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {isSupabaseConfigured ? (
        <div className="mx-auto mb-6 flex max-w-4xl items-center gap-2 rounded-xl border border-emerald/30 bg-emerald/10 px-4 py-2.5 font-hud text-xs text-emerald">
          <Database size={14} />
          Conectado a Supabase: los cambios los ve todo el grupo.
        </div>
      ) : (
        <div className="mx-auto mb-6 flex max-w-4xl items-center gap-2 rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-2.5 font-hud text-xs text-cyan">
          <AlertTriangle size={14} />
          Modo demo: los cambios se guardan solo en este navegador.
        </div>
      )}
      {children}
    </div>
  );
}
