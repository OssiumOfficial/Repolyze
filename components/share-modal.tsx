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
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useIsMobile } from "@/hooks/use-media-query";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: Partial<AnalysisResult>;
}

type CardVariant = "compact" | "default" | "detailed";

const variants: {
  id: CardVariant;
  label: string;
  desc: string;
  size: string;
}[] = [
  { id: "compact", label: "Compact", desc: "Best for Twitter", size: "420px" },
  { id: "default", label: "Default", desc: "Balanced view", size: "500px" },
  { id: "detailed", label: "Detailed", desc: "Full breakdown", size: "600px" },
];

export function ShareModal({ open, onOpenChange, result }: ShareModalProps) {
  const isMobile = useIsMobile();
  const [variant, setVariant] = useState<CardVariant>("default");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareData: ShareCardData | null = useMemo(
    () => createShareData(result),
    [result]
  );

  const currentVariant = variants.find((v) => v.id === variant);

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
    window.open(
      generateTwitterShareUrl(shareData),
      "_blank",
      "noopener,noreferrer"
    );
  }, [shareData]);

  const handleLinkedInShare = useCallback(() => {
    if (!shareData) return;
    window.open(
      generateLinkedInShareUrl(shareData),
      "_blank",
      "noopener,noreferrer"
    );
  }, [shareData]);

  if (!shareData) return null;

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Share2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <DrawerTitle className="text-base text-left instrument-serif font-normal tracking-wide">
                    Share Analysis
                  </DrawerTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {shareData.repoFullName}
                  </p>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-hidden">
            {/* Variant Selector */}
            <div className="flex items-center justify-center gap-1 px-4 py-2 border-b border-border bg-muted/30">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariant(v.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                    variant === v.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>

            {/* Card Preview */}
            <ScrollArea className="h-[35vh]">
              <div className="flex items-center justify-center p-4 bg-zinc-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={variant}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      transform: `scale(${
                        variant === "detailed"
                          ? 0.45
                          : variant === "default"
                          ? 0.55
                          : 0.7
                      })`,
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

            {/* Quick Actions Grid */}
            <div className="p-4 space-y-3 border-t border-border">
              {/* Primary Action */}
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

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-3 gap-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className={cn(
                    "h-11 gap-1.5 text-xs",
                    copied && "border-emerald-500/50 text-emerald-500"
                  )}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Link"}
                </Button>
                <Button
                  onClick={handleTwitterShare}
                  variant="outline"
                  className="h-11 gap-1.5 text-xs hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/30"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  onClick={handleLinkedInShare}
                  variant="outline"
                  className="h-11 gap-1.5 text-xs hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] hover:border-[#0A66C2]/30"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>

              {/* Info Badge */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge
                  variant="outline"
                  className="text-[10px] bg-muted/50 text-muted-foreground"
                >
                  {currentVariant?.size} @ 2x
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] bg-muted/50 text-muted-foreground"
                >
                  PNG format
                </Badge>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Dialog
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
                      transform: `scale(${
                        variant === "detailed"
                          ? 0.75
                          : variant === "default"
                          ? 0.85
                          : 0.95
                      })`,
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
                </ActionSection>

                <div className="h-px bg-border" />

                {/* Social Sharing Section */}
                <ActionSection icon={Share2} title="Share on Social">
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
                </ActionSection>

                <div className="h-px bg-border" />

                {/* Tips Section */}
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground mb-1.5">
                        Pro Tips
                      </p>
                      <ul className="text-[11px] text-muted-foreground space-y-1">
                        <TipItem text="Compact works best on Twitter" />
                        <TipItem text="Detailed shows full score breakdown" />
                        <TipItem text="Images are retina-ready (2x)" />
                      </ul>
                    </div>
                  </div>
                </div>

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

// ============================================
// Sub-components
// ============================================

interface ActionSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}

function ActionSection({ icon: Icon, title, children }: ActionSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function TipItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
      <span>{text}</span>
    </li>
  );
}
