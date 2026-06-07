"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTournamentStore } from "@/lib/store";
import { useTournament } from "@/lib/hooks";
import { Tournament } from "@/lib/types";
import { PlayerList } from "@/components/PlayerList";
import { RoundManager } from "@/components/RoundManager";
import { StandingsTable } from "@/components/StandingsTable";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingMark, OCBadge } from "@/components/oc";
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Clock,
  MapPin,
  Copy,
  Trash2,
  Calendar,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const STATUS_MAP: Record<
  Tournament["status"],
  { label: string; tone: "neutral" | "live" | "brand" }
> = {
  setup: { label: "Configuración", tone: "neutral" },
  active: { label: "En curso", tone: "live" },
  finished: { label: "Finalizado", tone: "neutral" },
};

const SYSTEM_MAP = {
  swiss: "Sistema Suizo",
  roundrobin: "Round Robin",
  elimination: "Eliminación Directa",
};

export default function TournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tournament, loading } = useTournament(id);
  const deleteTournament = useTournamentStore(s => s.deleteTournament);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (loading && !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <LoadingMark />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <div className="text-center space-y-4">
          <LoadingMark className="opacity-30" />
          <p className="text-ink-500 text-sm">Torneo no encontrado</p>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const status = STATUS_MAP[tournament.status];
  const playerViewUrl = `${origin}/play/${tournament.shareCode}`;
  const displayUrl = `${origin}/tournaments/${tournament.id}/display`;

  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-paper/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-ink-500 hover:text-ink-900"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-ink-500 text-xs hidden sm:block">Torneos</span>
            <span className="text-ink-500 text-xs hidden sm:block">/</span>
            <span className="font-medium text-sm truncate text-ink-900">
              {tournament.name}
            </span>
            <OCBadge tone={status.tone} dot={status.tone === "live"} size="sm">
              {status.label}
            </OCBadge>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 hidden sm:flex text-xs text-ink-500 hover:text-ink-900"
              onClick={() => window.open(displayUrl, "_blank")}
            >
              <Monitor className="h-3.5 w-3.5" />
              Pantalla
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 hidden sm:flex text-xs"
              onClick={() => {
                navigator.clipboard.writeText(playerViewUrl);
                toast.success("URL copiada al portapapeles");
              }}
            >
              <Smartphone className="h-3.5 w-3.5" />
              Link jugadores
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 space-y-6">
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-ink-900">
            {tournament.name}
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            {SYSTEM_MAP[tournament.system]} · {tournament.totalRounds} rondas
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up stagger-2">
          {tournament.location && (
            <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-ink-500 text-xs mb-1.5">
                <MapPin className="h-3 w-3" />
                Lugar
              </div>
              <div className="font-semibold text-sm truncate text-ink-900">
                {tournament.location}
              </div>
            </div>
          )}
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-ink-500 text-xs mb-1.5">
              <Calendar className="h-3 w-3" />
              Fecha
            </div>
            <div className="font-semibold text-sm text-ink-900">
              {format(new Date(tournament.date), "d MMM yyyy", { locale: es })}
            </div>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-ink-500 text-xs mb-1.5">
              <Clock className="h-3 w-3" />
              Control de tiempo
            </div>
            <div className="font-mono font-bold text-sm text-brand-text">
              {tournament.timeControl}
            </div>
          </div>
          <div
            className="rounded-[var(--radius-lg)] border border-line bg-surface p-4 shadow-sm cursor-pointer hover:border-brand/40 group transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(tournament.shareCode);
              toast.success("Código copiado");
            }}
          >
            <div className="flex items-center justify-between text-ink-500 text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Código jugadores
              </div>
              <Copy className="h-3 w-3 group-hover:text-brand transition-colors" />
            </div>
            <div className="font-mono font-bold text-xl tracking-[0.18em] text-brand-text oc-code">
              {tournament.shareCode}
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:hidden animate-fade-up stagger-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 text-xs"
            onClick={() => window.open(displayUrl, "_blank")}
          >
            <Monitor className="h-3.5 w-3.5" />
            Pantalla
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(playerViewUrl);
              toast.success("URL copiada");
            }}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Link jugadores
          </Button>
        </div>

        <div className="animate-fade-up stagger-4">
          <Tabs defaultValue="rounds">
            <TabsList className="grid grid-cols-3 w-full sm:w-80">
              <TabsTrigger value="rounds">Rondas</TabsTrigger>
              <TabsTrigger value="players">
                Jugadores
                {tournament.players.length > 0 && (
                  <span className="ml-1.5 text-xs bg-surface-sunk rounded-full px-1.5 py-0 text-ink-500 leading-5">
                    {tournament.players.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="standings">Clasificación</TabsTrigger>
            </TabsList>

            <TabsContent value="rounds" className="mt-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6 shadow-sm">
                <RoundManager tournament={tournament} />
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6 shadow-sm">
                <PlayerList tournament={tournament} />
              </div>
            </TabsContent>

            <TabsContent value="standings" className="mt-4">
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 sm:p-6 shadow-sm">
                <StandingsTable tournament={tournament} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-destructive/20 bg-danger-bg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-up stagger-5">
          <div>
            <div className="text-sm font-semibold text-ink-900">
              Eliminar torneo
            </div>
            <div className="text-xs text-ink-500 mt-0.5">
              {tournament.status === "setup"
                ? "Esta acción no se puede deshacer."
                : "Se borrarán jugadores, rondas y resultados. Esta acción no se puede deshacer."}
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            className="gap-2 shrink-0 text-xs w-full sm:w-auto justify-center"
            onClick={async () => {
              if (tournament.status !== "setup") {
                const msg =
                  tournament.status === "active"
                    ? "Este torneo está en curso. ¿Eliminarlo de todos modos?"
                    : "¿Eliminar este torneo finalizado?";
                if (!window.confirm(msg)) return;
              }
              const ok = await deleteTournament(tournament.id);
              if (!ok) {
                toast.error("No se pudo eliminar el torneo");
                return;
              }
              router.push("/dashboard");
              toast.success("Torneo eliminado");
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        </div>
      </main>
    </div>
  );
}
