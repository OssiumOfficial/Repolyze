import { HugeiconsIcon } from "@hugeicons/react";
import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { EmptyStateProps } from "./types";

export function EmptyState({
  message = "No files found",
  description = "Try a different search term",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
        <HugeiconsIcon
          icon={FolderOpenIcon}
          className="w-6 h-6 text-muted-foreground/40"
        />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">{description}</p>
    </div>
  );
}
