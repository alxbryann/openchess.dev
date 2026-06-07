"use client";

import { cn } from "@/lib/utils";
import {
  OTPInput,
  REGEXP_ONLY_DIGITS_AND_CHARS,
  type SlotProps,
} from "input-otp";

type Size = "sm" | "md" | "lg";
type Status = "default" | "error" | "success";

const sizeMap: Record<Size, { box: number; font: number }> = {
  sm: { box: 40, font: 20 },
  md: { box: 54, font: 27 },
  lg: { box: 66, font: 34 },
};

function cleanCode(raw: string, length: number) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, length);
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  onComplete,
  size = "md",
  status = "default",
  autoFocus = false,
  groupAfter = 3,
  className,
}: {
  length?: number;
  value?: string;
  onChange?: (code: string) => void;
  onComplete?: (code: string) => void;
  size?: Size;
  status?: Status;
  autoFocus?: boolean;
  groupAfter?: number;
  className?: string;
}) {
  const s = sizeMap[size];
  const boxHeight = Math.round(s.box * 1.18);
  const showDivider = groupAfter > 0 && groupAfter < length;
  const code = cleanCode(value ?? "", length);

  function handleChange(raw: string) {
    const next = cleanCode(raw, length);
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  }

  function borderColor(filled: boolean, isActive: boolean) {
    if (status === "error") return "var(--danger)";
    if (status === "success") return "var(--green-500)";
    if (isActive) return "var(--green-500)";
    if (filled) return "var(--ink-400)";
    return "var(--line-strong)";
  }

  function Slot(slot: SlotProps) {
    const filled = slot.char != null;
    return (
      <div
        className="relative text-center font-mono font-bold transition-all duration-150 ease-out min-w-0 flex-1"
        style={{
          maxWidth: s.box,
          height: boxHeight,
          fontSize: `min(${s.font}px, 7vw)`,
          color: status === "error" ? "var(--danger)" : "var(--ink-900)",
          background: filled ? "var(--surface)" : "var(--surface-sunk)",
          border: `1.5px solid ${borderColor(filled, slot.isActive)}`,
          borderRadius: "var(--radius-md)",
          boxShadow: slot.isActive ? "0 0 0 3px var(--focus-ring)" : "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {slot.char ?? slot.placeholderChar ?? ""}
        {slot.hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="animate-caret-blink"
              style={{
                width: 2,
                height: Math.round(boxHeight * 0.5),
                borderRadius: 2,
                background:
                  status === "error" ? "var(--danger)" : "var(--ink-900)",
              }}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Mobile: a plain, reliable text input (same behavior as the name field) */}
      <input
        type="text"
        inputMode="text"
        enterKeyHint="next"
        autoCapitalize="characters"
        autoCorrect="off"
        autoComplete="one-time-code"
        spellCheck={false}
        value={code}
        autoFocus={autoFocus}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="ABC123"
        aria-label="Código del torneo"
        className={cn(
          "block w-full rounded-[var(--radius-md)] border-[1.5px] bg-surface text-center font-mono font-bold uppercase text-ink-900 outline-none transition-all duration-200 ease-out placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-400 focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] sm:hidden",
          status === "error" ? "border-destructive" : "border-line-strong focus-visible:border-brand"
        )}
        style={{
          height: boxHeight,
          fontSize: "1.5rem",
          letterSpacing: "0.4em",
          textIndent: "0.4em",
        }}
      />

      {/* Desktop: the OTP boxes */}
      <OTPInput
        maxLength={length}
        value={value}
        inputMode="text"
        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
        autoComplete="one-time-code"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        pasteTransformer={(pasted) => cleanCode(pasted, length)}
        onChange={(v) => handleChange(v)}
        containerClassName="hidden w-full items-center justify-center gap-1.5 sm:flex sm:gap-2"
        className="focus-visible:ring-0"
        aria-label="Código del torneo"
        render={({ slots }) => (
          <>
            {slots.map((slot, i) => (
              <span key={i} className="contents">
                {showDivider && i === groupAfter && (
                  <span className="mx-0.5 h-0.5 w-2.5 rounded-sm bg-ink-300" />
                )}
                <Slot {...slot} />
              </span>
            ))}
          </>
        )}
      />
    </div>
  );
}
