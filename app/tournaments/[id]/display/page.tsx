"use client";

import { use, useEffect, useState } from "react";
import { useTournament } from "@/lib/hooks";
import { Tournament } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
  if (!id) return <span className="text-white/30 italic">BYE</span>;
  const player = tournament.players.find(p => p.id === id);
  const isWinner =
    (side === "white" && result === "1-0") ||
    (side === "black" && result === "0-1");
  const isDraw = result === "1/2-1/2";
  return (
    <span
      className={
        isWinner
          ? "text-yellow-300"
          : isDraw
          ? "text-amber-300/80"
          : "text-white"
      }
    >
      {player?.name ?? "?"}
    </span>
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
      <div className="min-h-screen flex items-center justify-center bg-[#06060a] text-white">
        <p className="text-white/40">Torneo no encontrado</p>
      </div>
    );
  }

  const activeRound  = tournament.rounds.find(r => r.status === "active");
  const lastFinished = [...tournament.rounds].filter(r => r.status === "finished").pop();
  const displayRound = activeRound ?? lastFinished;

  const standings = [...tournament.players]
    .sort((a, b) => b.score - a.score || b.rating - a.rating)
    .slice(0, 8);

  return (
    <div
      className="min-h-screen flex flex-col overflow-hidden"
      style={{ background: "oklch(0.06 0.008 265)", color: "oklch(0.93 0.015 88)" }}
    >
      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-8 py-5 border-b"
        style={{ borderColor: "oklch(1 0 0 / 8%)" }}>
        <div className="flex items-center gap-5">
          {/* Emblem */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl select-none"
            style={{ background: "oklch(0.74 0.135 78 / 15%)", border: "1px solid oklch(0.74 0.135 78 / 30%)" }}
          >
            ♔
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold leading-tight">{tournament.name}</h1>
            <p className="text-sm mt-0.5" style={{ color: "oklch(0.50 0.01 265)" }}>
              {tournament.location && `${tournament.location} · `}
              {format(new Date(tournament.date), "d MMMM yyyy", { locale: es })}
              {" · "}
              {tournament.timeControl}
            </p>
          </div>
        </div>

        {/* Clock */}
        <div className="text-right">
          <div className="font-mono text-4xl font-bold" style={{ color: "oklch(0.74 0.135 78)" }}>
            {format(time, "HH:mm:ss")}
          </div>
          <div className="text-sm mt-0.5 capitalize" style={{ color: "oklch(0.50 0.01 265)" }}>
            {format(time, "EEEE d MMM", { locale: es })}
          </div>
        </div>
      </header>

      {displayRound ? (
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: pairings ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Round header */}
            <div
              className="flex items-center justify-between px-8 py-3 border-b"
              style={{
                background: "oklch(0.74 0.135 78 / 6%)",
                borderColor: "oklch(0.74 0.135 78 / 15%)",
              }}
            >
              <div className="flex items-center gap-4">
                {activeRound ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-green-400 font-semibold text-sm uppercase tracking-widest">
                      En juego
                    </span>
                  </div>
                ) : (
                  <span className="text-sm uppercase tracking-widest" style={{ color: "oklch(0.50 0.01 265)" }}>
                    Última ronda
                  </span>
                )}
                <span style={{ color: "oklch(0.30 0 0)" }}>·</span>
                <span className="font-display text-2xl font-bold" style={{ color: "oklch(0.74 0.135 78)" }}>
                  Ronda {displayRound.number}
                </span>
              </div>
              <span className="text-sm" style={{ color: "oklch(0.50 0.01 265)" }}>
                {displayRound.pairings.length} tableros
              </span>
            </div>

            {/* Pairings grid */}
            <div className="flex-1 overflow-auto px-8 py-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                {displayRound.pairings.map(pairing => {
                  const white    = tournament.players.find(p => p.id === pairing.whiteId);
                  const black    = pairing.blackId ? tournament.players.find(p => p.id === pairing.blackId) : null;
                  const hasResult = pairing.result !== "*";

                  return (
                    <div
                      key={pairing.id}
                      className="rounded-2xl p-5 transition-all"
                      style={{
                        background: hasResult
                          ? "oklch(1 0 0 / 3%)"
                          : "oklch(0.74 0.135 78 / 5%)",
                        border: `1px solid ${hasResult
                          ? "oklch(1 0 0 / 10%)"
                          : "oklch(0.74 0.135 78 / 25%)"}`,
                        opacity: hasResult ? 0.75 : 1,
                      }}
                    >
                      {/* Board # and result */}
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className="font-display font-black text-4xl leading-none select-none"
                          style={{ color: "oklch(0.74 0.135 78 / 30%)" }}
                        >
                          {pairing.board}
                        </span>
                        {hasResult && (
                          <span
                            className="font-mono text-sm px-3 py-1 rounded-full"
                            style={{ background: "oklch(1 0 0 / 8%)", color: "oklch(0.80 0 0)" }}
                          >
                            {pairing.result === "1/2-1/2" ? "½ – ½" : pairing.result}
                          </span>
                        )}
                        {!hasResult && pairing.blackId === null && (
                          <span className="text-sm" style={{ color: "oklch(0.74 0.135 78 / 60%)" }}>BYE</span>
                        )}
                      </div>

                      {/* White player */}
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold select-none shrink-0"
                          style={{ background: "#fef3c7", border: "2px solid #fcd34d", color: "#44403c" }}
                        >
                          ♔
                        </div>
                        <div className="min-w-0">
                          <div className={`font-bold text-xl leading-tight truncate ${pairing.result === "1-0" ? "text-yellow-300" : "text-white"}`}>
                            {white?.name ?? "?"}
                          </div>
                          <div className="text-sm mt-0.5" style={{ color: "oklch(0.45 0 0)" }}>
                            {white?.rating} · {white?.score} pts
                          </div>
                        </div>
                      </div>

                      <div className="border-t my-3" style={{ borderColor: "oklch(1 0 0 / 8%)" }} />

                      {/* Black player */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold select-none shrink-0"
                          style={{ background: "#18181b", border: "2px solid #52525b", color: "#d4d4d8" }}
                        >
                          ♚
                        </div>
                        <div className="min-w-0">
                          {black ? (
                            <>
                              <div className={`font-bold text-xl leading-tight truncate ${pairing.result === "0-1" ? "text-yellow-300" : "text-white"}`}>
                                {black.name}
                              </div>
                              <div className="text-sm mt-0.5" style={{ color: "oklch(0.45 0 0)" }}>
                                {black.rating} · {black.score} pts
                              </div>
                            </>
                          ) : (
                            <div className="text-xl" style={{ color: "oklch(0.35 0 0)" }}>BYE</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Right: live standings ── */}
          {standings.length > 0 && tournament.status !== "setup" && (
            <div
              className="w-64 xl:w-72 flex flex-col border-l overflow-hidden shrink-0"
              style={{ borderColor: "oklch(1 0 0 / 8%)", background: "oklch(0.08 0.008 265)" }}
            >
              <div
                className="px-5 py-3 border-b"
                style={{ borderColor: "oklch(1 0 0 / 8%)" }}
              >
                <h2 className="font-display font-bold text-sm uppercase tracking-widest" style={{ color: "oklch(0.74 0.135 78)" }}>
                  Clasificación
                </h2>
              </div>
              <div className="flex-1 overflow-auto py-3 px-3 space-y-1">
                {standings.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                    style={{
                      background: i === 0 ? "oklch(0.74 0.135 78 / 8%)" : "transparent",
                    }}
                  >
                    <span
                      className="text-sm font-bold w-5 text-center shrink-0"
                      style={{ color: i === 0 ? "oklch(0.74 0.135 78)" : "oklch(0.40 0 0)" }}
                    >
                      {i + 1}
                    </span>
                    <span
                      className="flex-1 text-sm font-medium truncate"
                      style={{ color: i === 0 ? "oklch(0.74 0.135 78)" : "oklch(0.80 0 0)" }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="font-mono font-bold text-sm shrink-0"
                      style={{ color: i === 0 ? "oklch(0.74 0.135 78)" : "oklch(0.65 0 0)" }}
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
        /* Waiting state */
        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className="grid grid-cols-8 grid-rows-8 w-48 h-48 rounded-3xl overflow-hidden opacity-15">
              {Array.from({ length: 64 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background:
                      (Math.floor(i / 8) + (i % 8)) % 2 === 0
                        ? "oklch(0.74 0.135 78 / 80%)"
                        : "oklch(0.20 0 0)",
                  }}
                />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center text-7xl opacity-40 select-none">
              ♔
            </div>
          </div>
          <div className="text-center">
            <p className="font-display text-4xl font-bold" style={{ color: "oklch(0.25 0 0)" }}>
              Esperando inicio
            </p>
            <p className="text-lg mt-2" style={{ color: "oklch(0.30 0 0)" }}>
              {tournament.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
