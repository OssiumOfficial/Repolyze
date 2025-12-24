"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { AIInsight } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AIInsightsProps {
  insights: AIInsight[];
}

const insightConfig = {
  strength: { icon: CheckCircle2, label: "Strengths" },
  weakness: { icon: XCircle, label: "Issues" },
  warning: { icon: AlertTriangle, label: "Warnings" },
  suggestion: { icon: Lightbulb, label: "Tips" },
} as const;

type InsightType = keyof typeof insightConfig;
type FilterType = InsightType | "all";

export function AIInsights({ insights }: AIInsightsProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredInsights = useMemo(
    () =>
      insights.filter((insight) => filter === "all" || insight.type === filter),
    [insights, filter]
  );

  const counts = useMemo(
    () => ({
      all: insights.length,
      strength: insights.filter((i) => i.type === "strength").length,
      weakness: insights.filter((i) => i.type === "weakness").length,
      suggestion: insights.filter((i) => i.type === "suggestion").length,
      warning: insights.filter((i) => i.type === "warning").length,
    }),
    [insights]
  );

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  const handleFilterChange = useCallback((type: FilterType) => {
    setFilter(type);
    setExpandedId(null);
  }, []);

  return (
    <Card className="flex flex-col bg-background h-125 sm:h-140 lg:h-155 border-border/60 gap-0 py-3">
      {/* Header */}
      <CardHeader className="shrink-0 p-4 space-y-3 border-b border-border/50">
        {/* Title */}
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            AI Insights
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {filteredInsights.length}/{insights.length}
          </span>
        </div>

        {/* Filter Badges */}
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 flex-wrap">
            <FilterBadge
              label="All"
              count={counts.all}
              isActive={filter === "all"}
              onClick={() => handleFilterChange("all")}
            />
            {(Object.keys(insightConfig) as InsightType[]).map((type) => (
              <FilterBadge
                key={type}
                label={insightConfig[type].label}
                count={counts[type]}
                isActive={filter === type}
                onClick={() => handleFilterChange(type)}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="opacity-0 h-0" />
        </ScrollArea>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="divide-y divide-border/50">
            {filteredInsights.length > 0 ? (
              filteredInsights.map((insight, index) => {
                const id = `${insight.type}-${index}`;
                return (
                  <InsightItem
                    key={id}
                    insight={insight}
                    isExpanded={expandedId === id}
                    onToggle={() => handleToggle(id)}
                  />
                );
              })
            ) : (
              <EmptyState filter={filter} />
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// --- Filter Badge ---

interface FilterBadgeProps {
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

function FilterBadge({ label, count, isActive, onClick }: FilterBadgeProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md shrink-0",
        "text-xs font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-foreground text-background"
          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
      )}
    >
      {label}
      <span
        className={cn("tabular-nums", isActive ? "opacity-60" : "opacity-50")}
      >
        {count}
      </span>
    </button>
  );
}

// --- Insight Item ---

interface InsightItemProps {
  insight: AIInsight;
  isExpanded: boolean;
  onToggle: () => void;
}

function InsightItem({ insight, isExpanded, onToggle }: InsightItemProps) {
  const config = insightConfig[insight.type];
  const Icon = config.icon;

  return (
    <div
      onClick={onToggle}
      className={cn(
        "px-4 py-3 cursor-pointer transition-colors",
        "hover:bg-muted/30",
        isExpanded && "bg-muted/20"
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className="w-4 h-4 mt-0.5 shrink-0 text-muted-foreground" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-sm font-medium text-foreground",
                !isExpanded && "line-clamp-1"
              )}
            >
              {insight.title}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                isExpanded && "rotate-180"
              )}
            />
          </div>

          {/* Description - always visible, clamps when closed */}
          <p
            className={cn(
              "text-sm text-muted-foreground mt-1",
              !isExpanded && "line-clamp-1"
            )}
          >
            {insight.description}
          </p>

          {/* Animated Expanded Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {/* Full description if needed (optional) could go here if line-clamp above isn't enough context */}

                {/* Affected Files */}
                {insight.affectedFiles && insight.affectedFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-2">
                      Affected files
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {insight.affectedFiles.map((file) => (
                        <code
                          key={file}
                          className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          {file}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category */}
                {insight.category && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60">
                      Category:{" "}
                      <span className="text-muted-foreground">
                        {insight.category}
                      </span>
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground/60 capitalize">
              {insight.type}
            </span>
            <span className="text-xs text-muted-foreground/30">·</span>
            <span
              className={cn(
                "text-xs capitalize",
                insight.priority === "high" && "text-destructive",
                insight.priority === "medium" && "text-primary",
                insight.priority === "low" && "text-muted-foreground/60"
              )}
            >
              {insight.priority}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Empty State ---

function EmptyState({ filter }: { filter: FilterType }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center mb-3">
        <Lightbulb className="w-5 h-5 text-muted-foreground/40" />
      </div>
      <p className="text-sm text-muted-foreground">
        {filter === "all"
          ? "No insights available"
          : `No ${
              insightConfig[filter as InsightType]?.label.toLowerCase() ||
              filter
            } found`}
      </p>
    </div>
  );
}
