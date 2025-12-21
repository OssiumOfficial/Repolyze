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
    <div className="space-y-6 sm:space-y-8 lg:space-y-10">
      {/* Progress Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm font-medium text-primary">
            {status.currentStep}
          </span>
        </div>

        <div className="w-full max-w-xs space-y-1.5">
          <Progress value={status.progress} className="h-1.5" />
          <p className="text-[10px] sm:text-xs text-muted-foreground text-center tabular-nums">
            {Math.round(status.progress)}% complete
          </p>
        </div>
      </motion.div>

      {/* Analysis Header Skeleton */}
      <AnalysisHeaderSkeleton />

      {/* Row 1: File Tree (Full Width) */}
      <div>
        <SectionHeaderSkeleton title="w-36" />
        <div className="mt-4">
          <FileTreeSkeleton />
        </div>
      </div>

      {/* Row 2: Score Card + AI Insights */}
      <div>
        <SectionHeaderSkeleton title="w-32" />
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <ScoreCardSkeleton />
          <AIInsightsSkeleton />
        </div>
      </div>

      {/* Row 3: Architecture */}
      <div>
        <SectionHeaderSkeleton title="w-28" icon />
        <div className="mt-4">
          <ArchitectureSkeleton />
        </div>
      </div>

      {/* Row 4: Data Flow */}
      <div>
        <SectionHeaderSkeleton title="w-24" icon />
        <div className="mt-4">
          <DataFlowSkeleton />
        </div>
      </div>

      {/* Row 5: Recommendations Tabs */}
      <div>
        <SectionHeaderSkeleton title="w-36" />
        <div className="mt-4">
          <RecommendationsSkeleton />
        </div>
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
    <div className="flex items-center gap-3">
      {icon && <Skeleton className="w-7 h-7 rounded-md" />}
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
        {/* Top Row */}
        <div className="flex gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 bg-primary/10 rounded-xl blur-sm" />
            <Skeleton className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 sm:h-6 w-32 sm:w-48" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="hidden sm:block h-4 w-full max-w-md" />
          </div>

          {/* Desktop Actions */}
          <div className="hidden sm:flex gap-1.5 shrink-0">
            <Skeleton className="w-8 h-8 rounded-md" />
            <Skeleton className="w-20 h-8 rounded-md" />
          </div>
        </div>

        {/* Mobile Description */}
        <Skeleton className="sm:hidden h-4 w-full mt-3" />
        <Skeleton className="sm:hidden h-4 w-3/4 mt-1.5" />

        {/* Meta Badges */}
        <div className="flex gap-1.5 mt-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-28 rounded-full" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {[true, false, false, false].map((highlight, i) => (
            <div
              key={i}
              className={cn(
                "flex items-center gap-2.5 p-3 rounded-lg border",
                highlight
                  ? "bg-primary/5 border-primary/20"
                  : "bg-muted/20 border-border/40"
              )}
            >
              <Skeleton
                className={cn(
                  "w-8 h-8 rounded-md",
                  highlight ? "bg-primary/20" : ""
                )}
              />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-3 w-10" />
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Actions */}
        <div className="flex sm:hidden gap-2 mt-4">
          <Skeleton className="flex-1 h-9 rounded-md" />
          <Skeleton className="flex-1 h-9 rounded-md" />
        </div>
      </div>

      {/* Bottom Section */}
      <CardContent className="p-4 sm:p-6 pt-0 space-y-5 border-t border-border/50">
        {/* Topics */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-2.5">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-6" />
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="flex gap-1.5">
            {[20, 16, 24, 14, 18, 22].map((w, i) => (
              <Skeleton
                key={i}
                className={cn(
                  "h-5 rounded-full",
                  i === 0 ? "bg-primary/10" : ""
                )}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-5" />
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="flex gap-1.5">
            {[18, 14, 20, 12, 16].map((w, i) => (
              <Skeleton
                key={i}
                className={cn("h-5 rounded-md", i < 3 ? "bg-primary/10" : "")}
                style={{ width: `${w * 4}px` }}
              />
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Skeleton className="w-5 h-5 rounded-md bg-primary/10" />
            <Skeleton className="h-3 w-16" />
            <div className="flex-1 h-px bg-border/40" />
          </div>
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// --- File Tree Skeleton ---
function FileTreeSkeleton() {
  return (
    <Card className="border-border/60 h-[500px] sm:h-[560px] lg:h-[600px] flex flex-col">
      <CardHeader className="shrink-0 p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-full rounded-md" />
        <div className="flex gap-1.5">
          {[16, 12, 14, 18, 10].map((w, i) => (
            <Skeleton
              key={i}
              className="h-5 rounded-full"
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-3 space-y-1">
        {[0, 1, 1, 2, 2, 2, 1, 2, 0, 1, 1, 2].map((level, i) => (
          <div
            key={i}
            className="flex items-center gap-2 py-1.5"
            style={{ paddingLeft: `${level * 14 + 8}px` }}
          >
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-4 flex-1 max-w-[120px]" />
          </div>
        ))}
      </CardContent>

      <div className="shrink-0 px-4 py-2.5 border-t border-border/50 bg-muted/20 flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </Card>
  );
}

// --- Score Card Skeleton ---
function ScoreCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Circular Score */}
        <div className="flex justify-center py-2">
          <div className="relative w-36 h-36 sm:w-40 sm:h-40">
            <Skeleton className="w-full h-full rounded-full" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-3 w-14 mt-1" />
            </div>
          </div>
        </div>

        <div className="h-px bg-border/50" />

        {/* Individual Scores */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-4 h-4 rounded" />
                  <Skeleton className="h-4 w-20 sm:w-24" />
                </div>
                <Skeleton className="h-4 w-8" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center p-2 rounded-lg bg-muted/30">
              <Skeleton className="h-5 w-6 mx-auto" />
              <Skeleton className="h-2 w-8 mx-auto mt-1" />
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
    <Card className="border-border/60 h-[500px] sm:h-[560px] lg:h-[600px] flex flex-col">
      <CardHeader className="shrink-0 p-4 border-b border-border/50 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-1.5">
          {[12, 20, 16, 18, 14].map((w, i) => (
            <Skeleton
              key={i}
              className={cn("h-7 rounded-md", i === 0 && "bg-foreground/20")}
              style={{ width: `${w * 4}px` }}
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-2"
          >
            <div className="flex items-start gap-3">
              <Skeleton className="w-7 h-7 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="w-4 h-4" />
                </div>
                <Skeleton className="h-3 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-14 rounded-md" />
                  <Skeleton className="h-4 w-12 rounded-md" />
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
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-6">
        {[1, 2, 3].map((layer) => (
          <div key={layer} className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-7 h-7 rounded-md" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-6" />
              <div className="flex-1 h-px bg-border/50" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 ml-9">
              {[1, 2].map((card) => (
                <div
                  key={card}
                  className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-2"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-1.5 pt-1">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-4 w-14 rounded" />
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
      <CardHeader className="p-3 sm:p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Nodes Grid */}
        <div className="flex gap-3 sm:gap-4 overflow-hidden sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((type) => (
            <div key={type} className="space-y-2 min-w-[200px] sm:min-w-0">
              <div className="flex items-center gap-2">
                <Skeleton className="w-6 h-6 rounded-md" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-5" />
              </div>
              <div className="space-y-1.5">
                {[1, 2].map((node) => (
                  <div
                    key={node}
                    className="p-2 sm:p-3 rounded-lg bg-muted/20 border border-border/50 space-y-1.5"
                  >
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Connections */}
        <div className="space-y-2 sm:space-y-3 pt-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <Skeleton className="h-4 w-20" />
            <div className="flex-1 h-px bg-border/50" />
            <Skeleton className="h-3 w-4" />
          </div>
          <div className="grid gap-1.5 grid-cols-1 sm:grid-cols-2">
            {[1, 2, 3, 4].map((edge) => (
              <div
                key={edge}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-muted/20"
              >
                <Skeleton className="h-3 w-14" />
                <Skeleton className="w-3.5 h-3.5" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="hidden xs:block h-3 w-12 ml-auto" />
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
      <CardHeader className="p-3 sm:p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-7 h-7 rounded-md" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-4">
        {/* Tabs */}
        <div className="flex gap-1.5 mb-4">
          <Skeleton className="h-10 w-28 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
        </div>

        {/* Items */}
        <div className="space-y-2 sm:space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="p-3 sm:p-4 rounded-xl border border-border/50 space-y-2"
            >
              <div className="flex items-start gap-2 sm:gap-3">
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-4/5" />
                  <div className="flex gap-2 sm:gap-3 pt-1">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-12" />
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