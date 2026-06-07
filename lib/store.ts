import { create } from 'zustand';
import { Tournament, Player, GameResult, PairingSystem, Round, Pairing } from './types';
import { generateSwissPairings } from './pairing/swiss';
import { generateRoundRobinPairings } from './pairing/roundrobin';
import { generateEliminationPairings } from './pairing/elimination';
import { createClient } from './supabase/client';
import { rememberTournamentId, forgetTournamentId } from './local';
import type { Database, Json } from './database.types';

const supabase = createClient();

type Row = Database['public']['Tables']['tournaments']['Row'];

function nanoid(len = 8): string {
  return Math.random().toString(36).slice(2, 2 + len);
}

function generateShareCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// ── Row <-> Tournament mapping ──────────────────────────────────────────────
export function rowToTournament(row: Row): Tournament {
  const data = (row.data ?? {}) as { players?: Player[]; rounds?: Round[] };
  return {
    id: row.id,
    name: row.name,
    location: row.location ?? '',
    date: row.date ?? '',
    timeControl: row.time_control ?? '',
    system: row.system as PairingSystem,
    totalRounds: row.total_rounds ?? 0,
    status: row.status as Tournament['status'],
    shareCode: row.share_code,
    createdAt: row.created_at ?? new Date().toISOString(),
    players: data.players ?? [],
    rounds: data.rounds ?? [],
  };
}

// Columns we own and may overwrite on update (never owner_id / share_code / id).
function tournamentToUpdate(t: Tournament) {
  return {
    name: t.name,
    location: t.location,
    date: t.date,
    time_control: t.timeControl,
    system: t.system,
    total_rounds: t.totalRounds,
    status: t.status,
    data: { players: t.players, rounds: t.rounds } as unknown as Json,
  };
}

function applyResults(tournament: Tournament): Tournament {
  // Recalculate all scores from scratch based on finished rounds
  const players = tournament.players.map(p => ({
    ...p,
    score: 0,
    colorHistory: [] as ('white' | 'black')[],
    opponents: [] as string[],
  }));

  for (const round of tournament.rounds) {
    if (round.status !== 'finished') continue;
    for (const pairing of round.pairings) {
      const white = players.find(p => p.id === pairing.whiteId);
      const black = pairing.blackId ? players.find(p => p.id === pairing.blackId) : null;

      if (white) white.colorHistory.push('white');
      if (black) black.colorHistory.push('black');
      if (white && black) {
        white.opponents.push(black.id);
        black.opponents.push(white.id);
      }

      if (pairing.result === '1-0') {
        if (white) white.score += 1;
      } else if (pairing.result === '0-1') {
        if (black) black.score += 1;
      } else if (pairing.result === '1/2-1/2') {
        if (white) white.score += 0.5;
        if (black) black.score += 0.5;
      } else if (pairing.result === 'bye') {
        if (white) white.score += 1;
      }
    }
  }

  return { ...tournament, players };
}

interface TournamentStore {
  tournaments: Tournament[];

  // loaders
  fetchTournamentById: (id: string) => Promise<Tournament | null>;
  fetchTournamentByCode: (code: string) => Promise<Tournament | null>;
  fetchMyTournaments: (extraIds: string[]) => Promise<void>;
  upsertLocal: (t: Tournament) => void;
  subscribeTournament: (id: string) => () => void;

  // mutations (optimistic local + async Supabase write)
  createTournament: (data: {
    name: string;
    location: string;
    date: string;
    timeControl: string;
    system: PairingSystem;
    totalRounds: number;
  }) => Tournament;
  deleteTournament: (id: string) => void;
  addPlayer: (tournamentId: string, data: { name: string; rating: number }) => void;
  removePlayer: (tournamentId: string, playerId: string) => void;
  generateNextRound: (tournamentId: string) => void;
  publishRound: (tournamentId: string, roundNumber: number) => void;
  updateResult: (tournamentId: string, roundNumber: number, pairingId: string, result: GameResult) => void;
  finishRound: (tournamentId: string, roundNumber: number) => void;
}

export const useTournamentStore = create<TournamentStore>()((set, get) => {
  // Merge a tournament into the in-memory cache (used by loaders, realtime, mutations).
  function mergeLocal(t: Tournament) {
    set(state => {
      const idx = state.tournaments.findIndex(x => x.id === t.id);
      if (idx === -1) return { tournaments: [...state.tournaments, t] };
      const next = [...state.tournaments];
      next[idx] = t;
      return { tournaments: next };
    });
  }

  // Persist a tournament's owned columns to Supabase.
  async function persist(t: Tournament) {
    const { error } = await supabase
      .from('tournaments')
      .update(tournamentToUpdate(t))
      .eq('id', t.id);
    if (error) console.error('persist tournament failed:', error.message);
  }

  // Apply a local mutation to a tournament then persist it.
  function mutate(id: string, fn: (t: Tournament) => Tournament) {
    const current = get().tournaments.find(t => t.id === id);
    if (!current) return;
    const next = fn(current);
    mergeLocal(next);
    void persist(next);
  }

  return {
    tournaments: [],

    upsertLocal: mergeLocal,

    fetchTournamentById: async (id) => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (error || !data) return null;
      const t = rowToTournament(data);
      mergeLocal(t);
      return t;
    },

    fetchTournamentByCode: async (code) => {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('share_code', code.toUpperCase())
        .maybeSingle();
      if (error || !data) return null;
      const t = rowToTournament(data);
      mergeLocal(t);
      return t;
    },

    fetchMyTournaments: async (extraIds) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;

      const seen = new Map<string, Tournament>();

      if (uid) {
        const { data } = await supabase
          .from('tournaments')
          .select('*')
          .eq('owner_id', uid);
        (data ?? []).forEach(r => seen.set(r.id, rowToTournament(r)));
      }

      if (extraIds.length > 0) {
        const { data } = await supabase
          .from('tournaments')
          .select('*')
          .in('id', extraIds);
        (data ?? []).forEach(r => seen.set(r.id, rowToTournament(r)));
      }

      set({
        tournaments: [...seen.values()].sort(
          (a, b) => (a.createdAt < b.createdAt ? -1 : 1)
        ),
      });
    },

    subscribeTournament: (id) => {
      const channel = supabase
        .channel(`tournament:${id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'tournaments', filter: `id=eq.${id}` },
          (payload) => {
            if (payload.eventType === 'DELETE') {
              set(state => ({ tournaments: state.tournaments.filter(t => t.id !== id) }));
            } else {
              mergeLocal(rowToTournament(payload.new as Row));
            }
          }
        )
        .subscribe();
      return () => {
        void supabase.removeChannel(channel);
      };
    },

    createTournament: (data) => {
      const tournament: Tournament = {
        id: crypto.randomUUID(),
        ...data,
        players: [],
        rounds: [],
        status: 'setup',
        shareCode: generateShareCode(),
        createdAt: new Date().toISOString(),
      };
      mergeLocal(tournament);
      rememberTournamentId(tournament.id);

      // Insert with owner_id if signed in (set asynchronously).
      void (async () => {
        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from('tournaments').insert({
          id: tournament.id,
          share_code: tournament.shareCode,
          owner_id: userData.user?.id ?? null,
          name: tournament.name,
          location: tournament.location,
          date: tournament.date,
          time_control: tournament.timeControl,
          system: tournament.system,
          total_rounds: tournament.totalRounds,
          status: tournament.status,
          data: { players: [], rounds: [] } as unknown as Json,
        });
        if (error) console.error('createTournament failed:', error.message);
      })();

      return tournament;
    },

    deleteTournament: (id) => {
      set(state => ({ tournaments: state.tournaments.filter(t => t.id !== id) }));
      forgetTournamentId(id);
      void supabase.from('tournaments').delete().eq('id', id);
    },

    addPlayer: (tournamentId, data) => {
      const player: Player = {
        id: nanoid(),
        name: data.name,
        rating: data.rating,
        score: 0,
        colorHistory: [],
        opponents: [],
        hasBye: false,
        active: true,
      };
      mutate(tournamentId, t => ({ ...t, players: [...t.players, player] }));
    },

    removePlayer: (tournamentId, playerId) => {
      mutate(tournamentId, t => ({
        ...t,
        players: t.players.filter(p => p.id !== playerId),
      }));
    },

    generateNextRound: (tournamentId) => {
      mutate(tournamentId, tournament => {
        const roundNumber = tournament.rounds.length + 1;
        let pairings: Pairing[] = [];

        if (tournament.system === 'swiss') {
          pairings = generateSwissPairings(tournament.players);
        } else if (tournament.system === 'roundrobin') {
          pairings = generateRoundRobinPairings(tournament.players, roundNumber);
        } else if (tournament.system === 'elimination') {
          const prevPairings = tournament.rounds.map(r => r.pairings);
          pairings = generateEliminationPairings(tournament.players, roundNumber, prevPairings);
        }

        const round: Round = {
          id: nanoid(),
          number: roundNumber,
          pairings,
          status: 'pending',
        };

        return { ...tournament, rounds: [...tournament.rounds, round], status: 'active' };
      });
    },

    publishRound: (tournamentId, roundNumber) => {
      mutate(tournamentId, t => ({
        ...t,
        rounds: t.rounds.map(r =>
          r.number === roundNumber
            ? { ...r, status: 'active', publishedAt: new Date().toISOString() }
            : r
        ),
      }));
    },

    updateResult: (tournamentId, roundNumber, pairingId, result) => {
      mutate(tournamentId, t => ({
        ...t,
        rounds: t.rounds.map(r => {
          if (r.number !== roundNumber) return r;
          return {
            ...r,
            pairings: r.pairings.map(p => (p.id === pairingId ? { ...p, result } : p)),
          };
        }),
      }));
    },

    finishRound: (tournamentId, roundNumber) => {
      mutate(tournamentId, t => {
        const updated: Tournament = {
          ...t,
          rounds: t.rounds.map(r =>
            r.number === roundNumber ? { ...r, status: 'finished' } : r
          ),
        };
        return applyResults(updated);
      });
    },
  };
});
