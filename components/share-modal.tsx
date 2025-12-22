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
  ImageIcon,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: Partial<AnalysisResult>;
}

type CardVariant = "compact" | "default" | "detailed";

const variantSizes: Record<CardVariant, string> = {
  compact: "420×220",
  default: "500×380",
  detailed: "600×520",
};

export function ShareModal({ open, onOpenChange, result }: ShareModalProps) {
  const [variant, setVariant] = useState<CardVariant>("default");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Generate share data from result
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
        `repogist-${shareData.repoName.toLowerCase().replace(/\s+/g, "-")}-analysis`
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
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 gap-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Share2 className="w-4 h-4 text-primary" />
                </div>
                Share Analysis
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm">
                Create a beautiful share card for{" "}
                <span className="font-medium text-foreground">{shareData.repoFullName}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row max-h-[calc(90vh-100px)]">
          {/* Preview Section */}
          <div className="flex-1 p-6 bg-zinc-950/80 overflow-auto">
            <div className="flex flex-col items-center">
              {/* Variant Selector */}
              <Tabs
                value={variant}
                onValueChange={(v) => setVariant(v as CardVariant)}
                className="mb-6"
              >
                <TabsList className="grid grid-cols-3 w-70 h-9 bg-zinc-800/50">
                  <TabsTrigger
                    value="compact"
                    className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Compact
                  </TabsTrigger>
                  <TabsTrigger
                    value="default"
                    className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Default
                  </TabsTrigger>
                  <TabsTrigger
                    value="detailed"
                    className="text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    Detailed
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Card Preview */}
              <ScrollArea className="w-full">
                <div className="flex justify-center pb-4 min-h-100">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={variant}
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
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
          </div>

          {/* Actions Section */}
          <div className="w-full lg:w-80 p-5 border-t lg:border-t-0 lg:border-l bg-card overflow-auto">
            <div className="space-y-5">
              {/* Download Section */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                  <ImageIcon className="w-4 h-4 text-muted-foreground" />
                  Download
                </h3>
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full justify-center gap-2 h-10"
                  variant={downloadSuccess ? "outline" : "default"}
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : downloadSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download as PNG
                    </>
                  )}
                </Button>
              </div>

              {/* Share Link Section */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  Share Link
                </h3>
                <Button
                  onClick={handleCopyLink}
                  className="w-full justify-center gap-2 h-10"
                  variant="outline"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Link Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Share Link
                    </>
                  )}
                </Button>
              </div>

              {/* Social Share Section */}
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                  <Share2 className="w-4 h-4 text-muted-foreground" />
                  Social Media
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={handleTwitterShare}
                    variant="outline"
                    className="gap-2 h-10"
                  >
                    <Twitter className="w-4 h-4" />
                    Twitter
                  </Button>
                  <Button
                    onClick={handleLinkedInShare}
                    variant="outline"
                    className="gap-2 h-10"
                  >
                    <Linkedin className="w-4 h-4" />
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border" />

              {/* Card Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Card Size</span>
                  <Badge variant="secondary" className="text-xs font-mono">
                    {variantSizes[variant]}px
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Resolution</span>
                  <Badge variant="outline" className="text-xs">
                    2x Retina
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Format</span>
                  <Badge variant="outline" className="text-xs">
                    PNG
                  </Badge>
                </div>
              </div>

              {/* Tips */}
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <h4 className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  Tips
                </h4>
                <ul className="text-[11px] text-muted-foreground space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary">•</span>
                    <span>Compact cards work best for Twitter</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary">•</span>
                    <span>Detailed cards show full score breakdown</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary">•</span>
                    <span>PNG downloads include 2x resolution</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}