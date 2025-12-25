"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Download,
  Check,
  Twitter,
  Linkedin,
  Link2,
  Loader2,
  X,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { MobileDrawerProps } from "./types";
import { VARIANTS, VARIANT_SCALE } from "./constants";

export function MobileDrawer({
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
}: MobileDrawerProps) {
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
            {VARIANTS.map((v) => (
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
                    transform: `scale(${VARIANT_SCALE[variant].mobile})`,
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