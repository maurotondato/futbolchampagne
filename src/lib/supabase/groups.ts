import { getSupabaseBrowserClient } from "./client";
import { groupFromRow } from "@/lib/data/mappers";
import { DEFAULT_FEATURES_BY_MODE, DEFAULT_PLAYER_FIELDS, modeForFormat } from "@/lib/data/types";
import type { Group, TeamFormat, TeamTone } from "@/lib/data/types";

function slugify(name: string) {
  const base = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "equipo"}-${suffix}`;
}

/** Crea el grupo, hace admin al usuario actual y le siembra los campos de
 * ficha por defecto. Todo o nada: si un paso falla se reporta el error, sin
 * dejar un grupo "huérfano" sin miembros. */
export async function createGroup(params: {
  userId: string;
  name: string;
  format: TeamFormat;
  tone: TeamTone;
  crestUrl?: string | null;
}): Promise<{ group?: Group; error?: string }> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return { error: "Supabase no está configurado." };

  const { data: groupRow, error: groupError } = await sb
    .from("groups")
    .insert({
      name: params.name,
      slug: slugify(params.name),
      format: params.format,
      tone: params.tone,
      crest_url: params.crestUrl ?? null,
      features: DEFAULT_FEATURES_BY_MODE[modeForFormat(params.format)],
    })
    .select()
    .single();
  if (groupError || !groupRow) {
    return { error: groupError?.message ?? "No se pudo crear el grupo." };
  }

  const { error: memberError } = await sb
    .from("group_members")
    .insert({ group_id: groupRow.id, user_id: params.userId, role: "admin" });
  if (memberError) {
    await sb.from("groups").delete().eq("id", groupRow.id);
    return { error: memberError.message };
  }

  const { error: fieldsError } = await sb.from("player_field_definitions").insert(
    DEFAULT_PLAYER_FIELDS.map((f) => ({ ...f, group_id: groupRow.id }))
  );
  if (fieldsError) {
    // No bloquea la creación del grupo por esto — se pueden agregar campos
    // a mano después desde Configuración.
    console.error("[Supabase] no se pudieron sembrar los campos por defecto:", fieldsError);
  }

  return { group: groupFromRow(groupRow) };
}

export async function joinGroupByInviteCode(
  userId: string,
  inviteCode: string
): Promise<{ group?: Group; error?: string }> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return { error: "Supabase no está configurado." };

  const { data: groupRow, error: findError } = await sb
    .from("groups")
    .select()
    .eq("invite_code", inviteCode.trim().toLowerCase())
    .maybeSingle();
  if (findError) return { error: findError.message };
  if (!groupRow) return { error: "Ese código no corresponde a ningún equipo." };

  const { error: memberError } = await sb
    .from("group_members")
    .insert({ group_id: groupRow.id, user_id: userId, role: "member" });
  if (memberError) return { error: memberError.message };

  return { group: groupFromRow(groupRow) };
}

export async function getGroupForUser(userId: string): Promise<Group | null> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return null;
  const { data: membership } = await sb
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (!membership) return null;
  const { data: groupRow } = await sb.from("groups").select().eq("id", membership.group_id).single();
  return groupRow ? groupFromRow(groupRow) : null;
}
