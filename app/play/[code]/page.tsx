"use client";

import { use, useEffect, useState } from "react";
import { useTournamentByCode } from "@/lib/hooks";
import { getJoinedPlayerId } from "@/lib/local";
import { Tournament, Pairing, Round } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Trophy, Users, X } from "lucide-react";

function scoreStr(score: number) {
  return score % 1 === 0.5 ? `${Math.floor(score)}½` : String(score);
}

function getPlayerPairing(tournament: Tournament, playerId: string, round: Round): Pairing | undefined {
  return round.pairings.find(p => p.whiteId === playerId || p.blackId === playerId);
}

function PlayerGameCard({
  tournament,
  playerId,
  round,
}: {
  tournament: Tournament;
  playerId: string;
  round: Round;
}) {
  const pairing = getPlayerPairing(tournament, playerId, round);
  if (!pairing) return null;

  const isWhite    = pairing.whiteId === playerId;
  const opponentId = isWhite ? pairing.blackId : pairing.whiteId;
  const opponent   = opponentId ? tournament.players.find(p => p.id === opponentId) : null;
  const isBye      = !pairing.blackId;

  const resultLabel = () => {
    if (pairing.result === "*") return null;
    if (isBye) return { text: "Bye — punto gratis", color: "text-green-400" };
    if (pairing.result === "1-0")
      return isWhite
        ? { text: "Victoria ♛", color: "text-yellow-400" }
        : { text: "Derrota", color: "text-muted-foreground" };
    if (pairing.result === "0-1")
      return !isWhite
        ? { text: "Victoria ♛", color: "text-yellow-400" }
        : { text: "Derrota", color: "text-muted-foreground" };
    if (pairing.result === "1/2-1/2")
      return { text: "Tablas ½", color: "text-amber-400" };
    return null;
  };

  const result = resultLabel();

  return (
    <div
      className="rounded-2xl p-5 space-y-5 border"
      style={{
        background: "oklch(0.74 0.135 78 / 5%)",
        borderColor: "oklch(0.74 0.135 78 / 25%)",
      }}
    >
      {/* Board number + live badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="font-display font-black text-3xl leading-none select-none"
            style={{ color: "oklch(0.74 0.135 78 / 40%)" }}
          >
            {pairing.board}
          </span>
          <span className="text-sm text-muted-foreground">Tablero</span>
        </div>
        {round.status === "active" && (
          <div className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            En juego
          </div>
        )}
      </div>

      {/* Color indicator */}
      <div className="flex items-center gap-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold select-none shrink-0"
          style={
            isWhite
              ? { background: "#fef3c7", border: "2px solid #fcd34d", color: "#44403c" }
              : { background: "#18181b", border: "2px solid #52525b", color: "#d4d4d8" }
          }
        >
          {isWhite ? "♔" : "♚"}
        </div>
        <div>
          <div className="font-semibold text-base">
            Juegas con las {isWhite ? "Blancas" : "Negras"}
          </div>
          <div className="text-sm text-muted-foreground mt-0.5">
            {isWhite ? "Mueves primero" : "Esperas la primera jugada"}
          </div>
        </div>
      </div>

      {/* Opponent */}
      {isBye ? (
        <div
          className="rounded-xl p-4 text-center"
          style={{ background: "oklch(1 0 0 / 4%)" }}
        >
          <div className="text-2xl mb-1 select-none">🎯</div>
          <div className="font-semibold">Descansas esta ronda</div>
          <div className="text-sm text-muted-foreground mt-1">+1 punto automático</div>
        </div>
      ) : (
        <div className="rounded-xl p-4" style={{ background: "oklch(1 0 0 / 4%)" }}>
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Rival</div>
          <div className="font-display font-bold text-xl">{opponent?.name ?? "?"}</div>
          <div className="text-sm text-muted-foreground mt-0.5 font-mono">
            {opponent?.rating ?? "—"} elo · {scoreStr(opponent?.score ?? 0)} pts
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`text-center font-display font-bold text-2xl ${result.color}`}>
          {result.text}
        </div>
      )}
    </div>
  );
}

export default function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code }             = use(params);
  const { tournament, loading } = useTournamentByCode(code);
  const [search, setSearch]  = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the player this device joined as (if they're still in the list).
  useEffect(() => {
    if (!tournament || selectedId) return;
    const joinedId = getJoinedPlayerId(code);
    if (joinedId && tournament.players.some(p => p.id === joinedId)) {
      setSelectedId(joinedId);
    }
  }, [tournament, code, selectedId]);

  if (loading && !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl opacity-30 select-none animate-pulse">♟</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6">
        <div className="text-5xl opacity-30 select-none">♟</div>
        <div className="text-center space-y-2">
          <h1 className="font-display text-xl font-bold">Torneo no encontrado</h1>
          <p className="text-muted-foreground text-sm">
            Verifica que el código <span className="font-mono text-primary">"{code}"</span> sea correcto.
          </p>
        </div>
      </div>
    );
  }

  const activeRound    = tournament.rounds.find(r => r.status === "active");
  const selectedPlayer = tournament.players.find(p => p.id === selectedId);
  const filtered       = tournament.players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const standings = [...tournament.players].sort(
    (a, b) => b.score - a.score || b.rating - a.rating
  );

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-10">
      {/* ── Header ── */}
      <header className="pt-7 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-sm select-none"
            style={{ background: "oklch(0.74 0.135 78 / 12%)", border: "1px solid oklch(0.74 0.135 78 / 25%)" }}
          >
            ♔
          </div>
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Chess Tournaments</span>
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight">{tournament.name}</h1>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-muted-foreground flex-wrap">
          {tournament.location && <span>{tournament.location}</span>}
          {tournament.location && <span className="text-muted-foreground/30">·</span>}
          <span>
            Ronda {tournament.rounds.filter(r => r.status !== "pending").length}/{tournament.totalRounds}
          </span>
          {activeRound && (
            <>
              <span className="text-muted-foreground/30">·</span>
              <span className="text-green-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                En juego
              </span>
            </>
          )}
        </div>
      </header>

      {/* ── My game ── */}
      {selectedPlayer && activeRound ? (
        <section className="mb-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg">Mi partida</h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-muted-foreground gap-1"
              onClick={() => setSelectedId(null)}
            >
              <X className="h-3 w-3" />
              Cambiar
            </Button>
          </div>
          <PlayerGameCard tournament={tournament} playerId={selectedPlayer.id} round={activeRound} />
        </section>
      ) : (
        /* Player picker */
        <section className="mb-7">
          <h2 className="font-display font-semibold text-lg mb-3">¿Quién eres?</h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
            <Input
              className="pl-9 bg-secondary/40 border-border/60 h-10"
              placeholder="Busca tu nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search.length > 0 && (
            <div className="space-y-1">
              {filtered.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-5">
                  No se encontró "{search}"
                </p>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 active:bg-secondary transition-colors text-left group"
                    onClick={() => {
                      setSelectedId(p.id);
                      setSearch("");
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{p.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">
                        {p.rating} elo · {scoreStr(p.score)} pts
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
          {!activeRound && tournament.rounds.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              El torneo aún no ha comenzado.
            </div>
          )}
        </section>
      )}

      {/* ── All pairings this round ── */}
      {activeRound && (
        <section className="mb-7">
          <h2 className="font-display font-semibold text-base mb-3">
            Ronda {activeRound.number} — Todos los tableros
          </h2>
          <div className="space-y-2">
            {activeRound.pairings.map(pairing => {
              const white   = tournament.players.find(p => p.id === pairing.whiteId);
              const black   = pairing.blackId ? tournament.players.find(p => p.id === pairing.blackId) : null;
              const isMyGame = selectedId &&
                (pairing.whiteId === selectedId || pairing.blackId === selectedId);

              return (
                <div
                  key={pairing.id}
                  className="rounded-xl border p-3 flex items-center gap-3 text-sm transition-all"
                  style={{
                    background: isMyGame
                      ? "oklch(0.74 0.135 78 / 6%)"
                      : "oklch(0.11 0.009 265)",
                    borderColor: isMyGame
                      ? "oklch(0.74 0.135 78 / 30%)"
                      : "oklch(1 0 0 / 7%)",
                  }}
                >
                  <div className="w-7 text-center font-mono text-xs font-bold text-muted-foreground/40 shrink-0">
                    {pairing.board}
                  </div>
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
                    <span className={`truncate text-right text-sm ${pairing.result === "1-0" ? "text-primary font-semibold" : ""}`}>
                      {white?.name ?? "?"}
                    </span>
                    <span className="text-muted-foreground/50 text-xs font-mono shrink-0 w-12 text-center">
                      {pairing.result === "*" ? "vs" : pairing.result === "1/2-1/2" ? "½–½" : pairing.result}
                    </span>
                    <span className={`truncate text-sm ${pairing.result === "0-1" ? "text-primary font-semibold" : ""}`}>
                      {black?.name ?? "BYE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Standings ── */}
      {standings.length > 0 && tournament.status !== "setup" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-muted-foreground/50" />
            <h2 className="font-display font-semibold text-base">Clasificación</h2>
          </div>
          <div className="space-y-1.5">
            {standings.slice(0, 10).map((p, idx) => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                style={{
                  background:
                    p.id === selectedId
                      ? "oklch(0.74 0.135 78 / 8%)"
                      : idx === 0
                      ? "oklch(0.74 0.135 78 / 4%)"
                      : "oklch(0.11 0.009 265)",
                  border: `1px solid ${
                    p.id === selectedId
                      ? "oklch(0.74 0.135 78 / 25%)"
                      : idx === 0
                      ? "oklch(0.74 0.135 78 / 12%)"
                      : "oklch(1 0 0 / 5%)"
                  }`,
                }}
              >
                <span className="w-5 text-center text-xs font-bold text-muted-foreground/40">
                  {idx + 1}
                </span>
                <span
                  className="flex-1 font-medium truncate"
                  style={{ color: idx === 0 ? "oklch(0.74 0.135 78)" : undefined }}
                >
                  {p.name}
                </span>
                <span
                  className="font-mono font-bold text-sm"
                  style={{ color: idx === 0 ? "oklch(0.74 0.135 78)" : undefined }}
                >
                  {scoreStr(p.score)}
                </span>
                <span className="text-muted-foreground/40 text-xs">pts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Setup: player list */}
      {!activeRound && tournament.players.length > 0 && tournament.status === "setup" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-muted-foreground/50" />
            <h2 className="font-display font-semibold text-base">Jugadores inscritos</h2>
          </div>
          <div className="space-y-1.5">
            {tournament.players.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "oklch(0.11 0.009 265)", border: "1px solid oklch(1 0 0 / 5%)" }}
              >
                <span className="flex-1 font-medium">{p.name}</span>
                <span className="text-muted-foreground font-mono text-xs">{p.rating}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
