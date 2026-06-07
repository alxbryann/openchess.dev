"use client";

import { use, useEffect, useState } from "react";
import { useTournament } from "@/lib/hooks";
import { Tournament } from "@/lib/types";
import { KnightMark } from "@/components/oc";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

function scoreStr(score: number) {
  return score % 1 === 0.5 ? `${Math.floor(score)}½` : String(score);
}

function PlayerName({
  tournament,
  id,
  result,
  side,
}: {
  tournament: Tournament;
  id: string | null;
  result: string;
  side: "white" | "black";
}) {
  if (!id) return <span className="text-ink-300 italic">BYE</span>;
  const player = tournament.players.find(p => p.id === id);
  const isWinner =
    (side === "white" && result === "1-0") ||
    (side === "black" && result === "0-1");
  const isDraw = result === "1/2-1/2";
  return (
    <span
      className={cn(
        isWinner ? "text-gold" : isDraw ? "text-ink-300" : "text-white"
      )}
    >
      {player?.name ?? "?"}
    </span>
  );
}

function ColorDot({ color }: { color: "white" | "black" }) {
  return (
    <div
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 border-2",
        color === "white"
          ? "bg-[#fef3c7] border-[#fcd34d] text-[#44403c]"
          : "bg-ink-900 border-ink-700 text-ink-300"
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
      <div className="min-h-screen flex items-center justify-center bg-ink-900 text-ink-300">
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
    <div className="min-h-screen flex flex-col overflow-hidden bg-ink-900 text-white relative">
      <div className="absolute inset-0 chess-pattern-dark opacity-60 pointer-events-none" />

      <header className="relative flex items-center justify-between px-4 sm:px-8 py-3 sm:py-5 border-b border-white/10">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center bg-[color-mix(in_srgb,var(--gold)_15%,transparent)] border border-[color-mix(in_srgb,var(--gold)_30%,transparent)]">
            <KnightMark size={28} color="var(--gold)" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">
              {tournament.name}
            </h1>
            <p className="text-sm mt-0.5 text-ink-300">
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
          <div className="text-sm mt-0.5 capitalize text-ink-300">
            {format(time, "EEEE d MMM", { locale: es })}
          </div>
        </div>
      </header>

      {displayRound ? (
        <div className="relative flex flex-1 overflow-hidden">
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-8 py-3 border-b border-[color-mix(in_srgb,var(--gold)_15%,transparent)] bg-[color-mix(in_srgb,var(--gold)_6%,transparent)]">
              <div className="flex items-center gap-4">
                {activeRound ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
                    <span className="text-[var(--green-400)] font-semibold text-sm oc-eyebrow">
                      En juego
                    </span>
                  </div>
                ) : (
                  <span className="text-sm oc-eyebrow text-ink-300">
                    Última ronda
                  </span>
                )}
                <span className="text-ink-700">·</span>
                <span className="font-display text-2xl font-bold text-gold">
                  Ronda {displayRound.number}
                </span>
              </div>
              <span className="text-sm text-ink-300">
                {displayRound.pairings.length} tableros
              </span>
            </div>

            <div className="flex-1 overflow-auto px-3 sm:px-8 py-4 sm:py-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {displayRound.pairings.map(pairing => {
                  const white = tournament.players.find(
                    p => p.id === pairing.whiteId
                  );
                  const black = pairing.blackId
                    ? tournament.players.find(p => p.id === pairing.blackId)
                    : null;
                  const hasResult = pairing.result !== "*";

                  return (
                    <div
                      key={pairing.id}
                      className={cn(
                        "rounded-[var(--radius-xl)] p-5 transition-all border",
                        hasResult
                          ? "bg-white/[0.03] border-white/10 opacity-75"
                          : "bg-[color-mix(in_srgb,var(--gold)_5%,transparent)] border-[color-mix(in_srgb,var(--gold)_25%,transparent)]"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display font-black text-4xl leading-none text-[color-mix(in_srgb,var(--gold)_30%,transparent)]">
                          {pairing.board}
                        </span>
                        {hasResult && (
                          <span className="font-mono text-sm px-3 py-1 rounded-full bg-white/10 text-ink-300">
                            {pairing.result === "1/2-1/2"
                              ? "½ – ½"
                              : pairing.result}
                          </span>
                        )}
                        {!hasResult && pairing.blackId === null && (
                          <span className="text-sm text-gold/60">BYE</span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <ColorDot color="white" />
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "font-bold text-xl leading-tight truncate",
                              pairing.result === "1-0" ? "text-gold" : "text-white"
                            )}
                          >
                            {white?.name ?? "?"}
                          </div>
                          <div className="text-sm mt-0.5 text-ink-500">
                            {white?.rating} · {white?.score} pts
                          </div>
                        </div>
                      </div>

                      <div className="border-t my-3 border-white/10" />

                      <div className="flex items-center gap-3">
                        <ColorDot color="black" />
                        <div className="min-w-0">
                          {black ? (
                            <>
                              <div
                                className={cn(
                                  "font-bold text-xl leading-tight truncate",
                                  pairing.result === "0-1"
                                    ? "text-gold"
                                    : "text-white"
                                )}
                              >
                                {black.name}
                              </div>
                              <div className="text-sm mt-0.5 text-ink-500">
                                {black.rating} · {black.score} pts
                              </div>
                            </>
                          ) : (
                            <div className="text-xl text-ink-500">BYE</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {standings.length > 0 && tournament.status !== "setup" && (
            <div className="hidden sm:flex w-64 xl:w-72 flex-col border-l border-white/10 overflow-hidden shrink-0 bg-[color-mix(in_srgb,var(--ink-900)_85%,black)]">
              <div className="px-5 py-3 border-b border-white/10">
                <h2 className="font-display font-bold text-sm oc-eyebrow text-gold">
                  Clasificación
                </h2>
              </div>
              <div className="flex-1 overflow-auto py-3 px-3 space-y-1">
                {standings.map((p, i) => (
                  <div
                    key={p.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]",
                      i === 0 &&
                        "bg-[color-mix(in_srgb,var(--gold)_8%,transparent)]"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm font-bold w-5 text-center shrink-0",
                        i === 0 ? "text-gold" : "text-ink-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    <span
                      className={cn(
                        "flex-1 text-sm font-medium truncate",
                        i === 0 ? "text-gold" : "text-ink-300"
                      )}
                    >
                      {p.name}
                    </span>
                    <span
                      className={cn(
                        "font-mono font-bold text-sm shrink-0",
                        i === 0 ? "text-gold" : "text-ink-400"
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
              <KnightMark size={72} color="var(--gold)" className="opacity-40" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold text-ink-500">
              Esperando inicio
            </p>
            <p className="text-lg mt-2 text-ink-700">{tournament.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
