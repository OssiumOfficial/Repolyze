import { TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { TabTriggerItemProps } from "./types";
import { HugeiconsIcon } from "@hugeicons/react";

export function TabTriggerItem({
  value,
  icon,
  label,
  count,
}: TabTriggerItemProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md",
        "text-sm font-medium",
        "data-[state=active]:bg-background",
        "data-[state=active]:text-foreground",
        "data-[state=active]:shadow-sm",
        "text-muted-foreground",
        "transition-all duration-200"
      )}
    >
      <HugeiconsIcon icon={icon} className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.slice(0, 3)}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 text-xs rounded-full",
            "bg-primary/10 text-primary"
          )}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}
