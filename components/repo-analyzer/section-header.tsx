import { SectionHeaderProps } from "./types";
import { HugeiconsIcon } from "@hugeicons/react";

export function SectionHeader({ title, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div className="p-1.5 rounded-md bg-primary/10">
          <HugeiconsIcon icon={icon} className="w-4 h-4 text-primary" />
        </div>
      )}
      <h2 className="text-xl tracking-wider font-medium instrument-serif text-foreground">
        {title}
      </h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}
