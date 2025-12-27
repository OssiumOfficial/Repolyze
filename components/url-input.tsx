"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { validateGitHubUrl } from "@/lib/validators";
import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  ArrowRight01Icon,
  AlertCircleIcon,
  Loading02Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

interface UrlInputProps {
  onAnalyze: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onAnalyze, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateGitHubUrl(url);
      if (!validation.valid) {
        setError(validation.error || "Invalid URL");
        return;
      }

      setError(null);
      onAnalyze(url);
    },
    [url, onAnalyze]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUrl(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full max-w-2xl mx-auto jetbrains-mono"
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Input Container */}
        <div
          className={cn(
            "relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-2 rounded-xl border bg-background/50 backdrop-blur-sm transition-all duration-200",
            isFocused ? "ring-2 ring-primary/60" : "border-border",
            error && "border-destructive/50"
          )}
        >
          {/* GitHub Icon - Desktop */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-lg bg-foreground/5 shrink-0">
            <HugeiconsIcon
              icon={GithubIcon}
              className="w-5 h-5 text-foreground/70"
              strokeWidth={1.5}
            />
          </div>

          {/* Input Field */}
          <div className="flex-1 flex items-center gap-2">
            <Input
              type="url"
              placeholder="github.com/owner/repository"
              value={url}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              disabled={isLoading}
              className={cn(
                "flex-1 border-0 bg-transparent shadow-none h-11 outline-none",
                "text-sm sm:text-base",
                "placeholder:text-muted-foreground/40",
                "focus-visible:ring-0 focus-visible:ring-offset-0"
              )}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !url.trim()}
            className={cn(
              "rounded-lg h-10 text-sm font-medium shrink-0 w-full sm:w-auto",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <HugeiconsIcon
                  icon={Loading02Icon}
                  className="w-4 h-4 animate-spin"
                  strokeWidth={1.5}
                />
                <span className="sm:hidden">Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2">
                <HugeiconsIcon
                  icon={Search01Icon}
                  color="currentColor"
                  strokeWidth={1.5}
                />{" "}
                <span className="sm:inline">Analyze</span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="w-3.5 h-3.5 hidden sm:block"
                  strokeWidth={1.5}
                />
              </div>
            )}
          </Button>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-2 text-destructive text-sm px-3"
            >
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="w-3.5 h-3.5 shrink-0"
                strokeWidth={1.5}
              />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Helper Text */}
        <p className="text-xs text-muted-foreground/50 text-center px-4">
          Paste a GitHub repository URL to analyze its structure and code
        </p>
      </form>
    </motion.div>
  );
}
