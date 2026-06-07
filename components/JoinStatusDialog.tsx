"use client";

import { LoadingMark } from "@/components/oc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JoinErrorCode, JoinResult } from "@/lib/join";
import { joinErrorMessage } from "@/lib/join";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type JoinStatus =
  | { open: false }
  | {
      open: true;
      mode: "loading";
      step: string;
      code?: string;
    }
  | {
      open: true;
      mode: "success";
      title: string;
      message: string;
      tournamentName?: string;
    }
  | {
      open: true;
      mode: "error";
      error: JoinErrorCode;
      code?: string;
      detail?: string;
    }
  | {
      open: true;
      mode: "pending";
      title: string;
      message: string;
      code: string;
      playerId?: string;
    };

type JoinStatusDialogProps = {
  status: JoinStatus;
  onClose: () => void;
  onRetry?: () => void;
};

export function JoinStatusDialog({ status, onClose, onRetry }: JoinStatusDialogProps) {
  if (!status.open) return null;

  const isLoading = status.mode === "loading";
  const canClose = !isLoading;

  return (
    <Dialog
      open
      disablePointerDismissal
      onOpenChange={open => {
        if (!open && canClose) onClose();
      }}
    >
      <DialogContent className="sm:max-w-sm" showCloseButton={canClose}>
        {status.mode === "loading" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-brand" />
                Uniéndote al torneo
              </DialogTitle>
              <DialogDescription>{status.step}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3 py-4">
              <LoadingMark className="opacity-60" />
              {status.code && (
                <p className="text-xs font-mono text-ink-400">
                  Código: <span className="text-brand-text">{status.code}</span>
                </p>
              )}
            </div>
          </>
        )}

        {status.mode === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[var(--green-600)]">
                <CheckCircle2 className="h-5 w-5" />
                {status.title}
              </DialogTitle>
              <DialogDescription>{status.message}</DialogDescription>
            </DialogHeader>
            {status.tournamentName && (
              <div className="rounded-[var(--radius-lg)] border border-line bg-surface-sunk px-4 py-3 text-sm text-ink-900">
                {status.tournamentName}
              </div>
            )}
          </>
        )}

        {status.mode === "error" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                {joinErrorMessage(status.error, status.code, status.detail).title}
              </DialogTitle>
              <DialogDescription>
                {joinErrorMessage(status.error, status.code, status.detail).message}
              </DialogDescription>
            </DialogHeader>
            {status.detail && (
              <div className="rounded-[var(--radius-md)] border border-line bg-surface-sunk px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-ink-400 mb-1">
                  Detalle técnico
                </p>
                <p className="text-xs font-mono text-ink-600 break-all">{status.detail}</p>
              </div>
            )}
            {status.code && (
              <p className="text-xs text-ink-500">
                Código usado:{" "}
                <span className="font-mono font-semibold text-ink-900">{status.code}</span>
              </p>
            )}
            <DialogFooter>
              {onRetry && (
                <Button onClick={onRetry} className="w-full sm:w-auto">
                  Intentar de nuevo
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Cerrar
              </Button>
            </DialogFooter>
          </>
        )}

        {status.mode === "pending" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-[var(--warning)]">
                <AlertCircle className="h-5 w-5" />
                {status.title}
              </DialogTitle>
              <DialogDescription>{status.message}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-xs text-ink-500">
              <p>
                Código:{" "}
                <span className="font-mono font-semibold text-ink-900">{status.code}</span>
              </p>
              {status.playerId && (
                <p className="font-mono break-all">
                  ID jugador: <span className="text-ink-700">{status.playerId}</span>
                </p>
              )}
            </div>
            <DialogFooter>
              {onRetry && (
                <Button onClick={onRetry} className="w-full sm:w-auto">
                  Reintentar inscripción
                </Button>
              )}
              <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                Entendido
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function joinLoadingSteps() {
  return [
    "Validando código y nombre…",
    "Conectando con el servidor…",
    "Registrando tu inscripción…",
    "Preparando tu entrada al torneo…",
  ] as const;
}

export async function runWithJoinSteps(
  onStep: (step: string) => void,
  fn: () => Promise<JoinResult>
): Promise<JoinResult> {
  const steps = joinLoadingSteps();
  onStep(steps[0]);
  await pause(250);
  onStep(steps[1]);
  const result = await fn();
  onStep(steps[2]);
  await pause(150);
  onStep(steps[3]);
  await pause(100);
  return result;
}

function pause(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
