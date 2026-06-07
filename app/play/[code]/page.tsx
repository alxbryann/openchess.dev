"use client";

import { use, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTournamentByCode } from "@/lib/hooks";
import { joinTournamentByCode } from "@/lib/join";
import { getJoinedPlayerId, rememberJoinedPlayer } from "@/lib/local";
import { useTournamentStore } from "@/lib/store";
import { Tournament, Pairing, Round } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KnightMark, LoadingMark, OCBadge } from "@/components/oc";
import {
  JoinStatusDialog,
  runWithJoinSteps,
  type JoinStatus,
} from "@/components/JoinStatusDialog";
import { Search, ChevronRight, Trophy, Users, X, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

function scoreStr(score: number) {
  return score % 1 === 0.5 ? `${Math.floor(score)}½` : String(score);
}

function getPlayerPairing(tournament: Tournament, playerId: string, round: Round): Pairing | undefined {
  return round.pairings.find(p => p.whiteId === playerId || p.blackId === playerId);
}

function ColorBadge({ color }: { color: "white" | "black" }) {
  return (
    <div
      className={cn(
        "w-14 h-14 rounded-[var(--radius-lg)] flex items-center justify-center text-lg font-mono font-bold shrink-0 border-2",
        color === "white"
          ? "bg-[#fef3c7] border-[#fcd34d] text-[#44403c]"
          : "bg-ink-900 border-ink-700 text-ink-300"
      )}
    >
      {color === "white" ? "W" : "B"}
    </div>
  );
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

  const isWhite = pairing.whiteId === playerId;
  const opponentId = isWhite ? pairing.blackId : pairing.whiteId;
  const opponent = opponentId ? tournament.players.find(p => p.id === opponentId) : null;
  const isBye = !pairing.blackId;

  const resultLabel = () => {
    if (pairing.result === "*") return null;
    if (isBye) return { text: "Bye — punto gratis", color: "text-[var(--green-600)]" };
    if (pairing.result === "1-0")
      return isWhite
        ? { text: "Victoria", color: "text-gold" }
        : { text: "Derrota", color: "text-ink-500" };
    if (pairing.result === "0-1")
      return !isWhite
        ? { text: "Victoria", color: "text-gold" }
        : { text: "Derrota", color: "text-ink-500" };
    if (pairing.result === "1/2-1/2")
      return { text: "Tablas ½", color: "text-[var(--warning)]" };
    return null;
  };

  const result = resultLabel();

  return (
    <div className="rounded-[var(--radius-xl)] p-5 space-y-5 border border-[color-mix(in_srgb,var(--brand)_25%,transparent)] bg-brand-tint">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-3xl leading-none text-[color-mix(in_srgb,var(--brand)_40%,transparent)]">
            {pairing.board}
          </span>
          <span className="text-sm text-ink-500">Tablero</span>
        </div>
        {round.status === "active" && (
          <OCBadge tone="live" dot size="sm">
            En juego
          </OCBadge>
        )}
      </div>

      <div className="flex items-center gap-4">
        <ColorBadge color={isWhite ? "white" : "black"} />
        <div>
          <div className="font-semibold text-base text-ink-900">
            Juegas con las {isWhite ? "Blancas" : "Negras"}
          </div>
          <div className="text-sm text-ink-500 mt-0.5">
            {isWhite ? "Mueves primero" : "Esperas la primera jugada"}
          </div>
        </div>
      </div>

      {isBye ? (
        <div className="rounded-[var(--radius-lg)] p-4 text-center bg-surface-sunk">
          <div className="font-semibold text-ink-900">Descansas esta ronda</div>
          <div className="text-sm text-ink-500 mt-1">+1 punto automático</div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] p-4 bg-surface-sunk">
          <div className="text-xs text-ink-500 mb-1.5">Rival</div>
          <div className="font-display font-bold text-xl text-ink-900">
            {opponent?.name ?? "?"}
          </div>
          <div className="text-sm text-ink-500 mt-0.5 font-mono">
            {opponent?.rating ?? "—"} elo · {scoreStr(opponent?.score ?? 0)} pts
          </div>
        </div>
      )}

      {result && (
        <div className={`text-center font-display font-bold text-2xl ${result.color}`}>
          {result.text}
        </div>
      )}
    </div>
  );
}

export default function PlayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { tournament, loading } = useTournamentByCode(code);
  const upsertLocal = useTournamentStore(s => s.upsertLocal);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [joinName, setJoinName] = useState("");
  const [joinRating, setJoinRating] = useState("");
  const [joining, setJoining] = useState(false);
  const [pendingPlayerId, setPendingPlayerId] = useState<string | null>(null);
  const [status, setStatus] = useState<JoinStatus>({ open: false });
  const [pendingWarned, setPendingWarned] = useState(false);
  const joinFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("p");
    const id = fromUrl || getJoinedPlayerId(code);
    setPendingPlayerId(id);
    if (fromUrl || id) {
      setStatus({
        open: true,
        mode: "loading",
        step: "Cargando tu inscripción en el torneo…",
        code: code.toUpperCase(),
      });
    }
  }, [code]);

  useEffect(() => {
    if (!tournament || selectedId || !pendingPlayerId) return;
    if (!tournament.players.some(p => p.id === pendingPlayerId)) return;

    setSelectedId(pendingPlayerId);
    rememberJoinedPlayer(code, pendingPlayerId);
    setPendingPlayerId(null);
    setStatus({ open: false });

    const params = new URLSearchParams(window.location.search);
    if (params.has("p")) {
      params.delete("p");
      const qs = params.toString();
      window.history.replaceState({}, "", qs ? `/play/${code}?${qs}` : `/play/${code}`);
    }
  }, [tournament, code, selectedId, pendingPlayerId]);

  useEffect(() => {
    if (loading || pendingWarned || selectedId || !pendingPlayerId) return;

    if (!tournament) {
      if (!loading) {
        setStatus({
          open: true,
          mode: "error",
          error: "not_found",
          code: code.toUpperCase(),
        });
        setPendingWarned(true);
      }
      return;
    }

    if (tournament.players.some(p => p.id === pendingPlayerId)) return;

    const timer = window.setTimeout(() => {
      if (selectedId) return;
      if (tournament.players.some(p => p.id === pendingPlayerId)) return;

      setStatus({
        open: true,
        mode: "pending",
        title: "No pudimos confirmarte en el torneo",
        message:
          "La página cargó pero tu inscripción no aparece todavía. Puede ser un retraso de conexión. Usa el formulario de abajo para inscribirte de nuevo.",
        code: code.toUpperCase(),
        playerId: pendingPlayerId,
      });
      setPendingWarned(true);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [loading, tournament, selectedId, pendingPlayerId, pendingWarned, code]);

  function closeStatus() {
    setStatus({ open: false });
    setJoining(false);
  }

  async function handleQuickJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!joinName.trim()) {
      setStatus({
        open: true,
        mode: "error",
        error: "empty_name",
        code: code.toUpperCase(),
      });
      return;
    }

    setJoining(true);
    setStatus({
      open: true,
      mode: "loading",
      step: "Validando tu inscripción…",
      code: code.toUpperCase(),
    });

    const result = await runWithJoinSteps(
      step =>
        setStatus({
          open: true,
          mode: "loading",
          step,
          code: code.toUpperCase(),
        }),
      () =>
        joinTournamentByCode(
          code,
          joinName,
          joinRating ? parseInt(joinRating, 10) : undefined
        )
    );

    setJoining(false);

    if (!result.ok) {
      setStatus({
        open: true,
        mode: "error",
        error: result.error,
        code: code.toUpperCase(),
        detail: result.detail,
      });
      return;
    }

    upsertLocal(result.tournament);
    rememberJoinedPlayer(code, result.playerId);
    setSelectedId(result.playerId);
    setPendingPlayerId(null);
    setJoinName("");
    setJoinRating("");
    setStatus({
      open: true,
      mode: "success",
      title: "¡Inscripción lista!",
      message: "Ya estás dentro del torneo.",
      tournamentName: result.tournament.name,
    });
    window.setTimeout(() => setStatus({ open: false }), 1200);
  }

  function selectPlayer(playerId: string) {
    setSelectedId(playerId);
    rememberJoinedPlayer(code, playerId);
    setSearch("");
  }

  if (loading && !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <LoadingMark />
      </div>
    );
  }

  if (!tournament) {
    return (
      <>
        <JoinStatusDialog
          status={
            status.open
              ? status
              : {
                  open: true,
                  mode: "error",
                  error: "not_found",
                  code: code.toUpperCase(),
                }
          }
          onClose={closeStatus}
          onRetry={() => {
            closeStatus();
            window.location.href = `/join?code=${encodeURIComponent(code)}`;
          }}
        />
        <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-6 bg-paper">
          <LoadingMark className="opacity-30" />
          <div className="text-center space-y-2">
            <h1 className="font-display text-xl font-bold text-ink-900">
              Torneo no encontrado
            </h1>
            <p className="text-ink-500 text-sm">
              Verifica que el código{" "}
              <span className="font-mono text-brand-text oc-code">{code}</span> sea
              correcto.
            </p>
          </div>
        </div>
      </>
    );
  }

  const activeRound = tournament.rounds.find(r => r.status === "active");
  const selectedPlayer = tournament.players.find(p => p.id === selectedId);
  const filtered = tournament.players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  const standings = [...tournament.players].sort(
    (a, b) => b.score - a.score || b.rating - a.rating
  );

  return (
    <>
      <JoinStatusDialog
        status={status}
        onClose={closeStatus}
        onRetry={() => {
          closeStatus();
          if (status.open && status.mode === "pending") {
            joinFormRef.current?.scrollIntoView({ behavior: "smooth" });
            document.getElementById("join-name")?.focus();
            return;
          }
          joinFormRef.current?.requestSubmit();
        }}
      />
      <div className="min-h-screen max-w-md mx-auto px-4 pb-10 bg-paper">
      <header className="pt-7 pb-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-[var(--radius-md)] flex items-center justify-center bg-brand-tint border border-[color-mix(in_srgb,var(--brand)_25%,transparent)]">
            <KnightMark size={16} />
          </div>
          <span className="oc-eyebrow">openchess.dev</span>
        </div>
        <h1 className="font-display text-2xl font-bold leading-tight text-ink-900">
          {tournament.name}
        </h1>
        <div className="flex items-center gap-2 mt-1.5 text-sm text-ink-500 flex-wrap">
          {tournament.location && <span>{tournament.location}</span>}
          {tournament.location && <span className="text-ink-300">·</span>}
          <span>
            Ronda{" "}
            {tournament.rounds.filter(r => r.status !== "pending").length}/
            {tournament.totalRounds}
          </span>
          {activeRound && (
            <>
              <span className="text-ink-300">·</span>
              <OCBadge tone="live" dot size="sm">
                En juego
              </OCBadge>
            </>
          )}
        </div>
      </header>

      {selectedPlayer && activeRound ? (
        <section className="mb-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg text-ink-900">
              Mi partida
            </h2>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs text-ink-500 gap-1"
              onClick={() => setSelectedId(null)}
            >
              <X className="h-3 w-3" />
              Cambiar
            </Button>
          </div>
          <PlayerGameCard
            tournament={tournament}
            playerId={selectedPlayer.id}
            round={activeRound}
          />
        </section>
      ) : (
        <section className="mb-7 space-y-4">
          <h2 className="font-display font-semibold text-lg text-ink-900">
            ¿Quién eres?
          </h2>

          <form
            ref={joinFormRef}
            onSubmit={handleQuickJoin}
            className="rounded-[var(--radius-xl)] border border-line bg-surface p-4 space-y-3"
          >
            <p className="text-sm text-ink-500">
              ¿Primera vez aquí? Inscríbete con tu nombre.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="join-name">Tu nombre</Label>
              <Input
                id="join-name"
                placeholder="Juan Pérez"
                value={joinName}
                onChange={e => setJoinName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="join-rating">
                Tu elo
                <span className="text-ink-400 ml-1 font-normal">(opcional)</span>
              </Label>
              <Input
                id="join-rating"
                type="number"
                placeholder="1500"
                min={100}
                max={3500}
                value={joinRating}
                onChange={e => setJoinRating(e.target.value)}
                className="font-mono"
              />
            </div>
            <Button type="submit" disabled={joining} className="w-full gap-2">
              <LogIn className="h-4 w-4" />
              {joining ? "Inscribiendo..." : "Inscribirme en el torneo"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-paper px-2 text-ink-400">ya inscrito</span>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <Input
              className="pl-9"
              placeholder="Busca tu nombre..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search.length > 0 && (
            <div className="space-y-1">
              {filtered.length === 0 ? (
                <p className="text-ink-500 text-sm text-center py-5">
                  No se encontró &quot;{search}&quot;.{" "}
                  <Link href={`/join?code=${code}`} className="text-brand-text font-medium">
                    Inscríbete aquí
                  </Link>
                </p>
              ) : (
                filtered.map(p => (
                  <button
                    key={p.id}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-[var(--radius-lg)] bg-surface-sunk hover:bg-surface border border-transparent hover:border-line transition-colors text-left group"
                    onClick={() => selectPlayer(p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-ink-900">
                        {p.name}
                      </div>
                      <div className="text-xs text-ink-500 font-mono mt-0.5">
                        {p.rating} elo · {scoreStr(p.score)} pts
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-ink-300 group-hover:text-brand transition-colors shrink-0" />
                  </button>
                ))
              )}
            </div>
          )}
          {!activeRound && tournament.rounds.length === 0 && (
            <div className="text-center py-4 text-ink-500 text-sm">
              El torneo aún no ha comenzado.
            </div>
          )}
        </section>
      )}

      {activeRound && (
        <section className="mb-7">
          <h2 className="font-display font-semibold text-base mb-3 text-ink-900">
            Ronda {activeRound.number} — Todos los tableros
          </h2>
          <div className="space-y-2">
            {activeRound.pairings.map(pairing => {
              const white = tournament.players.find(p => p.id === pairing.whiteId);
              const black = pairing.blackId
                ? tournament.players.find(p => p.id === pairing.blackId)
                : null;
              const isMyGame =
                selectedId &&
                (pairing.whiteId === selectedId || pairing.blackId === selectedId);

              return (
                <div
                  key={pairing.id}
                  className={cn(
                    "rounded-[var(--radius-lg)] border p-3 flex items-center gap-3 text-sm transition-all",
                    isMyGame
                      ? "bg-brand-tint border-[color-mix(in_srgb,var(--brand)_30%,transparent)]"
                      : "bg-surface border-line"
                  )}
                >
                  <div className="w-7 text-center font-mono text-xs font-bold text-ink-300 shrink-0">
                    {pairing.board}
                  </div>
                  <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "truncate text-right text-sm",
                        pairing.result === "1-0" && "text-brand-text font-semibold"
                      )}
                    >
                      {white?.name ?? "?"}
                    </span>
                    <span className="text-ink-400 text-xs font-mono shrink-0 w-12 text-center">
                      {pairing.result === "*"
                        ? "vs"
                        : pairing.result === "1/2-1/2"
                        ? "½–½"
                        : pairing.result}
                    </span>
                    <span
                      className={cn(
                        "truncate text-sm",
                        pairing.result === "0-1" && "text-brand-text font-semibold"
                      )}
                    >
                      {black?.name ?? "BYE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {standings.length > 0 && tournament.status !== "setup" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="h-4 w-4 text-ink-400" />
            <h2 className="font-display font-semibold text-base text-ink-900">
              Clasificación
            </h2>
          </div>
          <div className="space-y-1.5">
            {standings.slice(0, 10).map((p, idx) => (
              <div
                key={p.id}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm transition-colors border",
                  p.id === selectedId
                    ? "bg-brand-tint border-[color-mix(in_srgb,var(--brand)_25%,transparent)]"
                    : idx === 0
                    ? "bg-[color-mix(in_srgb,var(--gold)_8%,transparent)] border-[color-mix(in_srgb,var(--gold)_20%,transparent)]"
                    : "bg-surface border-line"
                )}
              >
                <span className="w-5 text-center text-xs font-bold text-ink-400">
                  {idx + 1}
                </span>
                <span
                  className={cn(
                    "flex-1 font-medium truncate",
                    idx === 0 && "text-gold"
                  )}
                >
                  {p.name}
                </span>
                <span
                  className={cn(
                    "font-mono font-bold text-sm",
                    idx === 0 && "text-gold"
                  )}
                >
                  {scoreStr(p.score)}
                </span>
                <span className="text-ink-400 text-xs">pts</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {!activeRound && tournament.players.length > 0 && tournament.status === "setup" && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-ink-400" />
            <h2 className="font-display font-semibold text-base text-ink-900">
              Jugadores inscritos
            </h2>
          </div>
          <div className="space-y-1.5">
            {tournament.players.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] text-sm bg-surface border border-line"
              >
                <span className="flex-1 font-medium text-ink-900">{p.name}</span>
                <span className="text-ink-500 font-mono text-xs">{p.rating}</span>
              </div>
            ))}
          </div>
        </section>
      )}
      </div>
    </>
  );
}
