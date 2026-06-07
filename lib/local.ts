"use client";

// Lightweight browser-only pointers so the dashboard works without login,
// and so a joined player can be auto-selected on the play screen.
// The real data lives in Supabase; these are just references.

const MINE_KEY = "chess:my-tournament-ids";
const PLAYER_KEY = "chess:joined-player"; // map shareCode -> playerId

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota / private-mode errors
  }
}

export function getMyTournamentIds(): string[] {
  return readJSON<string[]>(MINE_KEY, []);
}

export function rememberTournamentId(id: string) {
  const ids = getMyTournamentIds();
  if (!ids.includes(id)) writeJSON(MINE_KEY, [...ids, id]);
}

export function forgetTournamentId(id: string) {
  writeJSON(
    MINE_KEY,
    getMyTournamentIds().filter((x) => x !== id)
  );
}

export function getJoinedPlayerId(shareCode: string): string | null {
  const map = readJSON<Record<string, string>>(PLAYER_KEY, {});
  return map[shareCode.toUpperCase()] ?? null;
}

export function rememberJoinedPlayer(shareCode: string, playerId: string) {
  const map = readJSON<Record<string, string>>(PLAYER_KEY, {});
  map[shareCode.toUpperCase()] = playerId;
  writeJSON(PLAYER_KEY, map);
}
