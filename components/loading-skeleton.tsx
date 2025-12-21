"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { StreamingAnalysis } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  status: StreamingAnalysis;
}

export function LoadingSkeleton({ status }: LoadingSkeletonProps) {
  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 w-full max-w-full overflow-hidden">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4 px-4"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 shadow-sm">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-primary whitespace-nowrap">
            {status.currentStep}
          </span>
        </div>

        <div className="w-full max-w-xs space-y-2">
          <Progress value={status.progress} className="h-1.5" />
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center tabular-nums">
            {Math.round(status.progress)}% complete
          </p>
        </div>
      </motion.div>

      {/* Analysis Header Skeleton */}
      <AnalysisHeaderSkeleton />

      {/* Row 1: File Tree (Full Width) */}
      <div className="space-y-3">
        <SectionHeaderSkeleton title="w-32 sm:w-36" />
        <FileTreeSkeleton />
      </div>

      {/* Row 2: Score Card + AI Insights */}
      <div className="space-y-3">
        <SectionHeaderSkeleton title="w-28 sm:w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ScoreCardSkeleton />
          <AIInsightsSkeleton />
        </div>
      </div>

      {/* Row 3: Architecture */}
      <div className="space-y-3">
        <SectionHeaderSkeleton title="w-24 sm:w-28" icon />
        <ArchitectureSkeleton />
      </div>

      {/* Row 4: Data Flow */}
      <div className="space-y-3">
        <SectionHeaderSkeleton title="w-20 sm:w-24" icon />
        <DataFlowSkeleton />
      </div>

      {/* Row 5: Recommendations Tabs */}
      <div className="space-y-3">
        <SectionHeaderSkeleton title="w-32 sm:w-36" />
        <RecommendationsSkeleton />
      </div>
    </div>
  );
}

// --- Section Header Skeleton ---
function SectionHeaderSkeleton({
  title,
  icon = false,
}: {
  title: string;
  icon?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      {icon && (
        <Skeleton className="w-6 h-6 sm:w-7 sm:h-7 rounded-md shrink-0" />
      )}
      <Skeleton className={cn("h-5", title)} />
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );
}

// --- Analysis Header Skeleton ---
function AnalysisHeaderSkeleton() {
  return (
    <Card className="border-border/60 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Top Row: Avatar & Info */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="absolute -inset-0.5 bg-primary/10 rounded-xl blur-sm" />
              <Skeleton className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl" />
            </div>

            {/* Title Block */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-5 sm:h-7 w-32 sm:w-48 max-w-[70%]" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-4 w-24 sm:w-32" />
            </div>
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-2 shrink-0">
            <Skeleton className="w-9 h-9 rounded-md" />
            <Skeleton className="w-24 h-9 rounded-md" />
          </div>
        </div>

        {/* Description (Visible on all sizes, responsive width) */}
        <div className="mt-4 space-y-1.5">
          <Skeleton className="h-4 w-full sm:w-3/4" />
          <Skeleton className="h-4 w-2/3 sm:w-1/2" />
        </div>

        {/* Meta Badges - Scrollable on mobile */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <Skeleton className="h-6 w-20 rounded-md shrink-0" />
          <Skeleton className="h-6 w-16 rounded-md shrink-0" />
          <Skeleton className="h-6 w-24 rounded-md shrink-0" />
          <Skeleton className="h-6 w-28 rounded-md shrink-0" />
        </div>

        {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/20 border-border/40"
            >
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <div className="flex-1 min-w-0 space-y-1.5">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-full max-w-[4rem]" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden gap-3 mt-5">
          <Skeleton className="flex-1 h-10 rounded-md" />
          <Skeleton className="flex-1 h-10 rounded-md" />
        </div>
      </div>

      {/* Bottom Section */}
      <CardContent className="p-4 sm:p-6 pt-0 space-y-6 border-t border-border/50">
        {/* Topics */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton
                key={i}
                className="h-6 rounded-full"
                style={{ width: `${Math.random() * 40 + 60}px` }}
              />
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton
                key={i}
                className="h-6 rounded-md"
                style={{ width: `${Math.random() * 30 + 50}px` }}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- File Tree Skeleton ---
function FileTreeSkeleton() {
  return (
    <Card className="border-border/60 h-[450px] sm:h-[500px] lg:h-[600px] flex flex-col">
      <CardHeader className="shrink-0 p-4 border-b border-border/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-32" />
          </div>
          <div className="flex gap-2 self-start sm:self-auto">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-full rounded-md" />
      </CardHeader>

      <CardContent className="flex-1 p-2 sm:p-4 space-y-1 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 px-2"
            style={{ paddingLeft: `${(i % 3) * 16 + 8}px` }}
          >
            <Skeleton className="w-4 h-4 rounded shrink-0" />
            <Skeleton
              className="h-4 rounded-sm"
              style={{ width: `${Math.random() * 100 + 100}px` }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Score Card Skeleton ---
function ScoreCardSkeleton() {
  return (
    <Card className="border-border/60 h-full">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center gap-6 h-[calc(100%-80px)]">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0">
          <Skeleton className="w-full h-full rounded-full" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-sm" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// --- AI Insights Skeleton ---
function AIInsightsSkeleton() {
  return (
    <Card className="border-border/60 h-full min-h-[500px] flex flex-col">
      <CardHeader className="shrink-0 p-4 border-b border-border/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full shrink-0"
              style={{ width: i === 1 ? "40px" : "70px" }}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3 rounded-xl border border-border/50 bg-muted/20 space-y-3"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="w-4 h-4 shrink-0" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-md" />
                  <Skeleton className="h-5 w-14 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Architecture Skeleton ---
function ArchitectureSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-40" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-8">
        {[1, 2].map((layer) => (
          <div key={layer} className="space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <Skeleton className="h-5 w-24" />
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pl-0 sm:pl-11">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="p-4 rounded-xl bg-muted/20 border border-border/50 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-5 w-14 rounded" />
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// --- Data Flow Skeleton ---
function DataFlowSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-5 w-36 hidden sm:block" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Responsive Grid for Nodes */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((col) => (
            <div key={col} className="space-y-3 min-w-0">
              <div className="flex items-center gap-2 pb-2 border-b border-border/40">
                <Skeleton className="w-5 h-5 rounded-sm shrink-0" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="space-y-2">
                {[1, 2].map((node) => (
                  <div
                    key={node}
                    className="p-3 rounded-lg border border-border/50 bg-muted/20 space-y-2"
                  >
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Connections */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-4 w-28" />
            <div className="flex-1 h-px bg-border/50" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((edge) => (
              <div
                key={edge}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/40"
              >
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-3 w-12 hidden xs:block" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Recommendations Skeleton ---
function RecommendationsSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-8 h-8 rounded-md shrink-0" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-4 rounded-xl border border-border/50 space-y-3"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Skeleton className="h-4 w-1/2 min-w-[120px]" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />

                  <div className="flex flex-wrap gap-2 pt-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-20" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                </div>
                <Skeleton className="w-5 h-5 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
