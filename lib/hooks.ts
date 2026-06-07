"use client";

import { useEffect, useState } from "react";
import { useTournamentStore } from "./store";
import { getMyTournamentIds } from "./local";
import type { Tournament } from "./types";

/** Load a tournament by id, then keep it live via Realtime. */
export function useTournament(id: string) {
  const tournament = useTournamentStore(s => s.tournaments.find(t => t.id === id));
  const fetchById = useTournamentStore(s => s.fetchTournamentById);
  const subscribe = useTournamentStore(s => s.subscribeTournament);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchById(id).finally(() => {
      if (!cancelled) setLoading(false);
    });
    const unsub = subscribe(id);
    return () => {
      cancelled = true;
      unsub();
    };
  }, [id, fetchById, subscribe]);

  return { tournament, loading };
}

/** Load a tournament by share code, then keep it live via Realtime. */
export function useTournamentByCode(code: string) {
  const fetchByCode = useTournamentStore(s => s.fetchTournamentByCode);
  const subscribe = useTournamentStore(s => s.subscribeTournament);
  const [id, setId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tournament = useTournamentStore(s =>
    id ? s.tournaments.find(t => t.id === id) : undefined
  );

  useEffect(() => {
    let cancelled = false;
    let unsub: (() => void) | undefined;
    setLoading(true);
    fetchByCode(code)
      .then(t => {
        if (cancelled || !t) return;
        setId(t.id);
        unsub = subscribe(t.id);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      unsub?.();
    };
  }, [code, fetchByCode, subscribe]);

  return { tournament, loading };
}

/** Load the tournaments owned by the user (and locally remembered ones). */
export function useMyTournaments(): { tournaments: Tournament[]; loading: boolean } {
  const tournaments = useTournamentStore(s => s.tournaments);
  const fetchMine = useTournamentStore(s => s.fetchMyTournaments);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchMine(getMyTournamentIds()).finally(() => {
      if (!cancelled) setLoading(false);
    });
  }, [fetchMine]);

  return { tournaments, loading };
}
