"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { safeGet, safeSet, safeRemove } from "@/lib/safeStorage";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_AWARDS, DEMO_INJURIES, DEMO_MATCHES, DEMO_PLAYERS } from "@/lib/data/demoData";
import { isValidSlotCode } from "@/lib/formation";
import { nextMatchISODate } from "@/lib/matchDay";
import type {
  Award,
  Injury,
  LineupSlot,
  Match,
  MatchMedia,
  Player,
  PlayerMatchStat,
} from "@/lib/data/types";
import {
  awardFromRow,
  injuryFromRow,
  lineupFromRow,
  matchFromRow,
  matchToRow,
  mediaFromRow,
  playerFromRow,
  playerToRow,
  statFromRow,
  statToRow,
} from "@/lib/data/mappers";

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// zustand's default localStorage adapter doesn't guard against getItem/
// setItem throwing (Safari private browsing, "block all cookies", etc.),
// which otherwise surfaces as an uncaught error on every write. Route
// through the same safe helpers used everywhere else in the app.
const safeStateStorage: StateStorage = {
  getItem: (name) => safeGet("local", name),
  setItem: (name, value) => {
    safeSet("local", name, value);
  },
  removeItem: (name) => safeRemove("local", name),
};

function isTuesday(dateIso: string) {
  return new Date(`${dateIso}T12:00:00`).getDay() === 2;
}

// Every write below used to fire the Supabase call and ignore whatever it
// returned, applying the local optimistic update unconditionally. If the
// server write actually failed (RLS, network, whatever), nothing told the
// user — the change just looked like it worked until the next reload
// re-fetched server truth and quietly reverted it. Writes now check the
// server first and only touch local state on success, and this surfaces
// the failure instead of swallowing it.
function reportWriteError(action: string, error: { message?: string } | null): boolean {
  if (!error) return false;
  console.error(`[Supabase] ${action} failed:`, error);
  alert(`No se pudo ${action}. ${error.message ?? "Revisá la conexión e intentá de nuevo."}`);
  return true;
}

// Repairs state saved by older app versions: lineup slots used to store
// free x/y coordinates instead of a fixed SlotCode (invalid slot values
// crash the share-image and match-detail pitch renders), and the "next
// match" date used to be computed as a fixed offset instead of "this
// week's Tuesday" (so it could land on the wrong weekday and get stuck
// showing a stale countdown forever).
function repairLegacyState(matches: Match[]): Match[] {
  return matches.map((m) => ({
    ...m,
    // "m-proximo" is the reserved id of the seed demo match, which used to
    // ship with a fake 14-player lineup just to preview the formation
    // screen — confusing in real use, where it should start empty.
    lineup: m.id === "m-proximo" ? [] : m.lineup.filter((l) => isValidSlotCode(l.slot)),
    date: m.status === "scheduled" && !isTuesday(m.date) ? nextMatchISODate() : m.date,
  }));
}

// Backfills photos added to the seed roster after someone already had it
// persisted locally (e.g. Beto's photo, added later — "p22" without a
// photoUrl is unmistakably the pre-photo seed entry, not a real edit,
// since nothing else sets that id).
function repairLegacyPlayers(players: Player[]): Player[] {
  return players.map((p) =>
    p.id === "p22" && !p.photoUrl ? { ...p, photoUrl: "/players/beto.jpg" } : p
  );
}

interface AppState {
  players: Player[];
  matches: Match[];
  awards: Award[];
  injuries: Injury[];
  hydrated: boolean;
  isDemo: boolean;
  loadAll: () => Promise<void>;

  addPlayer: (p: Omit<Player, "id">) => Promise<Player>;
  updatePlayer: (id: string, patch: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;

  addMatch: (m: Omit<Match, "id" | "lineup" | "stats" | "media">) => Promise<Match>;
  updateMatch: (id: string, patch: Partial<Match>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;

  setLineupSlot: (matchId: string, slot: LineupSlot) => Promise<void>;
  removeLineupSlot: (matchId: string, playerId: string) => Promise<void>;
  clearLineup: (matchId: string) => Promise<void>;

  upsertStat: (matchId: string, stat: PlayerMatchStat) => Promise<void>;

  addMedia: (matchId: string, media: Omit<MatchMedia, "id" | "matchId" | "votes">) => Promise<void>;
  voteMedia: (matchId: string, mediaId: string, delta: number) => Promise<void>;

  addAward: (a: Omit<Award, "id">) => Promise<void>;
  deleteAward: (id: string) => Promise<void>;

  addInjury: (i: Omit<Injury, "id">) => Promise<void>;
  updateInjury: (id: string, patch: Partial<Injury>) => Promise<void>;
  deleteInjury: (id: string) => Promise<void>;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      players: DEMO_PLAYERS,
      matches: DEMO_MATCHES,
      awards: DEMO_AWARDS,
      injuries: DEMO_INJURIES,
      hydrated: false,
      isDemo: !isSupabaseConfigured,

      loadAll: async () => {
        const sb = getSupabaseBrowserClient();
        if (!sb) {
          set({ hydrated: true, isDemo: true });
          return;
        }
        try {
          const [{ data: playerRows }, { data: matchRows }, { data: lineupRows }, { data: statRows }, { data: mediaRows }, { data: awardRows }, { data: injuryRows }] =
            await Promise.all([
              sb.from("players").select("*").order("name"),
              sb.from("matches").select("*").order("date", { ascending: false }),
              sb.from("lineup_slots").select("*"),
              sb.from("player_match_stats").select("*"),
              sb.from("match_media").select("*"),
              sb.from("awards").select("*"),
              sb.from("injuries").select("*"),
            ]);

          if (!playerRows || !matchRows) {
            set({ hydrated: true, isDemo: true });
            return;
          }

          const players = playerRows.map(playerFromRow);
          const matches: Match[] = matchRows.map((row: { id: string }) => {
            const lineup = (lineupRows ?? [])
              .filter((l: { match_id: string }) => l.match_id === row.id)
              .map(lineupFromRow);
            const stats = (statRows ?? [])
              .filter((s: { match_id: string }) => s.match_id === row.id)
              .map(statFromRow);
            const media = (mediaRows ?? [])
              .filter((m: { match_id: string }) => m.match_id === row.id)
              .map(mediaFromRow);
            return matchFromRow(row, lineup, stats, media);
          });
          const awards = (awardRows ?? []).map(awardFromRow);
          const injuries = (injuryRows ?? []).map(injuryFromRow);

          set({ players, matches, awards, injuries, hydrated: true, isDemo: false });
        } catch {
          set({ hydrated: true, isDemo: true });
        }
      },

      addPlayer: async (p) => {
        const sb = getSupabaseBrowserClient();
        let player: Player = { ...p, id: uid("p") };
        if (sb) {
          const { data, error } = await sb
            .from("players")
            .insert(playerToRow(p))
            .select()
            .single();
          if (reportWriteError("agregar el jugador", error)) throw error;
          if (data) player = playerFromRow(data);
        }
        set({ players: [...get().players, player] });
        return player;
      },

      updatePlayer: async (id, patch) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("players").update(playerToRow(patch)).eq("id", id);
          if (reportWriteError("actualizar el jugador", error)) return;
        }
        set({
          players: get().players.map((pl) => (pl.id === id ? { ...pl, ...patch, attributes: { ...pl.attributes, ...(patch.attributes ?? {}) } } : pl)),
        });
      },

      deletePlayer: async (id) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("players").delete().eq("id", id);
          if (reportWriteError("borrar el jugador", error)) return;
        }
        set({ players: get().players.filter((p) => p.id !== id) });
      },

      addMatch: async (m) => {
        const sb = getSupabaseBrowserClient();
        let match: Match = { ...m, id: uid("m"), lineup: [], stats: [], media: [] };
        if (sb) {
          const { data, error } = await sb
            .from("matches")
            .insert(matchToRow(m))
            .select()
            .single();
          if (reportWriteError("crear el partido", error)) throw error;
          if (data) match = matchFromRow(data, [], [], []);
        }
        set({ matches: [match, ...get().matches] });
        return match;
      },

      updateMatch: async (id, patch) => {
        const sb = getSupabaseBrowserClient();
        if (sb && Object.keys(matchToRow(patch)).length) {
          const { error } = await sb.from("matches").update(matchToRow(patch)).eq("id", id);
          if (reportWriteError("actualizar el partido", error)) return;
        }
        set({
          matches: get().matches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
      },

      deleteMatch: async (id) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("matches").delete().eq("id", id);
          if (reportWriteError("borrar el partido", error)) return;
        }
        set({ matches: get().matches.filter((m) => m.id !== id) });
      },

      setLineupSlot: async (matchId, slot) => {
        // Assigning a player bumps out whoever else was in that exact
        // team+slot, and pulls the player out of any other slot they
        // occupied — a player can only be in one spot at a time.
        const currentMatch = get().matches.find((m) => m.id === matchId);
        const bumped = currentMatch?.lineup.find(
          (l) => l.team === slot.team && l.slot === slot.slot && l.playerId !== slot.playerId
        );
        const sb = getSupabaseBrowserClient();
        if (sb) {
          if (bumped) {
            const { error } = await sb
              .from("lineup_slots")
              .delete()
              .eq("match_id", matchId)
              .eq("player_id", bumped.playerId);
            if (reportWriteError("actualizar la formación", error)) return;
          }
          const { error } = await sb.from("lineup_slots").upsert(
            {
              match_id: matchId,
              player_id: slot.playerId,
              team: slot.team,
              slot: slot.slot,
            },
            { onConflict: "match_id,player_id" }
          );
          if (reportWriteError("actualizar la formación", error)) return;
        }
        set({
          matches: get().matches.map((m) => {
            if (m.id !== matchId) return m;
            return {
              ...m,
              lineup: [
                ...m.lineup.filter(
                  (l) =>
                    l.playerId !== slot.playerId &&
                    !(l.team === slot.team && l.slot === slot.slot)
                ),
                slot,
              ],
            };
          }),
        });
      },

      removeLineupSlot: async (matchId, playerId) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb
            .from("lineup_slots")
            .delete()
            .eq("match_id", matchId)
            .eq("player_id", playerId);
          if (reportWriteError("actualizar la formación", error)) return;
        }
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? { ...m, lineup: m.lineup.filter((l) => l.playerId !== playerId) }
              : m
          ),
        });
      },

      clearLineup: async (matchId) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("lineup_slots").delete().eq("match_id", matchId);
          if (reportWriteError("vaciar la cancha", error)) return;
        }
        set({
          matches: get().matches.map((m) => (m.id === matchId ? { ...m, lineup: [] } : m)),
        });
      },

      upsertStat: async (matchId, stat) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb
            .from("player_match_stats")
            .upsert(statToRow(matchId, stat), { onConflict: "match_id,player_id" });
          if (reportWriteError("guardar la estadística", error)) return;
        }
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  stats: [
                    ...m.stats.filter((s) => s.playerId !== stat.playerId),
                    stat,
                  ],
                }
              : m
          ),
        });
      },

      addMedia: async (matchId, media) => {
        const sb = getSupabaseBrowserClient();
        let newMedia: MatchMedia = { ...media, id: uid("med"), matchId, votes: 0 };
        if (sb) {
          const { data, error } = await sb
            .from("match_media")
            .insert({ match_id: matchId, type: media.type, url: media.url, caption: media.caption })
            .select()
            .single();
          if (reportWriteError("subir el momento", error)) throw error;
          if (data) newMedia = mediaFromRow(data);
        }
        set({
          matches: get().matches.map((m) =>
            m.id === matchId ? { ...m, media: [...m.media, newMedia] } : m
          ),
        });
      },

      voteMedia: async (matchId, mediaId, delta) => {
        const match = get().matches.find((m) => m.id === matchId);
        const media = match?.media.find((med) => med.id === mediaId);
        if (!media) return;
        const newVotes = media.votes + delta;
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("match_media").update({ votes: newVotes }).eq("id", mediaId);
          if (reportWriteError("votar", error)) return;
        }
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  media: m.media.map((med) =>
                    med.id === mediaId ? { ...med, votes: newVotes } : med
                  ),
                }
              : m
          ),
        });
      },

      addAward: async (a) => {
        const sb = getSupabaseBrowserClient();
        let award: Award = { ...a, id: uid("aw") };
        if (sb) {
          const { data, error } = await sb
            .from("awards")
            .insert({
              type: a.type,
              season: a.season,
              player_id: a.playerId,
              player_ids: a.playerIds,
              note: a.note,
            })
            .select()
            .single();
          if (reportWriteError("agregar el premio", error)) throw error;
          if (data) award = awardFromRow(data);
        }
        set({ awards: [...get().awards, award] });
      },

      deleteAward: async (id) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("awards").delete().eq("id", id);
          if (reportWriteError("borrar el premio", error)) return;
        }
        set({ awards: get().awards.filter((a) => a.id !== id) });
      },

      addInjury: async (i) => {
        const sb = getSupabaseBrowserClient();
        let injury: Injury = { ...i, id: uid("inj") };
        if (sb) {
          const { data, error } = await sb
            .from("injuries")
            .insert({
              player_id: i.playerId,
              injury_name: i.injuryName,
              start_date: i.startDate,
              estimated_return_date: i.estimatedReturnDate,
              notes: i.notes,
            })
            .select()
            .single();
          if (reportWriteError("agregar la lesión", error)) throw error;
          if (data) injury = injuryFromRow(data);
        }
        set({ injuries: [...get().injuries, injury] });
      },

      updateInjury: async (id, patch) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const row: Record<string, unknown> = {};
          if (patch.injuryName !== undefined) row.injury_name = patch.injuryName;
          if (patch.startDate !== undefined) row.start_date = patch.startDate;
          if (patch.estimatedReturnDate !== undefined) row.estimated_return_date = patch.estimatedReturnDate;
          if (patch.notes !== undefined) row.notes = patch.notes;
          const { error } = await sb.from("injuries").update(row).eq("id", id);
          if (reportWriteError("actualizar la lesión", error)) return;
        }
        set({
          injuries: get().injuries.map((inj) => (inj.id === id ? { ...inj, ...patch } : inj)),
        });
      },

      deleteInjury: async (id) => {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { error } = await sb.from("injuries").delete().eq("id", id);
          if (reportWriteError("borrar la lesión", error)) return;
        }
        set({ injuries: get().injuries.filter((inj) => inj.id !== id) });
      },
    }),
    {
      name: "futbol-champagne-store",
      storage: createJSONStorage(() => safeStateStorage),
      version: 4,
      migrate: (persisted) => {
        const state = persisted as Partial<AppState> | undefined;
        if (state?.matches) {
          state.matches = repairLegacyState(state.matches);
        }
        if (state?.players) {
          state.players = repairLegacyPlayers(state.players);
        }
        return state;
      },
      partialize: (state) => ({
        players: state.players,
        matches: state.matches,
        awards: state.awards,
        injuries: state.injuries,
      }),
    }
  )
);

export function useHydrateStore() {
  const loadAll = useAppStore((s) => s.loadAll);
  const hydrated = useAppStore((s) => s.hydrated);
  return { loadAll, hydrated };
}
