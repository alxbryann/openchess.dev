"use client";

import { Tournament, GameResult } from "@/lib/types";
import { useTournamentStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Play, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

const RESULT_OPTIONS: { value: GameResult; label: string }[] = [
  { value: "1-0",     label: "Blancas ganan (1-0)" },
  { value: "0-1",     label: "Negras ganan (0-1)" },
  { value: "1/2-1/2", label: "Tablas (½-½)" },
  { value: "*",       label: "Sin resultado" },
];

function getPlayer(tournament: Tournament, id: string | null) {
  if (!id) return null;
  return tournament.players.find(p => p.id === id) ?? null;
}

export function RoundManager({ tournament }: { tournament: Tournament }) {
  const generateNextRound = useTournamentStore(s => s.generateNextRound);
  const publishRound      = useTournamentStore(s => s.publishRound);
  const updateResult      = useTournamentStore(s => s.updateResult);
  const finishRound       = useTournamentStore(s => s.finishRound);

  const activeRound    = tournament.rounds.find(r => r.status === "active");
  const pendingRound   = tournament.rounds.find(r => r.status === "pending");
  const finishedRounds = tournament.rounds.filter(r => r.status === "finished");
  const currentRound   = activeRound ?? pendingRound;

  const canGenerateNext =
    !currentRound &&
    tournament.players.length >= 2 &&
    tournament.rounds.length < tournament.totalRounds;

  const allResultsIn =
    currentRound?.pairings.every(p => p.result !== "*" || p.blackId === null) ?? false;

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Rondas del torneo</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tournament.rounds.length} de {tournament.totalRounds} generadas
          </p>
        </div>
        {canGenerateNext && (
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => {
              generateNextRound(tournament.id);
              toast.success(`Ronda ${tournament.rounds.length + 1} generada`);
            }}
          >
            <Zap className="h-3.5 w-3.5" />
            Generar ronda {tournament.rounds.length + 1}
          </Button>
        )}
      </div>

      {/* ── Empty state ── */}
      {tournament.rounds.length === 0 && (
        <div className="text-center py-14 text-muted-foreground text-sm">
          {tournament.players.length < 2
            ? "Necesitas al menos 2 jugadores para generar una ronda."
            : 'Haz clic en "Generar ronda 1" para comenzar.'}
        </div>
      )}

      {/* ── Current round ── */}
      {currentRound && (
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Round header */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/30 border-b border-border">
            <div className="flex items-center gap-2.5">
              {currentRound.status === "active" ? (
                <>
                  <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ background: "var(--green-500)" }} />
                  <span className="font-display font-semibold">Ronda {currentRound.number}</span>
                  <span className="text-xs" style={{ color: "var(--green-600)" }}>En juego</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/30 shrink-0" />
                  <span className="font-display font-semibold">Ronda {currentRound.number}</span>
                  <span className="text-xs text-muted-foreground">Pendiente</span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              {currentRound.status === "pending" && (
                <Button
                  size="sm"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => {
                    publishRound(tournament.id, currentRound.number);
                    toast.success(`Ronda ${currentRound.number} publicada`);
                  }}
                >
                  <Play className="h-3 w-3" />
                  Publicar
                </Button>
              )}
              {currentRound.status === "active" && allResultsIn && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  onClick={() => {
                    finishRound(tournament.id, currentRound.number);
                    toast.success(`Ronda ${currentRound.number} cerrada`);
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" style={{ color: "var(--green-500)" }} />
                  Cerrar ronda
                </Button>
              )}
            </div>
          </div>

          {/* Pairings */}
          <div className="divide-y divide-border">
            {currentRound.pairings.map(pairing => {
              const white  = getPlayer(tournament, pairing.whiteId);
              const black  = getPlayer(tournament, pairing.blackId);
              const isBye  = pairing.blackId === null;
              const whiteWins = pairing.result === "1-0";
              const blackWins = pairing.result === "0-1";

              return (
                <div key={pairing.id} className="flex items-center gap-1.5 sm:gap-3 px-2 sm:px-4 py-3">
                  {/* Board # */}
                  <div className="hidden sm:block w-7 text-center font-mono text-xs font-bold text-muted-foreground/40 shrink-0">
                    {pairing.board}
                  </div>

                  {/* White player */}
                  <div className="flex-1 flex items-center justify-end gap-1 sm:gap-2.5 min-w-0">
                    <div className="text-right min-w-0">
                      <div className={`text-sm font-medium truncate ${whiteWins ? "text-primary" : ""}`}>
                        {white?.name ?? "?"}
                      </div>
                      <div className="hidden sm:block text-xs text-muted-foreground font-mono">
                        {white?.rating} · {white?.score}p
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#fef3c7] border-2 border-[#fcd34d] flex items-center justify-center text-[#44403c] text-[10px] font-mono font-bold shrink-0">
                      W
                    </div>
                  </div>

                  {/* Result / separator */}
                  <div className="shrink-0 w-16 sm:w-24 flex justify-center">
                    {isBye ? (
                      <span className="text-xs bg-secondary/80 px-2 py-1 rounded-md font-mono text-muted-foreground">
                        BYE
                      </span>
                    ) : currentRound.status === "active" ? (
                      <Select
                        value={pairing.result}
                        onValueChange={v =>
                          updateResult(tournament.id, currentRound.number, pairing.id, v as GameResult)
                        }
                      >
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RESULT_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-xs font-mono text-muted-foreground/50">vs</span>
                    )}
                  </div>

                  {/* Black player */}
                  <div className="flex-1 flex items-center gap-1 sm:gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-ink-900 border-2 border-ink-700 flex items-center justify-center text-ink-300 text-[10px] font-mono font-bold shrink-0">
                      B
                    </div>
                    <div className="min-w-0">
                      <div className={`text-sm font-medium truncate ${blackWins ? "text-primary" : ""}`}>
                        {isBye ? <span className="text-muted-foreground/40 italic">—</span> : (black?.name ?? "?")}
                      </div>
                      {!isBye && (
                        <div className="hidden sm:block text-xs text-muted-foreground font-mono">
                          {black?.rating} · {black?.score}p
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Finished rounds ── */}
      {finishedRounds.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
            Rondas finalizadas
          </h4>
          {[...finishedRounds].reverse().map(round => (
            <details key={round.id} className="group rounded-lg border border-border overflow-hidden">
              <summary className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition-colors select-none list-none">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                <span className="font-display font-semibold text-sm flex-1">
                  Ronda {round.number}
                </span>
                <span className="text-xs text-muted-foreground">{round.pairings.length} partidas</span>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="divide-y divide-border">
                {round.pairings.map(p => {
                  const whitePlayer = getPlayer(tournament, p.whiteId);
                  const blackPlayer = getPlayer(tournament, p.blackId);
                  return (
                    <div key={p.id} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs">
                      <span className="hidden sm:inline w-5 text-center text-muted-foreground/40 font-mono">{p.board}</span>
                      <span className={`flex-1 text-right truncate ${p.result === "1-0" ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {whitePlayer?.name ?? "?"}
                      </span>
                      <span className="w-10 sm:w-14 text-center font-mono bg-secondary/50 rounded px-1 py-0.5 text-muted-foreground shrink-0">
                        {p.result === "1/2-1/2" ? "½-½" : p.result}
                      </span>
                      <span className={`flex-1 truncate ${p.result === "0-1" ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                        {blackPlayer?.name ?? (p.blackId === null ? "BYE" : "?")}
                      </span>
                    </div>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
