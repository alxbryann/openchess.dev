"use client";

import Link from "next/link";
import { useMyTournaments } from "@/lib/hooks";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { TournamentCard } from "@/components/TournamentCard";
import { AuthButton } from "@/components/AuthButton";

export default function DashboardPage() {
  const { tournaments, loading } = useMyTournaments();
  const active = tournaments.filter(t => t.status === "active").length;
  const finished = tournaments.filter(t => t.status === "finished").length;

  return (
    <div className="min-h-screen">
      {/* ── Hero Header ── */}
      <header className="relative border-b border-border overflow-hidden">
        <div className="absolute inset-0 chess-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/75 to-background" />

        <div className="relative max-w-5xl mx-auto px-6 pt-10 pb-8">
          {/* Top nav */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center text-lg leading-none">
                ♔
              </div>
              <span className="text-xs font-medium text-muted-foreground tracking-[0.18em] uppercase group-hover:text-foreground transition-colors">
                Chess Tournaments
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <AuthButton />
              <CreateTournamentDialog />
            </div>
          </div>

          {/* Title */}
          <div className="animate-fade-up space-y-1.5">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-gold leading-tight">
              Mis Torneos
            </h1>
            <p className="text-muted-foreground text-sm">
              Emparejamientos, resultados y clasificaciones en un solo lugar
            </p>
          </div>

          {/* Stats */}
          {tournaments.length > 0 && (
            <div className="flex items-center gap-6 mt-6 animate-fade-up stagger-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold">{tournaments.length}</span>
                <span className="text-muted-foreground text-sm">total</span>
              </div>
              {active > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-display text-2xl font-bold text-green-400">{active}</span>
                  <span className="text-muted-foreground text-sm">en curso</span>
                </div>
              )}
              {finished > 0 && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold text-muted-foreground">{finished}</span>
                  <span className="text-muted-foreground text-sm">finalizados</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading && tournaments.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-xl border border-border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-8 animate-fade-up">
            <div className="relative">
              <div className="grid grid-cols-8 grid-rows-8 w-32 h-32 rounded-2xl overflow-hidden border border-border opacity-25">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={
                      (Math.floor(i / 8) + (i % 8)) % 2 === 0
                        ? "bg-primary/50"
                        : "bg-secondary"
                    }
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-50 select-none">
                ♔
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold">Sin torneos todavía</h2>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Crea tu primer torneo para comenzar a gestionar emparejamientos, resultados y clasificaciones.
              </p>
            </div>
            <CreateTournamentDialog />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...tournaments].reverse().map((t, i) => (
              <div
                key={t.id}
                className={`animate-fade-up stagger-${Math.min(i + 1, 6)}`}
              >
                <TournamentCard tournament={t} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
