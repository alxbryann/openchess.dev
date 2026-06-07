"use client";

import { createClient } from "@/lib/supabase/client";
import { rowToTournament } from "@/lib/store";
import type { Database } from "@/lib/database.types";
import type { Tournament } from "@/lib/types";

type Row = Database["public"]["Tables"]["tournaments"]["Row"];

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

export function parseJoinResult(data: unknown): { row: Row; playerId: string } | null {
  const root = asRecord(data);
  if (!root) return null;

  const playerId = root.playerId ?? root.player_id;
  const row = root.tournament;
  if (typeof playerId !== "string" || !playerId || !asRecord(row)) return null;

  return { row: row as Row, playerId };
}

export type JoinErrorCode =
  | "invalid_code"
  | "empty_name"
  | "not_found"
  | "invalid_response"
  | "network";

export type JoinResult =
  | { ok: true; tournament: Tournament; playerId: string }
  | { ok: false; error: JoinErrorCode; detail?: string };

export function joinErrorMessage(
  error: JoinErrorCode,
  code?: string,
  detail?: string
): { title: string; message: string } {
  switch (error) {
    case "invalid_code":
      return {
        title: "Código incompleto",
        message: `El código debe tener 6 caracteres${code ? ` (recibido: "${code}")` : ""}.`,
      };
    case "empty_name":
      return {
        title: "Falta tu nombre",
        message: "Escribe tu nombre para inscribirte en el torneo.",
      };
    case "not_found":
      return {
        title: "Torneo no encontrado",
        message: `No existe un torneo con el código ${code ?? "ingresado"}. Pídele el código correcto al organizador.`,
      };
    case "invalid_response":
      return {
        title: "Respuesta inesperada",
        message:
          "El servidor respondió pero no pudimos confirmar tu inscripción. Intenta de nuevo.",
      };
    case "network":
      return {
        title: "Error de conexión",
        message:
          detail ??
          "No se pudo contactar al servidor. Revisa tu internet e intenta otra vez.",
      };
  }
}

export async function joinTournamentByCode(
  code: string,
  name: string,
  rating?: number
): Promise<JoinResult> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode || cleanCode.length !== 6) {
    return { ok: false, error: "invalid_code" };
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return { ok: false, error: "empty_name" };
  }

  const supabase = createClient();
  const { data, error } = await supabase.rpc("join_tournament", {
    p_code: cleanCode,
    p_name: trimmedName,
    p_rating: rating ?? 1500,
  });

  if (error) {
    return {
      ok: false,
      error: error.message?.includes("not found") ? "not_found" : "network",
      detail: error.message,
    };
  }

  const parsed = parseJoinResult(data);
  if (!parsed) {
    return {
      ok: false,
      error: "invalid_response",
      detail:
        typeof data === "string"
          ? data.slice(0, 200)
          : JSON.stringify(data)?.slice(0, 200),
    };
  }

  return {
    ok: true,
    tournament: rowToTournament(parsed.row),
    playerId: parsed.playerId,
  };
}
