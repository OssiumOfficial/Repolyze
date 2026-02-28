"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PromoBanner() {
  const [dismissed, setDismissed] = useState(false);

  const enabled = process.env.NEXT_PUBLIC_PROMO_ENABLED === "true";
  const message = process.env.NEXT_PUBLIC_PROMO_MESSAGE;
  const link = process.env.NEXT_PUBLIC_PROMO_LINK;

  if (!enabled || !message || dismissed) return null;

  return (
    <div
      className={cn(
        "relative z-50 w-full",
        "bg-linear-to-r from-primary/90 via-primary to-primary/90 opacity-60",
        "text-primary-foreground"
      )}
    >
      <div className="mx-auto flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm">
        <span className="truncate font-medium">
          {link ? (
            <Link
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:underline"
            >
              {message}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </Link>
          ) : (
            message
          )}
        </span>

        <button
          onClick={() => setDismissed(true)}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-primary-foreground/20"
          aria-label="Dismiss banner"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
