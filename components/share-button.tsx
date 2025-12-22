"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/share-modal";
import { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  result: Partial<AnalysisResult>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showLabel?: boolean;
}

export function ShareButton({
  result,
  variant = "outline",
  size = "default",
  className,
  showLabel = true,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  if (!result.metadata) return null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setOpen(true)}
        className={cn("gap-2", className)}
      >
        <Share2 className="w-4 h-4" />
        {showLabel && <span>Share</span>}
      </Button>

      <ShareModal open={open} onOpenChange={setOpen} result={result} />
    </>
  );
}
