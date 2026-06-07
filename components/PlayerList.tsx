"use client";

import { Tournament } from "@/lib/types";
import { useTournamentStore } from "@/lib/store";
import { AddPlayerDialog } from "./AddPlayerDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const AVATAR_PALETTE = [
  "bg-brand-tint text-brand-text border-[color-mix(in_srgb,var(--brand)_25%,transparent)]",
  "bg-surface-sunk text-ink-700 border-line-strong",
  "bg-[color-mix(in_srgb,var(--info)_12%,white)] text-[var(--info)] border-[color-mix(in_srgb,var(--info)_25%,transparent)]",
  "bg-[color-mix(in_srgb,var(--gold)_12%,white)] text-[#7c5e1e] border-[color-mix(in_srgb,var(--gold)_25%,transparent)]",
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
}

export function PlayerList({ tournament }: { tournament: Tournament }) {
  const removePlayer = useTournamentStore(s => s.removePlayer);
  const canEdit = tournament.status === "setup";

  const sorted = [...tournament.players].sort(
    (a, b) => b.score - a.score || b.rating - a.rating
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-ink-900">Jugadores inscritos</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            {tournament.players.length} participante
            {tournament.players.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && <AddPlayerDialog tournamentId={tournament.id} />}
      </div>

      {tournament.players.length === 0 ? (
        <div className="text-center py-14 text-ink-500 text-sm">
          No hay jugadores inscritos todavía.
        </div>
      ) : (
        <ScrollArea className="h-[420px] pr-3">
          <div className="space-y-1.5">
            {sorted.map((player, idx) => {
              const avatarCls = AVATAR_PALETTE[idx % AVATAR_PALETTE.length];
              return (
                <div
                  key={player.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)] hover:bg-surface-sunk transition-colors group"
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0",
                      avatarCls
                    )}
                  >
                    {initials(player.name)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-ink-900">
                      {player.name}
                    </div>
                    <div className="text-xs text-ink-500 flex items-center gap-1.5">
                      <span className="font-mono">{player.rating}</span>
                      {tournament.status !== "setup" && (
                        <>
                          <span className="text-ink-300">·</span>
                          <span className="text-brand-text font-semibold">
                            {player.score} pts
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {tournament.status !== "setup" &&
                    player.colorHistory.length > 0 && (
                      <div className="flex gap-1 shrink-0">
                        {player.colorHistory.slice(-5).map((c, i) => (
                          <span
                            key={i}
                            title={c === "white" ? "Blancas" : "Negras"}
                            className={cn(
                              "text-[10px] font-mono font-bold w-5 h-5 rounded flex items-center justify-center border",
                              c === "white"
                                ? "bg-[#fef3c7] border-[#fcd34d] text-[#44403c]"
                                : "bg-ink-900 border-ink-700 text-ink-300"
                            )}
                          >
                            {c === "white" ? "W" : "B"}
                          </span>
                        ))}
                      </div>
                    )}

                  {canEdit && (
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-danger-bg transition-all"
                      onClick={() => {
                        removePlayer(tournament.id, player.id);
                        toast.success(`${player.name} eliminado`);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
