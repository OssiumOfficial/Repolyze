"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Clock,
  Zap,
  ChevronDown,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Refactor } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RefactorsPanelProps {
  refactors: Refactor[];
}

const impactConfig = {
  high: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "High Impact",
  },
  medium: {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    label: "Medium",
  },
  low: {
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    label: "Low",
  },
};

const effortConfig = {
  high: { icon: Clock, color: "text-red-500", label: "High Effort" },
  medium: { icon: Clock, color: "text-yellow-500", label: "Medium" },
  low: { icon: Zap, color: "text-green-500", label: "Quick Win" },
};

function RefactorItem({
  refactor,
  index,
}: {
  refactor: Refactor;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const EffortIcon = effortConfig[refactor.effort]?.icon || Clock;

  const handleCopy = async () => {
    if (refactor.suggestedCode) {
      await navigator.clipboard.writeText(refactor.suggestedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={cn(
          "rounded-xl border bg-card transition-all duration-200 overflow-hidden",
          isOpen && "border-primary/30"
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 sm:p-4 text-left hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 shrink-0">
              <Wrench className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Title and Badge Row */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                <span className="font-medium text-sm line-clamp-2 sm:line-clamp-1">
                  {refactor.title}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] sm:text-xs shrink-0 w-fit",
                    impactConfig[refactor.impact]?.color
                  )}
                >
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden xs:inline">
                    {impactConfig[refactor.impact]?.label}
                  </span>
                  <span className="xs:hidden">
                    {refactor.impact}
                  </span>
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                {refactor.description}
              </p>

              {/* Meta Row */}
              <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <EffortIcon
                    className={cn(
                      "w-3 h-3 sm:w-3.5 sm:h-3.5",
                      effortConfig[refactor.effort]?.color
                    )}
                  />
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    <span className="hidden sm:inline">
                      {effortConfig[refactor.effort]?.label}
                    </span>
                    <span className="sm:hidden">
                      {refactor.effort === "low" ? "Quick" : refactor.effort}
                    </span>
                  </span>
                </div>
                <Badge variant="secondary" className="text-[10px] sm:text-xs h-5 sm:h-auto">
                  {refactor.category}
                </Badge>
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {refactor.files?.length || 0} file
                  {(refactor.files?.length || 0) !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0"
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
                {/* Affected Files */}
                {refactor.files && refactor.files.length > 0 && (
                  <div>
                    <h5 className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-2">
                      Affected Files
                    </h5>
                    <ScrollArea className="w-full">
                      <div className="flex flex-wrap gap-1 sm:gap-1.5 pb-1">
                        {refactor.files.map((file) => (
                          <code
                            key={file}
                            className="text-[10px] sm:text-xs bg-muted px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md font-mono whitespace-nowrap"
                          >
                            {file}
                          </code>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" className="h-1.5" />
                    </ScrollArea>
                  </div>
                )}

                {/* Suggested Code */}
                {refactor.suggestedCode && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                        Suggested Code
                      </h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1 text-green-500" />
                            <span className="hidden xs:inline">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                            <span className="hidden xs:inline">Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <ScrollArea className="max-h-32 sm:max-h-40">
                      <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border">
                        <pre className="text-[10px] sm:text-xs font-mono whitespace-pre-wrap wrap-break-word">
                          {refactor.suggestedCode}
                        </pre>
                      </div>
                      <ScrollBar orientation="vertical" />
                    </ScrollArea>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function RefactorsPanel({ refactors = [] }: RefactorsPanelProps) {
  const safeRefactors = Array.isArray(refactors) ? refactors : [];

  const sortedRefactors = [...safeRefactors].sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const effortOrder = { low: 0, medium: 1, high: 2 };
    const impactDiff =
      (impactOrder[a.impact] || 1) - (impactOrder[b.impact] || 1);
    if (impactDiff !== 0) return impactDiff;
    return (effortOrder[a.effort] || 1) - (effortOrder[b.effort] || 1);
  });

  const quickWins = sortedRefactors.filter(
    (r) => r.effort === "low" && (r.impact === "high" || r.impact === "medium")
  );

  return (
    <Card className="h-full">
      <CardHeader className="p-3 sm:pb-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <span className="truncate">Refactoring Suggestions</span>
          </CardTitle>
          <ScrollArea className="w-full sm:w-auto">
            <div className="flex gap-1.5 sm:gap-2 pb-1 sm:pb-0">
              <Badge variant="secondary" className="text-[10px] sm:text-xs shrink-0">
                {safeRefactors.length} suggestion
                {safeRefactors.length !== 1 ? "s" : ""}
              </Badge>
              {quickWins.length > 0 && (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] sm:text-xs shrink-0">
                  <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                  {quickWins.length} Quick Win{quickWins.length !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
          </ScrollArea>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
        <ScrollArea className="">
          <div className="space-y-2 sm:space-y-3 pr-2 sm:pr-4">
            {sortedRefactors.map((refactor, index) => (
              <RefactorItem
                key={refactor.id || index}
                refactor={refactor}
                index={index}
              />
            ))}

            {safeRefactors.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 sm:py-12 text-muted-foreground"
              >
                <Wrench className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 opacity-20" />
                <p className="font-medium text-sm sm:text-base">No refactoring suggestions</p>
                <p className="text-xs sm:text-sm mt-1">
                  The codebase looks well-structured!
                </p>
              </motion.div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

