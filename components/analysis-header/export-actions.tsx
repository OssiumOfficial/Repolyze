"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileDownloadIcon,
  Tick01Icon,
  TextIcon,
  Loading03Icon,
  CodeIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/lib/types";
import { copySummary } from "@/lib/share";
import { downloadPDFReport } from "@/lib/pdf-export";
import { UserTier, canAccessFeature } from "@/lib/tiers";
import { Lock } from "lucide-react";
import { signIn } from "next-auth/react";

interface ExportActionsProps {
  result: Partial<AnalysisResult>;
  tier?: UserTier;
  className?: string;
}

type CopyState = "idle" | "text" | "markdown";

export function ExportActions({ result, tier = "anonymous", className }: ExportActionsProps) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const canDownloadText = canAccessFeature(tier, "downloadText");
  const canDownloadMarkdown = canAccessFeature(tier, "downloadMarkdown");
  const canDownloadPdf = canAccessFeature(tier, "downloadPdf");

  const handleCopyText = useCallback(async () => {
    if (!canDownloadText) { signIn(); return; }
    const success = await copySummary(result, "text");
    if (success) {
      setCopyState("text");
      setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [result, canDownloadText]);

  const handleCopyMarkdown = useCallback(async () => {
    if (!canDownloadMarkdown) { signIn(); return; }
    const success = await copySummary(result, "markdown");
    if (success) {
      setCopyState("markdown");
      setTimeout(() => setCopyState("idle"), 2500);
    }
  }, [result, canDownloadMarkdown]);

  const handleDownloadPDF = useCallback(async () => {
    if (!canDownloadPdf) { signIn(); return; }
    if (!result.metadata) return;

    setDownloading(true);
    try {
      const success = await downloadPDFReport(result as AnalysisResult);
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloading(false);
    }
  }, [result, canDownloadPdf]);

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          "flex items-center w-full gap-1 p-1 rounded-lg bg-muted/30 border border-border/50",
          className
        )}
      >
        {/* Copy Plain Text - Icon only, fixed width */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyText}
              disabled={copyState !== "idle"}
              className={cn(
                "h-8 w-8 min-w-8 p-0 shrink-0",
                "transition-colors duration-200",
                copyState === "text" &&
                  "text-primary border-primary/50 bg-primary/5",
                !canDownloadText && "opacity-60"
              )}
            >
              <AnimatePresence mode="wait">
                {copyState === "text" ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      className="w-4 h-4 text-primary"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <HugeiconsIcon icon={TextIcon} className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs hidden lg:block">
            {!canDownloadText ? "Sign in to copy" : copyState === "text" ? "Copied!" : "Copy as Plain Text"}
          </TooltipContent>
        </Tooltip>

        {/* Copy Markdown - Flex grow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyMarkdown}
              disabled={copyState !== "idle"}
              className={cn(
                "h-8 flex-1 min-w-0 gap-1.5",
                "transition-colors duration-200",
                copyState === "markdown" &&
                  "text-primary border-primary/50 bg-primary/5",
                !canDownloadMarkdown && "opacity-60"
              )}
            >
              <AnimatePresence mode="wait">
                {copyState === "markdown" ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      className="w-4 h-4 text-primary shrink-0"
                    />
                    {/* <span className="text-xs text-primary truncate">
                      Copied!
                    </span> */}
                  </motion.div>
                ) : (
                  <motion.div
                    key="icon"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={CodeIcon}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-xs lg:hidden block">Markdown</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs hidden lg:block">
            {!canDownloadMarkdown ? "Sign in to copy" : copyState === "markdown" ? "Copied!" : "Copy as Markdown"}
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-5 bg-border shrink-0" />

        {/* Download PDF - Flex grow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadPDF}
              disabled={downloading || !result.metadata}
              className={cn(
                "h-8 flex-1 min-w-0 gap-1.5",
                "transition-colors duration-200",
                downloadSuccess && "text-primary border-primary/50 bg-primary/5",
                !canDownloadPdf && "opacity-60"
              )}
            >
              <AnimatePresence mode="wait">
                {downloading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={Loading03Icon}
                      className="w-4 h-4 animate-spin shrink-0"
                    />
                    <span className="text-xs truncate hidden xs:inline">
                      Generating...
                    </span>
                  </motion.div>
                ) : downloadSuccess ? (
                  <motion.div
                    key="success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={Tick01Icon}
                      className="w-4 h-4 text-primary shrink-0"
                    />
                    {/* <span className="text-xs text-primary truncate">
                      Saved!
                    </span> */}
                  </motion.div>
                ) : (
                  <motion.div
                    key="default"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center gap-1.5"
                  >
                    <HugeiconsIcon
                      icon={FileDownloadIcon}
                      className="w-4 h-4 shrink-0"
                    />
                    <span className="text-xs truncate">PDF</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs hidden lg:block">
            {!canDownloadPdf
              ? "Sign in to download"
              : downloading
              ? "Generating PDF..."
              : downloadSuccess
              ? "Downloaded!"
              : "Download PDF Report"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
