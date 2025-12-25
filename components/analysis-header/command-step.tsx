"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandStepProps } from "./types";

export function CommandStep({ step, command }: CommandStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-center gap-2 p-2 rounded-md bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors">
      <span className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium bg-primary/10 text-primary shrink-0">
        {step}
      </span>
      <code className="flex-1 text-xs sm:text-sm jetbrains-mono truncate">
        {command}
      </code>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}