// components/repo-analyzer/index.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs";
import { UrlInput } from "@/components/url-input";
import { FileTree } from "@/components/file-tree";
import { ScoreCard } from "@/components/score-card";
import { AIInsights } from "@/components/ai-insights";
import { ArchitectureDiagram } from "@/components/architecture-diagram";
import { DataFlowDiagram } from "@/components/data-flow-diagram";
import { RefactorsPanel } from "@/components/refactors-panel";
import { AutomationsPanel } from "@/components/automations-panel";
import { AnalysisHeader } from "@/components/analysis-header";
import { LoadingSkeleton } from "@/components/loading-skeleton";
import { useAnalysis } from "@/hooks/use-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import About from "../about";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  RotateLeft01Icon,
  GitBranchIcon,
  WorkflowSquare10Icon,
  Wrench01Icon,
  ZapIcon,
  Refresh01Icon,
  Database01Icon,
} from "@hugeicons/core-free-icons";

import { fadeIn, slideUp } from "./animations";
import { SectionHeader } from "./section-header";
import { TabTriggerItem } from "./tab-trigger-item";
import { EmptyState } from "./empty-state";

export function RepoAnalyzer() {
  const {
    analyze,
    status,
    result,
    reset,
    refresh,
    isLoading,
    isComplete,
    hasError,
    isIdle,
    isCached,
  } = useAnalysis();

  return (
    <div className="w-full">
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        <section className="w-full">
          <UrlInput onAnalyze={analyze} isLoading={isLoading} />
        </section>

        <AnimatePresence mode="wait">
          {hasError && (
            <motion.section
              key="error"
              variants={slideUp}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              <Card className="border-destructive/30 bg-destructive/5">
                <CardContent className="p-8 sm:p-10 lg:p-12">
                  <div className="flex flex-col items-center text-center max-w-md mx-auto">
                    <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        className="w-7 h-7 text-destructive"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Analysis Failed
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                      {status.error ||
                        "Something went wrong while analyzing the repository."}
                    </p>
                    <Button
                      onClick={reset}
                      variant="outline"
                      className="border-border hover:bg-muted"
                    >
                      <HugeiconsIcon
                        icon={RotateLeft01Icon}
                        className="w-4 h-4 mr-2"
                      />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {isLoading && (
            <motion.section
              key="loading"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <LoadingSkeleton status={status} />
            </motion.section>
          )}

          {isComplete && result?.metadata && (
            <motion.div
              key="results"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8 lg:space-y-10"
            >
              {/* Cache indicator */}
              {isCached && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-3"
                >
                  <Badge
                    variant="secondary"
                    className="gap-1.5 px-3 py-1 bg-primary/10 text-primary border-primary/20"
                  >
                    <HugeiconsIcon
                      icon={Database01Icon}
                      className="w-3.5 h-3.5"
                    />
                    Loaded from cache
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refresh}
                    disabled={isLoading}
                    className="h-7 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary"
                  >
                    <HugeiconsIcon
                      icon={Refresh01Icon}
                      className="w-3.5 h-3.5"
                    />
                    Refresh Analysis
                  </Button>
                </motion.div>
              )}

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="w-full"
              >
                <AnalysisHeader
                  metadata={result.metadata}
                  techStack={result.techStack}
                  summary={result.summary}
                  result={result}
                />
              </motion.section>

              {/* File Tree */}
              {result.fileTree && result.fileStats && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="w-full"
                >
                  <SectionHeader title="Repository Structure" />
                  <div className="mt-4">
                    <FileTree tree={result.fileTree} stats={result.fileStats} />
                  </div>
                </motion.section>
              )}

              {/* Score Card + AI Insights */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
                className="w-full"
              >
                <SectionHeader title="Analysis Overview" />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {result.scores && <ScoreCard scores={result.scores} />}
                  {result.insights && result.insights.length > 0 && (
                    <AIInsights insights={result.insights} />
                  )}
                </div>
              </motion.section>

              {/* Architecture Diagram */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-full"
              >
                <SectionHeader title="Architecture" icon={GitBranchIcon} />
                <div className="mt-4">
                  {result.architecture && result.architecture.length > 0 ? (
                    <ArchitectureDiagram components={result.architecture} />
                  ) : (
                    <EmptyState
                      icon={GitBranchIcon}
                      title="No Architecture Data"
                      description="Architecture visualization is not available for this repository."
                    />
                  )}
                </div>
              </motion.section>

              {/* Data Flow Diagram */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="w-full"
              >
                <SectionHeader title="Data Flow" icon={WorkflowSquare10Icon} />
                <div className="mt-4">
                  {result.dataFlow?.nodes &&
                  result.dataFlow.nodes.length > 0 ? (
                    <DataFlowDiagram
                      nodes={result.dataFlow.nodes}
                      edges={result.dataFlow.edges || []}
                    />
                  ) : (
                    <EmptyState
                      icon={WorkflowSquare10Icon}
                      title="No Data Flow Information"
                      description="Data flow visualization is not available for this repository."
                    />
                  )}
                </div>
              </motion.section>

              {/* Refactors & Automations Tabs */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="w-full"
              >
                <SectionHeader title="Recommendations" />

                <div className="mt-4">
                  <Tabs defaultValue="refactors" className="w-full">
                    <ScrollArea className="w-full pb-1">
                      <TabsList
                        className={cn("inline-flex h-10 sm:h-11 p-1 gap-1")}
                      >
                        <TabTriggerItem
                          value="refactors"
                          icon={Wrench01Icon}
                          label="Refactors"
                          count={result.refactors?.length}
                        />
                        <TabTriggerItem
                          value="automations"
                          icon={ZapIcon}
                          label="Automations"
                          count={result.automations?.length}
                        />
                      </TabsList>
                      <ScrollBar
                        orientation="horizontal"
                        className="invisible"
                      />
                    </ScrollArea>

                    <TabsContent
                      value="refactors"
                      className="mt-4 sm:mt-6 focus-visible:outline-none"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {result.refactors && result.refactors.length > 0 ? (
                          <RefactorsPanel refactors={result.refactors} />
                        ) : (
                          <EmptyState
                            icon={Wrench01Icon}
                            title="No Refactoring Suggestions"
                            description="No refactoring opportunities were identified."
                          />
                        )}
                      </motion.div>
                    </TabsContent>

                    <TabsContent
                      value="automations"
                      className="mt-4 sm:mt-6 focus-visible:outline-none"
                    >
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {result.automations && result.automations.length > 0 ? (
                          <AutomationsPanel
                            automations={result.automations}
                            repoFullName={result.metadata?.fullName}
                          />
                        ) : (
                          <EmptyState
                            icon={ZapIcon}
                            title="No Automation Suggestions"
                            description="No automation opportunities were identified."
                          />
                        )}
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.section>

              {/* Reset Button */}
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.35 }}
                className="w-full flex justify-center pt-4 pb-8"
              >
                <Button
                  onClick={reset}
                  variant="outline"
                  size="lg"
                  className={cn(
                    "group",
                    "border-border hover:border-foreground/20",
                    "hover:bg-muted/50",
                    "transition-all duration-300"
                  )}
                >
                  <HugeiconsIcon
                    icon={RotateLeft01Icon}
                    className={cn(
                      "w-4 h-4 mr-2 text-muted-foreground",
                      "group-hover:text-foreground",
                      "transition-all duration-500"
                    )}
                  />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                    Analyze Another Repository
                  </span>
                </Button>
              </motion.section>
            </motion.div>
          )}

          {/* Idle State */}
          {isIdle && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <About />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
