"use client";

import Link from "next/link";
import { CreateTournamentDialog } from "@/components/CreateTournamentDialog";
import { AuthButton } from "@/components/AuthButton";
import { LayoutGrid, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Chess backdrop */}
      <div className="absolute inset-0 chess-pattern opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />

      <div className="relative">
        {/* Top bar */}
        <header className="max-w-5xl mx-auto px-6 pt-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg border border-primary/30 bg-primary/10 flex items-center justify-center text-lg leading-none">
              ♔
            </div>
            <span className="text-xs font-medium text-muted-foreground tracking-[0.18em] uppercase">
              Chess Tournaments
            </span>
          </div>
          <AuthButton />
        </header>

        {/* Hero */}
        <main className="max-w-5xl mx-auto px-6 pt-16 pb-20">
          <div className="text-center max-w-2xl mx-auto mb-12 animate-fade-up">
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-gold leading-[1.05]">
              Torneos de ajedrez,
              <br />
              sin complicaciones
            </h1>
            <p className="text-muted-foreground mt-5 text-base sm:text-lg leading-relaxed">
              Crea un torneo y comparte un código, o únete a uno con el código de
              tu organizador. Emparejamientos, resultados y clasificación en vivo.
            </p>
          </div>

          {/* Two big choices */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto animate-fade-up stagger-2">
            {/* Create */}
            <div className="group relative rounded-2xl border border-border bg-card p-7 flex flex-col gap-5 transition-all hover:border-primary/40 hover:-translate-y-0.5">
              <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center text-2xl select-none">
                ♔
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold mb-1.5">Crear torneo</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Configura el sistema, las rondas y obtén un código para que tus
                  jugadores se unan.
                </p>
              </div>
              <CreateTournamentDialog
                triggerLabel="Crear torneo"
                triggerClassName="w-full h-11 text-sm justify-center"
              />
            </div>

            {/* Join */}
            <Link
              href="/join"
              className="group relative rounded-2xl border border-border bg-card p-7 flex flex-col gap-5 transition-all hover:border-primary/40 hover:-translate-y-0.5"
            >
              <div className="h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
              <div className="w-12 h-12 rounded-xl border border-border bg-secondary/40 flex items-center justify-center text-2xl select-none">
                ♟
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold mb-1.5">
                  Unirse a torneo
                </h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Ingresa el código del torneo, tu nombre y tu elo. Quedas inscrito
                  al instante.
                </p>
              </div>
              <span className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-md border border-border text-sm font-medium group-hover:border-primary/40 group-hover:text-primary transition-colors">
                <LogIn className="h-4 w-4" />
                Unirse con código
              </span>
            </Link>
          </div>

          {/* Dashboard link */}
          <div className="text-center mt-10 animate-fade-up stagger-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
              Ver mis torneos
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
