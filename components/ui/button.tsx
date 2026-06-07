import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[var(--radius-md)] border bg-clip-padding font-semibold tracking-[-0.005em] whitespace-nowrap transition-all duration-200 ease-out outline-none select-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--green-500)_35%,transparent)] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand text-white shadow-brand hover:bg-brand-hover [a]:hover:bg-brand-hover",
        outline:
          "border-line-strong bg-surface text-ink-900 shadow-xs hover:border-ink-400 hover:bg-surface-sunk",
        secondary:
          "border-line-strong bg-surface-sunk text-ink-700 hover:bg-surface hover:border-ink-400",
        ghost:
          "border-transparent bg-transparent text-ink-700 hover:bg-surface-sunk hover:text-ink-900",
        destructive:
          "border-transparent bg-destructive text-white hover:bg-[#a93a25]",
        link: "border-transparent text-brand-text underline-offset-4 hover:underline hover:text-brand-active",
      },
      size: {
        default: "h-11 gap-2 px-[18px] text-[15px]",
        xs: "h-7 gap-1 rounded-[var(--radius-sm)] px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 gap-1.5 px-3.5 text-sm",
        lg: "h-[54px] gap-2.5 px-[26px] text-[17px]",
        icon: "size-11",
        "icon-xs": "size-7 rounded-[var(--radius-sm)] [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-9",
        "icon-lg": "size-[54px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
