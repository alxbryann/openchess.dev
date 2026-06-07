"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { rowToTournament, useTournamentStore } from "@/lib/store";
import { rememberJoinedPlayer, rememberTournamentId } from "@/lib/local";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";

const supabase = createClient();

export default function JoinPage() {
  const router = useRouter();
  const upsertLocal = useTournamentStore(s => s.upsertLocal);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Ingresa el código del torneo");
      return;
    }
    if (!name.trim()) {
      toast.error("Ingresa tu nombre");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.rpc("join_tournament", {
      p_code: cleanCode,
      p_name: name.trim(),
      p_rating: rating ? parseInt(rating) : 1500,
    });
    setLoading(false);

    if (error || !data) {
      toast.error(
        error?.message?.includes("not found")
          ? "No se encontró un torneo con ese código"
          : "No se pudo unir al torneo"
      );
      return;
    }

    const { tournament: row, playerId } = data as {
      tournament: Parameters<typeof rowToTournament>[0];
      playerId: string;
    };
    const t = rowToTournament(row);
    upsertLocal(t);
    rememberTournamentId(t.id);
    rememberJoinedPlayer(t.shareCode, playerId);

    toast.success(`¡Te uniste a "${t.name}"!`);
    router.push(`/play/${t.shareCode}`);
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="absolute inset-0 chess-pattern opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />

      <header className="relative max-w-md w-full mx-auto px-6 pt-7">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
      </header>

      <main className="relative flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-md animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl border border-primary/30 bg-primary/10 flex items-center justify-center text-3xl mx-auto mb-4 select-none">
              ♟
            </div>
            <h1 className="font-display text-3xl font-bold">Unirse a torneo</h1>
            <p className="text-muted-foreground text-sm mt-2">
              Pide el código a tu organizador e inscríbete.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-6 space-y-5"
          >
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs text-muted-foreground uppercase tracking-wider">
                Código del torneo <span className="text-primary">*</span>
              </Label>
              <Input
                id="code"
                placeholder="ABC123"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-12 font-mono text-center text-xl tracking-[0.3em] uppercase"
                maxLength={8}
                autoFocus
                autoCapitalize="characters"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs text-muted-foreground uppercase tracking-wider">
                Tu nombre <span className="text-primary">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={name}
                onChange={e => setName(e.target.value)}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-11"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="rating" className="text-xs text-muted-foreground uppercase tracking-wider">
                Tu elo
                <span className="text-muted-foreground/50 ml-1 normal-case tracking-normal">(opcional)</span>
              </Label>
              <Input
                id="rating"
                type="number"
                placeholder="1500"
                min={100}
                max={3500}
                value={rating}
                onChange={e => setRating(e.target.value)}
                className="bg-secondary/40 border-border/60 focus:border-primary/50 h-11 font-mono"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 gap-2 text-sm">
              <LogIn className="h-4 w-4" />
              {loading ? "Uniéndote..." : "Unirme al torneo"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
