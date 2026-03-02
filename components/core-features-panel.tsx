"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cpu,
  ChevronDown,
  FileCode,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CoreFeature } from "@/lib/types";
import { cn } from "@/lib/utils";

interface CoreFeaturesPanelProps {
  features: CoreFeature[];
}

export function CoreFeaturesPanel({ features }: CoreFeaturesPanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <Card className="flex flex-col bg-background h-125 sm:h-140 lg:h-155 border-border/60 gap-0 py-3">
      {/* Header */}
      <CardHeader className="shrink-0 p-4 space-y-2 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            Core Features
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {features.length} features
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="divide-y divide-border/50">
            {features.map((feature, index) => {
              const id = `feature-${index}`;
              return (
                <FeatureItem
                  key={id}
                  feature={feature}
                  isExpanded={expandedId === id}
                  onToggle={() => handleToggle(id)}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface FeatureItemProps {
  feature: CoreFeature;
  isExpanded: boolean;
  onToggle: () => void;
}

function FeatureItem({ feature, isExpanded, onToggle }: FeatureItemProps) {
  return (
    <div
      onClick={onToggle}
      className={cn(
        "px-4 py-3 cursor-pointer transition-colors",
        "hover:bg-muted/30",
        isExpanded && "bg-muted/20",
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Layers className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={cn(
                "text-sm font-medium text-foreground",
                !isExpanded && "line-clamp-1",
              )}
            >
              {feature.name}
            </span>
            <ChevronDown
              className={cn(
                "w-4 h-4 shrink-0 text-muted-foreground/50 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-sm text-muted-foreground mt-1",
              !isExpanded && "line-clamp-2",
            )}
          >
            {feature.description}
          </p>

          {/* Expanded Content */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                {/* Implementation Details */}
                {feature.implementation && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-1.5">
                      How it works
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.implementation}
                    </p>
                  </div>
                )}

                {/* Key Files */}
                {feature.keyFiles && feature.keyFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-2">
                      Key files
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.keyFiles.map((file) => (
                        <code
                          key={file}
                          className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground"
                        >
                          <FileCode className="w-3 h-3" />
                          {file}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patterns */}
                {feature.patterns && feature.patterns.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-2">
                      Design patterns used
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {feature.patterns.map((pattern) => (
                        <span
                          key={pattern}
                          className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20"
                        >
                          {pattern}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
