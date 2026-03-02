"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronDown,
  FileCode,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KeyConcept } from "@/lib/types";
import { cn } from "@/lib/utils";

interface KeyConceptsPanelProps {
  concepts: KeyConcept[];
}

export function KeyConceptsPanel({ concepts }: KeyConceptsPanelProps) {
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
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            Key Concepts
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {concepts.length} concepts
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full">
          <div className="divide-y divide-border/50">
            {concepts.map((concept, index) => {
              const id = `concept-${index}`;
              return (
                <ConceptItem
                  key={id}
                  concept={concept}
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

interface ConceptItemProps {
  concept: KeyConcept;
  isExpanded: boolean;
  onToggle: () => void;
}

function ConceptItem({ concept, isExpanded, onToggle }: ConceptItemProps) {
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
        <Sparkles className="w-4 h-4 mt-0.5 shrink-0 text-amber-500/70" />

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
              {concept.name}
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
            {concept.description}
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
                {concept.implementation && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-1.5">
                      Implementation in this codebase
                    </span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {concept.implementation}
                    </p>
                  </div>
                )}

                {/* Related Files */}
                {concept.relatedFiles && concept.relatedFiles.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-xs text-muted-foreground/60 block mb-2">
                      Related files
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {concept.relatedFiles.map((file) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
