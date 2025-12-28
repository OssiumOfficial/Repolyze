import { HugeiconsIcon } from "@hugeicons/react";
import { Folder01Icon } from "@hugeicons/core-free-icons";
import { FolderCardProps } from "./types";

export function FolderCard({ name, description }: FolderCardProps) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div className="p-1.5 rounded bg-orange-500/10 shrink-0">
        <HugeiconsIcon
          icon={Folder01Icon}
          className="w-3 h-3 text-orange-500"
        />
      </div>
      <div className="min-w-0">
        <code className="text-xs font-medium text-foreground">{name}</code>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}