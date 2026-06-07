"use client";

import { Tournament } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";

const MEDAL_GLYPHS = ["♛", "♜", "♝"];
const MEDAL_STYLES = [
  { row: "bg-yellow-400/6 border border-yellow-400/20", score: "text-yellow-400", pos: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10" },
  { row: "bg-zinc-400/5 border border-zinc-400/15",     score: "text-zinc-300",   pos: "text-zinc-400 border-zinc-400/30 bg-zinc-400/8" },
  { row: "bg-amber-700/5 border border-amber-700/15",   score: "text-amber-600",  pos: "text-amber-700 border-amber-700/30 bg-amber-700/8" },
];

function scoreStr(score: number) {
  return score % 1 === 0.5 ? `${Math.floor(score)}½` : String(score);
}

export function StandingsTable({ tournament }: { tournament: Tournament }) {
  const players = [...tournament.players].sort((a, b) =>
    b.score !== a.score ? b.score - a.score : b.rating - a.rating
  );

  if (tournament.status === "setup" || players.length === 0) {
    return (
      <div className="text-center py-14 text-muted-foreground text-sm">
        Las clasificaciones aparecerán una vez que comience el torneo.
      </div>
    );
  }

  const maxScore = players[0]?.score || 1;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-sm">Clasificación General</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {players.length} jugadores · {tournament.rounds.filter(r => r.status === "finished").length} rondas jugadas
        </p>
      </div>

      {/* Top-3 podium cards */}
      {players.length >= 2 && (
        <div className={`grid gap-3 mb-1 ${players.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {players.slice(0, Math.min(3, players.length)).map((player, idx) => {
            const m = MEDAL_STYLES[idx];
            return (
              <div key={player.id} className={`rounded-xl p-3.5 text-center ${m.row}`}>
                <div className="text-xl mb-1 select-none">{MEDAL_GLYPHS[idx]}</div>
                <div className="font-medium text-xs truncate mb-1">{player.name}</div>
                <div className={`font-display font-bold text-xl ${m.score}`}>
                  {scoreStr(player.score)}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 font-mono">{player.rating}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      <ScrollArea className="h-[360px] pr-3">
        <div className="space-y-1.5">
          {players.map((player, idx) => {
            const pos = idx + 1;
            const isTop3 = pos <= 3;
            const m = isTop3 ? MEDAL_STYLES[idx] : null;
            const pct = maxScore > 0 ? Math.round((player.score / maxScore) * 100) : 0;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isTop3 ? m!.row : "hover:bg-secondary/40"
                }`}
              >
                {/* Position badge */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                  isTop3 ? m!.pos : "text-muted-foreground/50 border-transparent"
                }`}>
                  {isTop3 ? MEDAL_GLYPHS[idx] : pos}
                </div>

                {/* Name + info */}
                <div className="flex-1 min-w-0">
                  <div className={`font-medium text-sm truncate ${isTop3 ? m!.score : ""}`}>
                    {player.name}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="font-mono">{player.rating}</span>
                    <span className="text-muted-foreground/30">·</span>
                    <span>{player.colorHistory.length} partidas</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-14 hidden sm:block">
                  <div className="h-1 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isTop3 ? "bg-primary" : "bg-primary/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0 min-w-[2.5rem]">
                  <div className={`font-display font-bold text-base leading-none ${isTop3 ? m!.score : ""}`}>
                    {scoreStr(player.score)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
