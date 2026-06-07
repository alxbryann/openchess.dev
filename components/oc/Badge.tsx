import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

type Tone =
  | "neutral"
  | "brand"
  | "live"
  | "gold"
  | "silver"
  | "bronze"
  | "danger"
  | "info";

const toneClasses: Record<Tone, { wrap: string; dot: string }> = {
  neutral: {
    wrap: "bg-surface-sunk text-ink-700",
    dot: "bg-ink-400",
  },
  brand: {
    wrap: "bg-[var(--green-50)] text-[var(--green-700)]",
    dot: "bg-brand",
  },
  live: {
    wrap: "bg-[var(--green-50)] text-[var(--green-700)]",
    dot: "bg-brand animate-[badge-live-pulse_1.6s_ease-in-out_infinite]",
  },
  gold: {
    wrap: "bg-[color-mix(in_srgb,var(--gold)_15%,white)] text-[#7c5e1e]",
    dot: "bg-gold",
  },
  silver: {
    wrap: "bg-surface-sunk text-[#5b6068]",
    dot: "bg-silver",
  },
  bronze: {
    wrap: "bg-[color-mix(in_srgb,var(--bronze)_14%,white)] text-[#7a4f2b]",
    dot: "bg-bronze",
  },
  danger: {
    wrap: "bg-danger-bg text-destructive",
    dot: "bg-destructive",
  },
  info: {
    wrap: "bg-[color-mix(in_srgb,var(--info)_12%,white)] text-[var(--info)]",
    dot: "bg-[var(--info)]",
  },
};

export function OCBadge({
  children,
  tone = "neutral",
  dot = false,
  mono = false,
  size = "md",
  className,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  mono?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const t = toneClasses[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold leading-snug whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        mono ? "font-mono uppercase tracking-[0.08em]" : "tracking-[0.01em]",
        t.wrap,
        className
      )}
    >
      {dot && <span className={cn("size-1.5 shrink-0 rounded-full", t.dot)} />}
      {children}
    </span>
  );
}
