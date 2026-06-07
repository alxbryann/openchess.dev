import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[46px] w-full min-w-0 rounded-[var(--radius-md)] border-[1.5px] border-line-strong bg-surface px-3.5 py-1 text-[15px] text-ink-900 transition-all duration-200 ease-out outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink-900 placeholder:text-ink-400 focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_var(--focus-ring)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-sunk disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-[15px]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
