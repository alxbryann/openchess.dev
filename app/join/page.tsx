"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTournamentStore } from "@/lib/store";
import { joinTournamentByCode } from "@/lib/join";
import { rememberJoinedPlayer, rememberTournamentId } from "@/lib/local";
import {
  JoinStatusDialog,
  runWithJoinSteps,
  type JoinStatus,
} from "@/components/JoinStatusDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeInput, KnightMark } from "@/components/oc";
import { ArrowLeft, LogIn } from "lucide-react";

export default function JoinPage() {
  const router = useRouter();
  const upsertLocal = useTournamentStore(s => s.upsertLocal);
  const formRef = useRef<HTMLFormElement>(null);
  const navTimerRef = useRef<number | null>(null);
  const navigatingRef = useRef(false);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeStatus, setCodeStatus] = useState<"default" | "error">("default");
  const [status, setStatus] = useState<JoinStatus>({ open: false });

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("code");
    if (fromUrl) {
      setCode(fromUrl.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6));
    }
    return () => {
      if (navTimerRef.current) window.clearTimeout(navTimerRef.current);
    };
  }, []);

  function closeStatus() {
    setStatus({ open: false });
    // Keep loading=true if we're about to navigate so the button stays disabled
    if (!navigatingRef.current) setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanCode || cleanCode.length !== 6) {
      setCodeStatus("error");
      setStatus({
        open: true,
        mode: "error",
        error: "invalid_code",
        code: cleanCode || code,
      });
      return;
    }
    if (!name.trim()) {
      setStatus({
        open: true,
        mode: "error",
        error: "empty_name",
        code: cleanCode,
      });
      return;
    }

    setLoading(true);
    setStatus({
      open: true,
      mode: "loading",
      step: "Validando código y nombre…",
      code: cleanCode,
    });

    const result = await runWithJoinSteps(
      step =>
        setStatus({
          open: true,
          mode: "loading",
          step,
          code: cleanCode,
        }),
      () =>
        joinTournamentByCode(
          cleanCode,
          name,
          rating ? parseInt(rating, 10) : undefined
        )
    );

    if (!result.ok) {
      setCodeStatus("error");
      setLoading(false);
      setStatus({
        open: true,
        mode: "error",
        error: result.error,
        code: cleanCode,
        detail: result.detail,
      });
      return;
    }

    const { tournament: t, playerId } = result;
    upsertLocal(t);
    rememberTournamentId(t.id);
    rememberJoinedPlayer(t.shareCode, playerId);

    setStatus({
      open: true,
      mode: "success",
      title: "¡Inscripción exitosa!",
      message: "Entrando al torneo…",
      tournamentName: t.name,
    });

    navigatingRef.current = true;
    navTimerRef.current = window.setTimeout(() => {
      router.push(`/play/${t.shareCode}?p=${encodeURIComponent(playerId)}`);
    }, 900);
  }

  return (
    <>
      <JoinStatusDialog
        status={status}
        onClose={closeStatus}
        onRetry={() => {
          closeStatus();
          formRef.current?.requestSubmit();
        }}
      />

      <div className="min-h-screen relative overflow-hidden flex flex-col bg-paper">
        <div className="absolute inset-0 chess-pattern opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-paper/70 via-paper/90 to-paper" />

        <header className="relative max-w-md w-full mx-auto px-6 pt-7">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-ink-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </header>

        <main className="relative flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md animate-fade-up">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-[var(--radius-lg)] border border-brand/30 bg-brand-tint flex items-center justify-center mx-auto mb-4">
                <KnightMark size={28} />
              </div>
              <h1 className="font-display text-3xl font-bold text-ink-900">
                Unirse a torneo
              </h1>
              <p className="text-ink-500 text-sm mt-2">
                Pide el código a tu organizador e inscríbete.
              </p>
            </div>

            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="rounded-[var(--radius-xl)] border border-line bg-surface p-6 space-y-5 shadow-sm"
            >
              <div className="space-y-2">
                <Label>
                  Código del torneo <span className="text-brand">*</span>
                </Label>
                <CodeInput
                  length={6}
                  value={code}
                  onChange={v => {
                    setCode(v);
                    setCodeStatus("default");
                  }}
                  onComplete={() => document.getElementById("name")?.focus()}
                  status={codeStatus}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Tu nombre <span className="text-brand">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rating">
                  Tu elo
                  <span className="text-ink-400 ml-1 font-normal">(opcional)</span>
                </Label>
                <Input
                  id="rating"
                  type="number"
                  placeholder="1500"
                  min={100}
                  max={3500}
                  value={rating}
                  onChange={e => setRating(e.target.value)}
                  className="font-mono"
                />
              </div>

              <Button type="submit" disabled={loading} size="lg" className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                {loading ? "Uniéndote..." : "Unirme al torneo"}
              </Button>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}
