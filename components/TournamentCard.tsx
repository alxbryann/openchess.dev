"use client";

import { Tournament } from "@/lib/types";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_STYLES: Record<
  Tournament["status"],
  { label: string; className: string; dot?: boolean }
> = {
  setup: {
    label: "Configuración",
    className: "border-border/60 text-muted-foreground",
  },
  active: {
    label: "En curso",
    className: "border-green-500/40 text-green-400 bg-green-500/8",
    dot: true,
  },
  finished: {
    label: "Finalizado",
    className: "border-border/40 text-muted-foreground/70 bg-secondary/40",
  },
};

const SYSTEM_LABELS: Record<Tournament["system"], string> = {
  swiss: "Suizo",
  roundrobin: "Round Robin",
  elimination: "Eliminación",
};

const SYSTEM_GLYPH: Record<Tournament["system"], string> = {
  swiss: "♘",
  roundrobin: "♛",
  elimination: "♜",
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const router = useRouter();
  const status = STATUS_STYLES[tournament.status];
  const played = tournament.rounds.filter(r => r.status !== "pending").length;

  return (
    <div
      className="group relative cursor-pointer rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:border-primary/35 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_oklch(0.74_0.135_78/8%)]"
      onClick={() => router.push(`/tournaments/${tournament.id}`)}
    >
      {/* Gold top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent group-hover:via-primary/80 transition-all duration-300" />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-[1.05rem] leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {tournament.name}
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full border ${status.className}`}
            >
              {status.dot && (
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              )}
              {status.label}
            </span>
          </div>
          <span className="text-2xl text-primary/30 group-hover:text-primary/60 transition-colors shrink-0 select-none leading-none mt-0.5">
            {SYSTEM_GLYPH[tournament.system]}
          </span>
        </div>

        {/* Metadata */}
        <div className="space-y-1.5 text-sm text-muted-foreground mb-4">
          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="truncate">{tournament.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span>{format(new Date(tournament.date), "d MMM yyyy", { locale: es })}</span>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center gap-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            <Users className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            <span className="font-semibold">{tournament.players.length}</span>
            <span className="text-muted-foreground">jugadores</span>
          </div>

          <div className="font-mono text-xs text-muted-foreground bg-secondary/60 px-2 py-1 rounded-md">
            R{played}
            <span className="opacity-40">/{tournament.totalRounds}</span>
          </div>

          <span className="text-xs text-muted-foreground/60 hidden sm:block">
            {SYSTEM_LABELS[tournament.system]}
          </span>

          <ArrowRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
}
