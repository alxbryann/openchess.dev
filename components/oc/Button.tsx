"use client";

import { cn } from "@/lib/utils";
import { type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-[18px] text-[15px] gap-2",
  lg: "h-[54px] px-[26px] text-[17px] gap-2.5",
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand text-white border-transparent shadow-brand hover:bg-brand-hover active:translate-y-px",
  secondary:
    "bg-surface text-ink-900 border-line-strong shadow-xs hover:bg-surface-sunk hover:border-ink-400 active:translate-y-px",
  ghost:
    "bg-transparent text-ink-700 border-transparent hover:bg-surface-sunk hover:text-ink-900 active:translate-y-px",
  danger:
    "bg-destructive text-white border-transparent hover:bg-[#a93a25] active:translate-y-px",
};

export function OCButton({
  children,
  variant = "primary",
  size = "md",
  iconLeft,
  iconRight,
  fullWidth,
  className,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-md)] border font-semibold tracking-[-0.005em] whitespace-nowrap transition-all duration-200 ease-out outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--green-500)_35%,transparent)] disabled:pointer-events-none disabled:opacity-45",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {iconLeft && <span className="inline-flex shrink-0">{iconLeft}</span>}
      {children}
      {iconRight && <span className="inline-flex shrink-0">{iconRight}</span>}
    </button>
  );
}
