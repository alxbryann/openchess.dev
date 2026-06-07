"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type ReactNode, useId } from "react";

type Size = "sm" | "md" | "lg";

const sizeClasses: Record<Size, string> = {
  sm: "h-[38px] text-sm",
  md: "h-[46px] text-[15px]",
  lg: "h-[54px] text-base",
};

export function OCInput({
  label,
  hint,
  error,
  iconLeft,
  inputSize = "md",
  className,
  id,
  required,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  inputSize?: Size;
}) {
  const autoId = useId();
  const inputId = id || autoId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[13px] font-semibold text-ink-900"
        >
          {label}
          {required && <span className="text-brand ml-0.5">*</span>}
        </label>
      )}
      <div
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] bg-surface px-3.5 transition-all duration-200 ease-out",
          "focus-within:border-brand focus-within:shadow-[0_0_0_3px_var(--focus-ring)]",
          error ? "border-destructive" : "border-line-strong",
          props.disabled && "bg-surface-sunk opacity-60",
          sizeClasses[inputSize]
        )}
      >
        {iconLeft && (
          <span className="inline-flex shrink-0 text-ink-400">{iconLeft}</span>
        )}
        <input
          id={inputId}
          className={cn(
            "min-w-0 flex-1 border-none bg-transparent font-[family-name:var(--font-body)] text-ink-900 outline-none placeholder:text-ink-400",
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-ink-500">{hint}</p>
      )}
    </div>
  );
}
