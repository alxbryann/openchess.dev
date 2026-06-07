"use client";

import { Tournament } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OCBadge } from "@/components/oc";

const MEDAL_TONES = ["gold", "silver", "bronze"] as const;
const MEDAL_STYLES = [
  {
    row: "border border-[color-mix(in_srgb,var(--gold)_20%,transparent)]",
    score: "text-gold",
    bg: "color-mix(in srgb, var(--gold) 6%, transparent)",
  },
  {
    row: "border border-[color-mix(in_srgb,var(--silver)_20%,transparent)]",
    score: "text-[var(--silver)]",
    bg: "color-mix(in srgb, var(--silver) 5%, transparent)",
  },
  {
    row: "border border-[color-mix(in_srgb,var(--bronze)_20%,transparent)]",
    score: "text-[var(--bronze)]",
    bg: "color-mix(in srgb, var(--bronze) 5%, transparent)",
  },
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
      <div className="text-center py-14 text-ink-500 text-sm">
        Las clasificaciones aparecerán una vez que comience el torneo.
      </div>
    );
  }

  const maxScore = players[0]?.score || 1;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-semibold text-sm text-ink-900">
          Clasificación General
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {players.length} jugadores ·{" "}
          {tournament.rounds.filter(r => r.status === "finished").length} rondas
          jugadas
        </p>
      </div>

      {players.length >= 2 && (
        <div
          className={`grid gap-3 mb-1 ${players.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}
        >
          {players.slice(0, Math.min(3, players.length)).map((player, idx) => {
            const m = MEDAL_STYLES[idx];
            return (
              <div
                key={player.id}
                className={`rounded-[var(--radius-lg)] p-3.5 text-center ${m.row}`}
                style={{ background: m.bg }}
              >
                <div className="mb-2 flex justify-center">
                  <OCBadge tone={MEDAL_TONES[idx]} size="sm">
                    {idx + 1}º
                  </OCBadge>
                </div>
                <div className="font-medium text-xs truncate mb-1 text-ink-900">
                  {player.name}
                </div>
                <div className={`font-display font-bold text-xl ${m.score}`}>
                  {scoreStr(player.score)}
                </div>
                <div className="text-xs text-ink-500 mt-0.5 font-mono">
                  {player.rating}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ScrollArea className="h-[360px] pr-3">
        <div className="space-y-1.5">
          {players.map((player, idx) => {
            const pos = idx + 1;
            const isTop3 = pos <= 3;
            const m = isTop3 ? MEDAL_STYLES[idx] : null;
            const pct =
              maxScore > 0 ? Math.round((player.score / maxScore) * 100) : 0;

            return (
              <div
                key={player.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] transition-colors ${
                  isTop3 ? m!.row : "hover:bg-surface-sunk"
                }`}
                style={isTop3 ? { background: m!.bg } : undefined}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isTop3
                      ? m!.score
                      : "text-ink-400 border border-transparent"
                  }`}
                >
                  {isTop3 ? (
                    <OCBadge tone={MEDAL_TONES[idx]} size="sm">
                      {pos}
                    </OCBadge>
                  ) : (
                    pos
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-medium text-sm truncate ${isTop3 ? m!.score : "text-ink-900"}`}
                  >
                    {player.name}
                  </div>
                  <div className="text-xs text-ink-500 flex items-center gap-1.5">
                    <span className="font-mono">{player.rating}</span>
                    <span className="text-ink-300">·</span>
                    <span>{player.colorHistory.length} partidas</span>
                  </div>
                </div>

                <div className="w-14 hidden sm:block">
                  <div className="h-1 rounded-full bg-surface-sunk overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isTop3 ? "bg-brand" : "bg-brand/40"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 min-w-[2.5rem]">
                  <div
                    className={`font-display font-bold text-base leading-none ${isTop3 ? m!.score : "text-ink-900"}`}
                  >
                    {scoreStr(player.score)}
                  </div>
                  <div className="text-xs text-ink-500 mt-0.5">pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
