"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Download,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Link2,
  Loader2,
  ImageIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShareCard } from "@/components/share-card";
import { cn } from "@/lib/utils";
import { DesktopDialogProps } from "./types";
import { VARIANTS, VARIANT_SCALE } from "./constants";
import { ActionSection } from "./action-section";

export function DesktopDialog({
  open,
  onOpenChange,
  shareData,
  variant,
  setVariant,
  currentVariant,
  copied,
  downloading,
  downloadSuccess,
  cardRef,
  handleCopyLink,
  handleDownload,
  handleTwitterShare,
  handleLinkedInShare,
}: DesktopDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 overflow-hidden sm:max-w-3xl lg:max-w-5xl max-h-[85vh]">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 shrink-0">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg instrument-serif tracking-wider font-normal truncate">
                Share Your Analysis
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5 truncate">
                Create a beautiful card for{" "}
                <span className="font-medium text-foreground">
                  {shareData.repoFullName}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex flex-row flex-1 overflow-hidden">
          {/* Left: Preview Area */}
          <div className="flex-1 flex flex-col bg-zinc-950 min-h-0">
            {/* Variant Selector */}
            <div className="flex items-center justify-center gap-2 p-4 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
              {VARIANTS.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    variant === v.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Card Preview */}
            <ScrollArea className="flex-1">
              <div className="flex items-center justify-center p-6 min-h-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={variant}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      transform: `scale(${VARIANT_SCALE[variant].desktop})`,
                      transformOrigin: "center center",
                    }}
                  >
                    <ShareCard
                      ref={cardRef}
                      data={shareData}
                      variant={variant}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Right: Actions Panel */}
          <div className="w-72 xl:w-80 border-l border-border bg-card shrink-0">
            <ScrollArea className="h-full">
              <div className="p-5 space-y-5">
                {/* Download Section */}
                <ActionSection icon={ImageIcon} title="Download Image">
                  <Button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={cn(
                      "w-full h-11 gap-2 transition-all",
                      downloadSuccess && "bg-emerald-600 hover:bg-emerald-600"
                    )}
                  >
                    {downloading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <Check className="w-4 h-4" />
                        Downloaded!
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download PNG
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-muted-foreground mt-2 text-center">
                    High resolution (2x) • PNG format
                  </p>
                </ActionSection>

                <div className="h-px bg-border" />

                {/* Copy Link Section */}
                <ActionSection icon={Link2} title="Share Link">
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    className={cn(
                      "w-full gap-2",
                      copied && "border-primary text-primary"
                    )}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Link
                      </>
                    )}
                  </Button>
                </ActionSection>

                <div className="h-px bg-border" />

                {/* Social Sharing Section */}
                <ActionSection icon={Share2} title="Share on Social">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={handleTwitterShare}
                      variant="outline"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </Button>
                    <Button
                      onClick={handleLinkedInShare}
                      variant="outline"
                    >
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                  </div>
                </ActionSection>

                <div className="h-px bg-border" />

                {/* Card Size Info */}
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Card size:</span>
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {currentVariant?.size} @ 2x
                  </Badge>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}