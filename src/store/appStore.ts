"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { safeGet, safeSet, safeRemove } from "@/lib/safeStorage";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { DEMO_AWARDS, DEMO_MATCHES, DEMO_PLAYERS } from "@/lib/data/demoData";
import { isValidSlotCode } from "@/lib/formation";
import { nextMatchISODate } from "@/lib/matchDay";
import type {
  Award,
  LineupSlot,
  Match,
  MatchMedia,
  Player,
  PlayerMatchStat,
} from "@/lib/data/types";
import {
  awardFromRow,
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      players: DEMO_PLAYERS,
      matches: DEMO_MATCHES,
      awards: DEMO_AWARDS,
      hydrated: false,
      isDemo: !isSupabaseConfigured,

      loadAll: async () => {
        const sb = getSupabaseBrowserClient();
        if (!sb) {
          set({ hydrated: true, isDemo: true });
          return;
        }
        try {
          const [{ data: playerRows }, { data: matchRows }, { data: lineupRows }, { data: statRows }, { data: mediaRows }, { data: awardRows }] =
            await Promise.all([
              sb.from("players").select("*").order("name"),
              sb.from("matches").select("*").order("date", { ascending: false }),
              sb.from("lineup_slots").select("*"),
              sb.from("player_match_stats").select("*"),
              sb.from("match_media").select("*"),
              sb.from("awards").select("*"),
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

          set({ players, matches, awards, hydrated: true, isDemo: false });
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
          if (!error && data) player = playerFromRow(data);
        }
        set({ players: [...get().players, player] });
        return player;
      },

      updatePlayer: async (id, patch) => {
        set({
          players: get().players.map((pl) => (pl.id === id ? { ...pl, ...patch, attributes: { ...pl.attributes, ...(patch.attributes ?? {}) } } : pl)),
        });
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.from("players").update(playerToRow(patch)).eq("id", id);
      },

      deletePlayer: async (id) => {
        set({ players: get().players.filter((p) => p.id !== id) });
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.from("players").delete().eq("id", id);
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
          if (!error && data) match = matchFromRow(data, [], [], []);
        }
        set({ matches: [match, ...get().matches] });
        return match;
      },

      updateMatch: async (id, patch) => {
        set({
          matches: get().matches.map((m) => (m.id === id ? { ...m, ...patch } : m)),
        });
        const sb = getSupabaseBrowserClient();
        if (sb && Object.keys(matchToRow(patch)).length) {
          await sb.from("matches").update(matchToRow(patch)).eq("id", id);
        }
      },

      deleteMatch: async (id) => {
        set({ matches: get().matches.filter((m) => m.id !== id) });
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.from("matches").delete().eq("id", id);
      },

      setLineupSlot: async (matchId, slot) => {
        // Assigning a player bumps out whoever else was in that exact
        // team+slot, and pulls the player out of any other slot they
        // occupied — a player can only be in one spot at a time.
        let bumpedPlayerId: string | null = null;
        set({
          matches: get().matches.map((m) => {
            if (m.id !== matchId) return m;
            const bumped = m.lineup.find(
              (l) => l.team === slot.team && l.slot === slot.slot && l.playerId !== slot.playerId
            );
            bumpedPlayerId = bumped?.playerId ?? null;
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
        const sb = getSupabaseBrowserClient();
        if (sb) {
          if (bumpedPlayerId) {
            await sb
              .from("lineup_slots")
              .delete()
              .eq("match_id", matchId)
              .eq("player_id", bumpedPlayerId);
          }
          await sb.from("lineup_slots").upsert(
            {
              match_id: matchId,
              player_id: slot.playerId,
              team: slot.team,
              slot: slot.slot,
            },
            { onConflict: "match_id,player_id" }
          );
        }
      },

      removeLineupSlot: async (matchId, playerId) => {
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? { ...m, lineup: m.lineup.filter((l) => l.playerId !== playerId) }
              : m
          ),
        });
        const sb = getSupabaseBrowserClient();
        if (sb) {
          await sb
            .from("lineup_slots")
            .delete()
            .eq("match_id", matchId)
            .eq("player_id", playerId);
        }
      },

      clearLineup: async (matchId) => {
        set({
          matches: get().matches.map((m) => (m.id === matchId ? { ...m, lineup: [] } : m)),
        });
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.from("lineup_slots").delete().eq("match_id", matchId);
      },

      upsertStat: async (matchId, stat) => {
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
        const sb = getSupabaseBrowserClient();
        if (sb) {
          await sb
            .from("player_match_stats")
            .upsert(statToRow(matchId, stat), { onConflict: "match_id,player_id" });
        }
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
          if (!error && data) newMedia = mediaFromRow(data);
        }
        set({
          matches: get().matches.map((m) =>
            m.id === matchId ? { ...m, media: [...m.media, newMedia] } : m
          ),
        });
      },

      voteMedia: async (matchId, mediaId, delta) => {
        set({
          matches: get().matches.map((m) =>
            m.id === matchId
              ? {
                  ...m,
                  media: m.media.map((med) =>
                    med.id === mediaId ? { ...med, votes: med.votes + delta } : med
                  ),
                }
              : m
          ),
        });
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const match = get().matches.find((m) => m.id === matchId);
          const media = match?.media.find((med) => med.id === mediaId);
          if (media) await sb.from("match_media").update({ votes: media.votes }).eq("id", mediaId);
        }
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
          if (!error && data) award = awardFromRow(data);
        }
        set({ awards: [...get().awards, award] });
      },

      deleteAward: async (id) => {
        set({ awards: get().awards.filter((a) => a.id !== id) });
        const sb = getSupabaseBrowserClient();
        if (sb) await sb.from("awards").delete().eq("id", id);
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
      }),
    }
  )
);

export function useHydrateStore() {
  const loadAll = useAppStore((s) => s.loadAll);
  const hydrated = useAppStore((s) => s.hydrated);
  return { loadAll, hydrated };
}
