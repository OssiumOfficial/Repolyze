"use client";

import { useState, useRef, useCallback, useMemo } from "react";
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
  Sparkles,
  ImageIcon,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShareCard } from "@/components/share-card";
import {
  ShareCardData,
  createShareData,
  generateShareUrl,
  generateTwitterShareUrl,
  generateLinkedInShareUrl,
  copyToClipboard,
  downloadAsImage,
} from "@/lib/share";
import { cn } from "@/lib/utils";
import { AnalysisResult } from "@/lib/types";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: Partial<AnalysisResult>;
}

type CardVariant = "compact" | "default" | "detailed";

const variants: { id: CardVariant; label: string; desc: string }[] = [
  { id: "compact", label: "Compact", desc: "Minimal • Twitter" },
  { id: "default", label: "Default", desc: "Balanced view" },
  { id: "detailed", label: "Detailed", desc: "Full breakdown" },
];

export function ShareModal({ open, onOpenChange, result }: ShareModalProps) {
  const [variant, setVariant] = useState<CardVariant>("default");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareData: ShareCardData | null = useMemo(
    () => createShareData(result),
    [result]
  );

  const handleCopyLink = useCallback(async () => {
    if (!shareData) return;
    const url = generateShareUrl(shareData);
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareData]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !shareData) return;
    setDownloading(true);

    try {
      const success = await downloadAsImage(
        cardRef.current,
        `repogist-${shareData.repoName.toLowerCase().replace(/\s+/g, "-")}`
      );

      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } finally {
      setDownloading(false);
    }
  }, [shareData]);

  const handleTwitterShare = useCallback(() => {
    if (!shareData) return;
    window.open(generateTwitterShareUrl(shareData), "_blank", "noopener,noreferrer");
  }, [shareData]);

  const handleLinkedInShare = useCallback(() => {
    if (!shareData) return;
    window.open(generateLinkedInShareUrl(shareData), "_blank", "noopener,noreferrer");
  }, [shareData]);

  if (!shareData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                Share Your Analysis
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create a beautiful card for{" "}
                <span className="font-medium text-foreground">
                  {shareData.repoFullName}
                </span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row min-h-[400px] max-h-[calc(95vh-100px)]">
          {/* Left: Preview Area */}
          <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
            {/* Variant Selector */}
            <div className="flex items-center justify-center gap-1 p-4 bg-zinc-900/50 border-b border-zinc-800">
              {variants.map((v) => (
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
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={variant}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ShareCard ref={cardRef} data={shareData} variant={variant} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Variant Description - Mobile */}
            <div className="lg:hidden flex items-center justify-center gap-2 p-3 bg-zinc-900/50 border-t border-zinc-800">
              <Badge variant="outline" className="bg-zinc-800 border-zinc-700 text-zinc-300">
                {variants.find((v) => v.id === variant)?.desc}
              </Badge>
            </div>
          </div>

          {/* Right: Actions Panel */}
          <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-border bg-card p-5 overflow-auto">
            <div className="space-y-5">
              {/* Download */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Download Image
                </h3>
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
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Copy Link */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  Share Link
                </h3>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className={cn(
                    "w-full h-11 gap-2",
                    copied && "border-emerald-500/50 text-emerald-500"
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
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Social Sharing */}
              <div>
                <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  Share on Social
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleTwitterShare}
                    variant="outline"
                    className="h-11 gap-2 hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={handleLinkedInShare}
                    variant="outline"
                    className="h-11 gap-2 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Info */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">
                      Pro Tips
                    </p>
                    <ul className="text-[11px] text-muted-foreground space-y-1">
                      <li className="flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Compact works best on Twitter</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Detailed shows full score breakdown</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <ChevronRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-primary" />
                        <span>Images are retina-ready (2x)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
