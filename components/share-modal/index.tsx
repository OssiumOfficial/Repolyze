"use client";

import { useState, useRef, useCallback, useMemo } from "react";
import {
  ShareCardData,
  createShareData,
  generateShareUrl,
  redirectToTwitter,
  redirectToLinkedIn,
  copyToClipboard,
  downloadAsImage,
  copySummary,
} from "@/lib/share";
import { downloadPDFReport } from "@/lib/pdf-export";
import { useIsMobile } from "@/hooks/use-media-query";
import { ShareModalProps, CardVariant } from "./types";
import { VARIANTS } from "./constants";
import { MobileDrawer } from "./mobile-drawer";
import { DesktopDialog } from "./desktop-dialog";
import { AnalysisResult } from "@/lib/types";

export function ShareModal({ open, onOpenChange, result }: ShareModalProps) {
  const isMobile = useIsMobile();
  const [variant, setVariant] = useState<CardVariant>("detailed");
  const [copied, setCopied] = useState(false);
  const [copySummaryState, setCopySummaryState] = useState<"idle" | "text" | "markdown">("idle");
  const [downloading, setDownloading] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareData: ShareCardData | null = useMemo(
    () => createShareData(result),
    [result]
  );

  const currentVariant = VARIANTS.find((v) => v.id === variant);

  const handleCopyLink = useCallback(async () => {
    if (!shareData) return;
    const success = await copyToClipboard(generateShareUrl(shareData));
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [shareData]);

  const handleCopySummary = useCallback(async (format: "text" | "markdown") => {
    const success = await copySummary(result, format);
    if (success) {
      setCopySummaryState(format);
      setTimeout(() => setCopySummaryState("idle"), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || !shareData) return;
    setDownloading(true);
    try {
      const success = await downloadAsImage(
        cardRef.current,
        `repolyze-${shareData.repoName.toLowerCase().replace(/\s+/g, "-")}${shareData.branch ? `-${shareData.branch}` : ""}`
      );
      if (success) {
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 2500);
      }
    } finally {
      setDownloading(false);
    }
  }, [shareData]);

  const handleDownloadPDF = useCallback(async () => {
    if (!result.metadata) return;
    setDownloadingPDF(true);
    try {
      await downloadPDFReport(result as AnalysisResult);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    } finally {
      setDownloadingPDF(false);
    }
  }, [result]);

  const handleTwitterShare = useCallback(() => {
    if (!shareData) return;
    redirectToTwitter(shareData);
  }, [shareData]);

  const handleLinkedInShare = useCallback(() => {
    if (!shareData) return;
    redirectToLinkedIn(shareData);
  }, [shareData]);

  if (!shareData) return null;

  const sharedProps = {
    open,
    onOpenChange,
    shareData,
    variant,
    setVariant,
    currentVariant,
    copied,
    copySummaryState,
    downloading,
    downloadingPDF,
    downloadSuccess,
    cardRef,
    handleCopyLink,
    handleCopySummary,
    handleDownload,
    handleDownloadPDF,
    handleTwitterShare,
    handleLinkedInShare,
  };

  return isMobile ? (
    <MobileDrawer {...sharedProps} />
  ) : (
    <DesktopDialog {...sharedProps} />
  );
}