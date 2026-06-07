"use client";

import { Tournament } from "@/lib/types";
import { useTournamentStore } from "@/lib/store";
import { AddPlayerDialog } from "./AddPlayerDialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

const AVATAR_PALETTE = [
  "from-violet-500/25 to-violet-600/15 border-violet-500/25 text-violet-300",
  "from-sky-500/25 to-sky-600/15 border-sky-500/25 text-sky-300",
  "from-emerald-500/25 to-emerald-600/15 border-emerald-500/25 text-emerald-300",
  "from-rose-500/25 to-rose-600/15 border-rose-500/25 text-rose-300",
  "from-amber-500/25 to-amber-600/15 border-amber-500/25 text-amber-300",
  "from-cyan-500/25 to-cyan-600/15 border-cyan-500/25 text-cyan-300",
  "from-fuchsia-500/25 to-fuchsia-600/15 border-fuchsia-500/25 text-fuchsia-300",
  "from-teal-500/25 to-teal-600/15 border-teal-500/25 text-teal-300",
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
          <h3 className="font-semibold text-sm">Jugadores inscritos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tournament.players.length} participante{tournament.players.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canEdit && <AddPlayerDialog tournamentId={tournament.id} />}
      </div>

      {tournament.players.length === 0 ? (
        <div className="text-center py-14 text-muted-foreground text-sm">
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
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/40 transition-colors group"
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full bg-gradient-to-br border flex items-center justify-center text-xs font-bold shrink-0 ${avatarCls}`}
                  >
                    {initials(player.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{player.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span className="font-mono">{player.rating}</span>
                      {tournament.status !== "setup" && (
                        <>
                          <span className="text-muted-foreground/30">·</span>
                          <span className="text-primary font-semibold">{player.score} pts</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Color history as piece glyphs */}
                  {tournament.status !== "setup" && player.colorHistory.length > 0 && (
                    <div className="flex gap-0.5 shrink-0">
                      {player.colorHistory.slice(-5).map((c, i) => (
                        <span
                          key={i}
                          title={c === "white" ? "Blancas" : "Negras"}
                          className={`text-sm leading-none select-none ${
                            c === "white" ? "text-amber-200/70" : "text-zinc-500/70"
                          }`}
                        >
                          {c === "white" ? "♔" : "♚"}
                        </span>
                      ))}
                    </div>
                  )}

                  {canEdit && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
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
