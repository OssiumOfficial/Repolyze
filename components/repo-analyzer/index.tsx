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
import {
  AlertCircle,
  RotateCcw,
  GitBranch,
  Workflow,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import About from "../about";

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
    isLoading,
    isComplete,
    hasError,
    isIdle,
  } = useAnalysis();

  return (
    <div className="w-full">
      {/* All content in stacked rows */}
      <div className="space-y-6 sm:space-y-8 lg:space-y-10">
        {/* Row 1: URL Input */}
        <section className="w-full">
          <UrlInput onAnalyze={analyze} isLoading={isLoading} />
        </section>

        <AnimatePresence mode="wait">
          {/* Error State */}
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
                      <AlertCircle className="w-7 h-7 text-destructive" />
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
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          )}

          {/* Loading State */}
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

          {/* Results - Each section in its own row */}
          {isComplete && result?.metadata && (
            <motion.div
              key="results"
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.3 }}
              className="space-y-6 sm:space-y-8 lg:space-y-10"
            >
              {/* Row 2: Analysis Header */}
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

              {/* Row 3: File Tree (Full Width Row) */}
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

              {/* Row 4: Score Card + AI Insights (Side by Side) */}
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

              {/* Row 5: Architecture Diagram (Full Width Row) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="w-full"
              >
                <SectionHeader title="Architecture" icon={GitBranch} />
                <div className="mt-4">
                  {result.architecture && result.architecture.length > 0 ? (
                    <ArchitectureDiagram components={result.architecture} />
                  ) : (
                    <EmptyState
                      icon={GitBranch}
                      title="No Architecture Data"
                      description="Architecture visualization is not available for this repository."
                    />
                  )}
                </div>
              </motion.section>

              {/* Row 6: Data Flow Diagram (Full Width Row) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
                className="w-full"
              >
                <SectionHeader title="Data Flow" icon={Workflow} />
                <div className="mt-4">
                  {result.dataFlow?.nodes &&
                  result.dataFlow.nodes.length > 0 ? (
                    <DataFlowDiagram
                      nodes={result.dataFlow.nodes}
                      edges={result.dataFlow.edges || []}
                    />
                  ) : (
                    <EmptyState
                      icon={Workflow}
                      title="No Data Flow Information"
                      description="Data flow visualization is not available for this repository."
                    />
                  )}
                </div>
              </motion.section>

              {/* Row 7: Refactors & Automations (Tabbed) */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="w-full"
              >
                <SectionHeader title="Recommendations" />

                <div className="mt-4">
                  <Tabs defaultValue="refactors" className="w-full">
                    {/* Tab Navigation */}
                    <ScrollArea className="w-full pb-1">
                      <TabsList
                        className={cn("inline-flex h-10 sm:h-11 p-1 gap-1")}
                      >
                        <TabTriggerItem
                          value="refactors"
                          icon={Wrench}
                          label="Refactors"
                          count={result.refactors?.length}
                        />
                        <TabTriggerItem
                          value="automations"
                          icon={Zap}
                          label="Automations"
                          count={result.automations?.length}
                        />
                      </TabsList>
                      <ScrollBar
                        orientation="horizontal"
                        className="invisible"
                      />
                    </ScrollArea>

                    {/* Tab Content */}
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
                            icon={Wrench}
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
                            icon={Zap}
                            title="No Automation Suggestions"
                            description="No automation opportunities were identified."
                          />
                        )}
                      </motion.div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.section>

              {/* Row 8: Reset Button */}
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
                  <RotateCcw
                    className={cn(
                      "w-4 h-4 mr-2 text-muted-foreground",
                      "group-hover:text-foreground",
                      "group-hover:-rotate-180",
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

          {/* Idle State - Feature Cards */}
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