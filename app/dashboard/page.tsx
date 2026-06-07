"use client";

import Link from "next/link";
import { useMyTournaments } from "@/lib/hooks";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { TournamentCard } from "@/components/TournamentCard";
import { AuthButton } from "@/components/AuthButton";
import { KnightMark } from "@/components/oc";

export default function DashboardPage() {
  const { tournaments, loading } = useMyTournaments();
  const active = tournaments.filter(t => t.status === "active").length;
  const finished = tournaments.filter(t => t.status === "finished").length;

  return (
    <div className="min-h-screen bg-paper">
      <header className="relative border-b border-line overflow-hidden">
        <div className="absolute inset-0 chess-pattern" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/50 via-paper/75 to-paper" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-7 sm:pt-10 pb-6 sm:pb-8">
          <div className="flex items-center justify-between mb-6 sm:mb-8 gap-2">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-[var(--radius-md)] border border-brand/30 bg-brand-tint flex items-center justify-center">
                <KnightMark size={20} />
              </div>
              <span className="font-display text-base font-bold tracking-[-0.03em] text-ink-900 group-hover:text-brand-text transition-colors">
                openchess<span className="text-ink-400">.dev</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <AuthButton />
              <CreateTournamentDialog triggerClassName="oc-header-create" />
            </div>
          </div>

          <div className="animate-fade-up space-y-1.5">
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-ink-900">
              Mis Torneos
            </h1>
            <p className="text-ink-500 text-sm">
              Emparejamientos, resultados y clasificaciones en un solo lugar
            </p>
          </div>

          {tournaments.length > 0 && (
            <div className="flex items-center gap-6 mt-6 animate-fade-up stagger-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-2xl font-bold text-ink-900">
                  {tournaments.length}
                </span>
                <span className="text-ink-500 text-sm">total</span>
              </div>
              {active > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full animate-pulse bg-brand" />
                  <span className="font-display text-2xl font-bold text-[var(--green-600)]">
                    {active}
                  </span>
                  <span className="text-ink-500 text-sm">en curso</span>
                </div>
              )}
              {finished > 0 && (
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-bold text-ink-500">
                    {finished}
                  </span>
                  <span className="text-ink-500 text-sm">finalizados</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {loading && tournaments.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-44 rounded-[var(--radius-lg)] border border-line bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center gap-8 animate-fade-up">
            <div className="relative">
              <div className="grid grid-cols-8 grid-rows-8 w-32 h-32 rounded-[var(--radius-lg)] overflow-hidden border border-line opacity-40">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background:
                        (Math.floor(i / 8) + (i % 8)) % 2 === 0
                          ? "var(--board-dark)"
                          : "var(--board-light)",
                    }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <KnightMark size={48} className="opacity-50" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-semibold text-ink-900">
                Sin torneos todavía
              </h2>
              <p className="text-ink-500 text-sm max-w-xs leading-relaxed">
                Crea tu primer torneo para comenzar a gestionar emparejamientos,
                resultados y clasificaciones.
              </p>
            </div>
            <CreateTournamentDialog triggerSize="lg" />
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
