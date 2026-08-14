"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageShell } from "@/components/ui/PageShell";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { cn } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getCurrentUserId } from "@/lib/supabase/auth";
import { createGroup, getGroupForUser } from "@/lib/supabase/groups";
import {
  DEFAULT_FEATURES_BY_MODE,
  FEATURE_LABELS,
  TEAM_FORMATS,
  modeForFormat,
  type FeatureKey,
  type GroupFeatures,
  type TeamFormat,
  type TeamTone,
} from "@/lib/data/types";

export default function OnboardingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [checking, setChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [format, setFormat] = useState<TeamFormat>("7-amistoso");
  const [tone, setTone] = useState<TeamTone>("humor");
  const [name, setName] = useState("");
  const [crestFile, setCrestFile] = useState<File | null>(null);
  const [crestPreview, setCrestPreview] = useState<string | null>(null);
  const [features, setFeatures] = useState<GroupFeatures>(DEFAULT_FEATURES_BY_MODE.amigos);
  const [featuresTouched, setFeaturesTouched] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInviteCode, setCreatedInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    (async () => {
      const uid = await getCurrentUserId();
      if (!uid) {
        router.replace("/login");
        return;
      }
      const existing = await getGroupForUser(uid);
      if (existing) {
        router.replace("/");
        return;
      }
      setUserId(uid);
      setChecking(false);
    })();
  }, [router]);

  // Si el usuario todavía no tocó los interruptores a mano, el preset sigue
  // al modo derivado del formato elegido.
  useEffect(() => {
    if (!featuresTouched) setFeatures(DEFAULT_FEATURES_BY_MODE[modeForFormat(format)]);
  }, [format, featuresTouched]);

  function handleCrestSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setCrestFile(file);
    setCrestPreview(URL.createObjectURL(file));
  }

  function toggleFeature(key: FeatureKey) {
    setFeaturesTouched(true);
    setFeatures((f) => ({ ...f, [key]: !f[key] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !name.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      let crestUrl: string | null = null;
      if (crestFile) {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const path = `${userId}/${Date.now()}-${crestFile.name}`;
          const { error: uploadError } = await sb.storage
            .from("team-crests")
            .upload(path, crestFile, { upsert: true });
          if (!uploadError) {
            crestUrl = sb.storage.from("team-crests").getPublicUrl(path).data.publicUrl;
          }
        }
      }

      const { group, error: createError } = await createGroup({
        userId,
        name: name.trim(),
        format,
        tone,
        crestUrl,
      });

      if (createError || !group) {
        setError(createError ?? "No se pudo crear el equipo.");
        return;
      }

      // El preset de features se guarda en la creación; si el usuario tocó
      // los interruptores a mano, lo pisamos con lo que eligió.
      if (featuresTouched) {
        const sb = getSupabaseBrowserClient();
        await sb?.from("groups").update({ features }).eq("id", group.id);
      }

      setCreatedInviteCode(group.inviteCode);
    } finally {
      setSubmitting(false);
    }
  }

  if (createdInviteCode) {
    return (
      <PageShell>
        <div className="flex min-h-dvh items-center justify-center px-4">
          <GlassPanel strong className="w-full max-w-sm rounded-2xl border border-line p-8 text-center">
            <p className="font-display text-2xl uppercase tracking-wide text-gold-gradient">
              ¡Equipo creado!
            </p>
            <p className="mt-2 font-hud text-xs text-ink-faint">
              Pasale este código al resto del plantel para que se sumen desde /join
            </p>
            <div className="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 font-hud text-lg uppercase tracking-[0.3em] text-gold">
              {createdInviteCode}
            </div>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(createdInviteCode);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="mt-3 font-hud text-xs uppercase tracking-wide text-ink-faint underline-offset-2 hover:text-gold hover:underline"
            >
              {copied ? "¡Copiado!" : "Copiar código"}
            </button>
            <motion.button
              type="button"
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="mt-5 w-full rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] py-3 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)]"
            >
              Entrar a la app ⚽
            </motion.button>
          </GlassPanel>
        </div>
      </PageShell>
    );
  }

  if (checking) {
    return (
      <PageShell>
        <div className="flex min-h-dvh items-center justify-center">
          <p className="font-hud text-ink-faint">Cargando…</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl uppercase tracking-wide text-gold-gradient">
            Armá tu equipo
          </h1>
          <p className="mt-1 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
            Cuatro preguntas y arrancás
          </p>
          <button
            type="button"
            onClick={() => router.push("/join")}
            className="mt-3 font-hud text-xs uppercase tracking-wide text-ink-faint underline-offset-2 hover:text-gold hover:underline"
          >
            ¿Ya tenés un código de invitación? Sumate a un equipo existente
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <GlassPanel className="p-6">
            <p className="mb-3 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
              1. ¿Cómo juegan?
            </p>
            <div className="grid gap-3">
              {(Object.values(TEAM_FORMATS)).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormat(f.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    format === f.id ? "border-gold/70 bg-gold/10" : "border-line bg-white/5 hover:border-line"
                  )}
                >
                  <p className="font-display text-lg text-ink">{f.label}</p>
                  <p className="font-hud text-xs text-ink-faint">
                    {f.mode === "amigos"
                      ? "Manejás los dos equipos — como jugar entre amigos."
                      : "Manejás un solo plantel, contra rivales externos."}
                  </p>
                </button>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <p className="mb-3 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
              2. ¿Con humor o serio?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTone("humor")}
                className={cn(
                  "rounded-xl border p-4 text-center transition",
                  tone === "humor" ? "border-gold/70 bg-gold/10" : "border-line bg-white/5"
                )}
              >
                <p className="font-display text-lg text-ink">Con humor</p>
                <p className="font-hud text-xs text-ink-faint">Cargadas, atributos graciosos</p>
              </button>
              <button
                type="button"
                onClick={() => setTone("serio")}
                className={cn(
                  "rounded-xl border p-4 text-center transition",
                  tone === "serio" ? "border-gold/70 bg-gold/10" : "border-line bg-white/5"
                )}
              >
                <p className="font-display text-lg text-ink">Serio</p>
                <p className="font-hud text-xs text-ink-faint">Atributos reales, sin joda</p>
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <p className="mb-3 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
              3. Nombre y escudo
            </p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nombre del equipo"
              className="w-full rounded-xl border border-line bg-white/5 px-4 py-3 font-hud text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold/50"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dashed border-line bg-white/5 text-ink-faint hover:border-gold/50"
              >
                {crestPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={crestPreview} alt="Escudo" className="h-full w-full object-cover" />
                ) : (
                  <span className="font-hud text-[10px] uppercase">Escudo</span>
                )}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCrestSelect} />
              <p className="font-hud text-xs text-ink-faint">
                Opcional, lo podés subir o cambiar después desde Configuración.
              </p>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <p className="mb-1 font-hud text-xs uppercase tracking-[0.2em] text-ink-faint">
              4. Módulos activos
            </p>
            <p className="mb-3 font-hud text-xs text-ink-faint">
              Elegimos un preset según cómo juegan — desmarcá lo que no quieras, o sumalo después desde Configuración.
            </p>
            <div className="space-y-2">
              {(Object.keys(FEATURE_LABELS) as FeatureKey[]).map((key) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-line bg-white/5 px-3 py-2"
                >
                  <span className="font-hud text-xs text-ink">{FEATURE_LABELS[key]}</span>
                  <input
                    type="checkbox"
                    checked={features[key]}
                    onChange={() => toggleFeature(key)}
                    className="h-4 w-4 accent-[#e8c979]"
                  />
                </label>
              ))}
            </div>
          </GlassPanel>

          {error && (
            <p className="text-center font-hud text-xs text-magenta">{error}</p>
          )}

          <motion.button
            type="submit"
            disabled={submitting || !name.trim()}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full rounded-xl bg-gradient-to-b from-[#ffe9a8] via-[#e8c979] to-[#a8863f] py-3 font-hud text-sm font-bold uppercase tracking-wide text-[#241a08] shadow-[0_0_25px_rgba(232,201,121,0.35)]",
              (submitting || !name.trim()) && "opacity-60"
            )}
          >
            {submitting ? "Creando…" : "Crear equipo ⚽"}
          </motion.button>
        </form>
      </div>
    </PageShell>
  );
}
