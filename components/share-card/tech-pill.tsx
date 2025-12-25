import { cn } from "@/lib/utils";
import { TechPillProps } from "./types";

export function TechPill({ tech, isPrimary = false }: TechPillProps) {
  return (
    <span
      className={cn(
        "px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[10px] jetbrains-mono font-medium uppercase tracking-wide border rounded",
        isPrimary
          ? "bg-primary/10 text-primary border-primary/20"
          : "bg-zinc-900/50 text-zinc-400 border-white/5"
      )}
    >
      {tech}
    </span>
  );
}