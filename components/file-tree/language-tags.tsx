import { memo } from "react";
import { cn } from "@/lib/utils";
import { LanguageTagsProps } from "./types";

export const LanguageTags = memo(function LanguageTags({
  languages,
}: LanguageTagsProps) {
  if (languages.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {languages.map(([lang, count]) => (
        <span
          key={lang}
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md",
            "text-[10px] font-medium",
            "bg-muted/60 text-muted-foreground"
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", "bg-primary/60")} />
          {lang}
          <span className="text-muted-foreground/60">{count}</span>
        </span>
      ))}
    </div>
  );
});