import { KnightMark } from "./KnightMark";
import { cn } from "@/lib/utils";

export function LoadingMark({ className }: { className?: string }) {
  return (
    <KnightMark
      size={40}
      className={cn("animate-pulse opacity-40", className)}
    />
  );
}
