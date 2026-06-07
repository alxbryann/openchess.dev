"use client";

import { use, useEffect, useState } from "react";
import { useTournament } from "@/lib/hooks";
import { KnightMark, OCBadge } from "@/components/oc";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

function scoreStr(score: number) {
  return score % 1 === 0.5 ? `${Math.floor(score)}½` : String(score);
}

function ColorDot({ color }: { color: "white" | "black" }) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border-2",
        color === "white"
          ? "bg-paper border-gold/50 text-ink-900"
          : "bg-ink-900 border-ink-700 text-paper"
      )}
    >
      {color === "white" ? "W" : "B"}
    </div>
  );
}

export default function DisplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { tournament } = useTournament(id);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper text-ink-500">
        <p>Torneo no encontrado</p>
      </div>
    );
  }

  const activeRound = tournament.rounds.find(r => r.status === "active");
  const lastFinished = [...tournament.rounds]
    .filter(r => r.status === "finished")
    .pop();
  const displayRound = activeRound ?? lastFinished;

  const standings = [...tournament.players]
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .slice(0, 8);

  return (
    <div className="min-h-screen flex flex-col overflow-hidden bg-paper relative">
      <div className="absolute inset-0 chess-pattern opacity-30 pointer-events-none" />

      <header className="relative flex items-center justify-between px-4 sm:px-8 py-3 sm:py-4 border-b border-line bg-surface/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-[var(--radius-md)] flex items-center justify-center bg-brand-tint border border-brand/20">
            <KnightMark size={24} />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold leading-tight text-ink-900">
              {tournament.name}
            </h1>
            <p className="text-xs mt-0.5 text-ink-500">
              {tournament.location && `${tournament.location} · `}
              {format(new Date(tournament.date), "d MMMM yyyy", { locale: es })}
              {" · "}
              {tournament.timeControl}
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-2xl sm:text-4xl font-bold text-gold">
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-xs mt-0.5 capitalize text-ink-500">
            {format(time, "EEEE d MMM", { locale: es })}
          </div>
        </div>
      </header>

      {displayRound ? (
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-8 py-3 border-b border-line bg-surface-sunk">
              <div className="flex items-center gap-4">
                {activeRound ? (
                  <OCBadge tone="live" dot mono size="sm">En juego</OCBadge>
                ) : (
                  <OCBadge tone="neutral" mono size="sm">Última ronda</OCBadge>
                )}
                <span className="text-ink-300">·</span>
                <span className="font-display text-2xl font-bold text-gold">
                  Ronda {displayRound.number}
                </span>
              </div>
              <span className="text-sm text-ink-500">
                {displayRound.pairings.length} tableros
              </span>
            </div>

            <div className="flex-1 overflow-auto px-3 sm:px-8 py-4 sm:py-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {displayRound.pairings.map(pairing => {
                  const white = tournament.players.find(p => p.id === pairing.whiteId);
                  const black = pairing.blackId
                    ? tournament.players.find(p => p.id === pairing.blackId)
                    : null;
                  const hasResult = pairing.result !== "*";

                  return (
                    <div
                      key={pairing.id}
                      className={cn(
                        "rounded-[var(--radius-xl)] border transition-all",
                        hasResult
                          ? "bg-surface-sunk border-line opacity-60"
                          : "bg-surface border-line shadow-sm"
                      )}
                    >
                      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
                        <span className="font-display font-black text-3xl leading-none text-gold/30">
                          {pairing.board}
                        </span>
                        {hasResult && (
                          <OCBadge tone="neutral" mono size="sm">
                            {pairing.result === "1/2-1/2" ? "½ – ½" : pairing.result}
                          </OCBadge>
                        )}
                        {!hasResult && pairing.blackId === null && (
                          <OCBadge tone="gold" size="sm">BYE</OCBadge>
                        )}
                      </div>

                      <div className="px-5 py-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <ColorDot color="white" />
                          <div className="min-w-0">
                            <div
                              className={cn(
                                "font-bold text-xl leading-tight truncate",
                                pairing.result === "1-0" ? "text-gold" : "text-ink-900"
                              )}
                            >
                              {white?.name ?? "?"}
                            </div>
                            <div className="text-sm mt-0.5 text-ink-500 font-mono">
                              {white?.rating} · {white?.score} pts
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-line" />

                        <div className="flex items-center gap-3">
                          <ColorDot color="black" />
                          <div className="min-w-0">
                            {black ? (
                              <>
                                <div
                                  className={cn(
                                    "font-bold text-xl leading-tight truncate",
                                    pairing.result === "0-1" ? "text-gold" : "text-ink-900"
                                  )}
                                >
                                  {black.name}
                                </div>
                                <div className="text-sm mt-0.5 text-ink-500 font-mono">
                                  {black.rating} · {black.score} pts
                                </div>
                              </>
                            ) : (
                              <div className="text-xl text-ink-400">BYE</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {standings.length > 0 && tournament.status !== "setup" && (
            <div className="hidden sm:flex w-64 xl:w-72 flex-col border-l border-line overflow-hidden shrink-0 bg-surface">
              <div className="px-5 py-3 border-b border-line">
                <h2 className="oc-eyebrow text-brand">Clasificación</h2>
              </div>
              <div className="flex-1 overflow-auto py-3 px-3 space-y-1">
                {standings.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]",
                      i === 0 ? "bg-gold/[0.06] border border-gold/20" : "hover:bg-surface-sunk"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-bold w-5 text-center shrink-0",
                        i === 0 ? "text-gold" : "text-ink-400"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium truncate",
                        i === 0 ? "text-gold" : "text-ink-900"
                      )}
                    >
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-bold text-sm shrink-0",
                        i === 0 ? "text-gold" : "text-ink-500"
                      )}
                    >
                      {scoreStr(p.score)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="grid grid-cols-8 grid-rows-8 w-48 h-48 rounded-[var(--radius-xl)] overflow-hidden opacity-20">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      (Math.floor(i / 8) + (i % 8)) % 2 === 0
                        ? "var(--board-dark)"
                        : "var(--board-light)",
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <KnightMark size={72} className="opacity-30" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-ink-400">
              Esperando inicio
            </p>
            <p className="text-lg mt-2 text-ink-500">{tournament.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
