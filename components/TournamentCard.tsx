"use client";

import { Tournament } from "@/lib/types";
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { OCBadge } from "@/components/oc";

const STATUS_STYLES: Record<
  Tournament["status"],
  { label: string; tone: "neutral" | "live" | "brand" }
> = {
  setup: { label: "Configuración", tone: "neutral" },
  active: { label: "En curso", tone: "live" },
  finished: { label: "Finalizado", tone: "neutral" },
};

const SYSTEM_LABELS: Record<Tournament["system"], string> = {
  swiss: "Suizo",
  roundrobin: "Round Robin",
  elimination: "Eliminación",
};

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  const router = useRouter();
  const status = STATUS_STYLES[tournament.status];
  const played = tournament.rounds.filter(r => r.status !== "pending").length;

  return (
    <div
      className="group relative cursor-pointer rounded-[var(--radius-lg)] border border-line bg-surface overflow-hidden shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md"
      onClick={() => router.push(`/tournaments/${tournament.id}`)}
    >
      <div className="h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent group-hover:via-brand/70 transition-all duration-200" />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-[1.05rem] leading-snug text-ink-900 group-hover:text-brand-text transition-colors line-clamp-2 mb-2">
              {tournament.name}
            </h3>
            <OCBadge tone={status.tone} dot={status.tone === "live"} size="sm">
              {status.label}
            </OCBadge>
          </div>
          <OCBadge tone="brand" mono size="sm">
            {SYSTEM_LABELS[tournament.system]}
          </OCBadge>
        </div>

        <div className="space-y-1.5 text-sm text-ink-500 mb-4">
          {tournament.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 opacity-50" />
              <span className="truncate">{tournament.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0 opacity-50" />
            <span>
              {format(new Date(tournament.date), "d MMM yyyy", { locale: es })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-line">
          <div className="flex items-center gap-1.5 text-sm flex-1 min-w-0">
            <Users className="h-3.5 w-3.5 text-ink-400 shrink-0" />
            <span className="font-semibold text-ink-900">
              {tournament.players.length}
            </span>
            <span className="text-ink-500">jugadores</span>
          </div>

          <div className="font-mono text-xs text-ink-500 bg-surface-sunk px-2 py-1 rounded-[var(--radius-sm)]">
            R{played}
            <span className="opacity-40">/{tournament.totalRounds}</span>
          </div>

          <ArrowRight className="h-4 w-4 text-ink-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0" />
        </div>
      </div>
    </div>
  );
}
