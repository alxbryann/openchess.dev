import { cn } from "@/lib/utils";
import { type HTMLAttributes, type ReactNode } from "react";

export function OCCard({
  children,
  interactive = false,
  padding = 20,
  header,
  footer,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  interactive?: boolean;
  padding?: number;
  header?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-sm transition-all duration-200 ease-out",
        interactive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-line-strong hover:shadow-md",
        className
      )}
      {...props}
    >
      {header && (
        <div
          className="flex items-center justify-between border-b border-line"
          style={{ padding: `14px ${padding}px` }}
        >
          {header}
        </div>
      )}
      <div style={{ padding }}>{children}</div>
      {footer && (
        <div
          className="border-t border-line bg-surface-sunk"
          style={{ padding: `12px ${padding}px` }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}
