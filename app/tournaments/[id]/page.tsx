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
  { label: string; cls: string; dot?: boolean }
> = {
  setup: { label: "Configuración", cls: "text-muted-foreground border-border/60" },
  active: { label: "En curso", cls: "text-green-400 border-green-500/40 bg-green-500/8", dot: true },
  finished: { label: "Finalizado", cls: "text-muted-foreground/70 border-border/40 bg-secondary/40" },
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl opacity-30 select-none animate-pulse">♔</div>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-5xl opacity-30 select-none">♟</div>
          <p className="text-muted-foreground text-sm">Torneo no encontrado</p>
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
    <div className="min-h-screen">
      {/* ── Sticky Header ── */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => router.push("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-muted-foreground text-xs hidden sm:block">Torneos</span>
            <span className="text-muted-foreground text-xs hidden sm:block">/</span>
            <span className="font-medium text-sm truncate">{tournament.name}</span>
            <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border shrink-0 ${status.cls}`}>
              {status.dot && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />}
              {status.label}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="gap-1.5 hidden sm:flex h-8 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => window.open(displayUrl, "_blank")}
            >
              <Monitor className="h-3.5 w-3.5" />
              Pantalla
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 hidden sm:flex h-8 text-xs"
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
        {/* ── Tournament title ── */}
        <div className="animate-fade-up">
          <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight">
            {tournament.name}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {SYSTEM_MAP[tournament.system]} · {tournament.totalRounds} rondas
          </p>
        </div>

        {/* ── Info strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up stagger-2">
          {tournament.location && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
                <MapPin className="h-3 w-3" />
                Lugar
              </div>
              <div className="font-semibold text-sm truncate">{tournament.location}</div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
              <Calendar className="h-3 w-3" />
              Fecha
            </div>
            <div className="font-semibold text-sm">
              {format(new Date(tournament.date), "d MMM yyyy", { locale: es })}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1.5">
              <Clock className="h-3 w-3" />
              Control de tiempo
            </div>
            <div className="font-mono font-bold text-sm text-primary">{tournament.timeControl}</div>
          </div>
          {/* Share code */}
          <div
            className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-primary/40 group transition-colors"
            onClick={() => {
              navigator.clipboard.writeText(tournament.shareCode);
              toast.success("Código copiado");
            }}
          >
            <div className="flex items-center justify-between text-muted-foreground text-xs mb-1.5">
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3" />
                Código jugadores
              </div>
              <Copy className="h-3 w-3 group-hover:text-primary transition-colors" />
            </div>
            <div className="font-mono font-bold text-xl tracking-[0.2em] text-primary">
              {tournament.shareCode}
            </div>
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="flex gap-2 sm:hidden animate-fade-up stagger-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 h-9 text-xs"
            onClick={() => window.open(displayUrl, "_blank")}
          >
            <Monitor className="h-3.5 w-3.5" />
            Pantalla
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-2 h-9 text-xs"
            onClick={() => {
              navigator.clipboard.writeText(playerViewUrl);
              toast.success("URL copiada");
            }}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Link jugadores
          </Button>
        </div>

        {/* ── Tabs ── */}
        <div className="animate-fade-up stagger-4">
          <Tabs defaultValue="rounds">
            <TabsList className="grid grid-cols-3 w-full sm:w-80 bg-card border border-border h-9">
              <TabsTrigger value="rounds" className="text-xs h-7">Rondas</TabsTrigger>
              <TabsTrigger value="players" className="text-xs h-7">
                Jugadores
                {tournament.players.length > 0 && (
                  <span className="ml-1.5 text-xs bg-secondary rounded-full px-1.5 py-0 text-muted-foreground leading-5">
                    {tournament.players.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="standings" className="text-xs h-7">Clasificación</TabsTrigger>
            </TabsList>

            <TabsContent value="rounds" className="mt-4">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <RoundManager tournament={tournament} />
              </div>
            </TabsContent>

            <TabsContent value="players" className="mt-4">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <PlayerList tournament={tournament} />
              </div>
            </TabsContent>

            <TabsContent value="standings" className="mt-4">
              <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
                <StandingsTable tournament={tournament} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Danger zone ── */}
        {tournament.status === "setup" && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex items-center justify-between gap-4 animate-fade-up stagger-5">
            <div>
              <div className="text-sm font-semibold">Eliminar torneo</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Esta acción no se puede deshacer.
              </div>
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2 shrink-0 h-8 text-xs"
              onClick={() => {
                deleteTournament(tournament.id);
                router.push("/dashboard");
                toast.success("Torneo eliminado");
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
