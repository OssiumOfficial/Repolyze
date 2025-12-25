import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TechBadgeProps } from "./types";
import { getTechIcon } from "./utils";

export function TechBadge({ name, isPrimary = false }: TechBadgeProps) {
  const icon = getTechIcon(name);

  return (
    <Badge
      variant={isPrimary ? "default" : "secondary"}
      className={cn(
        "gap-1.5 text-xs py-1 px-2.5 transition-all cursor-default",
        isPrimary
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          : "hover:bg-muted/60"
      )}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {name}
    </Badge>
  );
}