"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

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
                        className={cn(
                          "inline-flex h-10 sm:h-11 p-1 gap-1",
                          "bg-muted/50 rounded-lg"
                        )}
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
              Features
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Section Header Component
function SectionHeader({
  title,
  icon: Icon,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <div className="p-1.5 rounded-md bg-primary/10">
          <Icon className="w-4 h-4 text-primary" />
        </div>
      )}
      <h2 className="text-base sm:text-lg font-semibold text-foreground">
        {title}
      </h2>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// Tab Trigger Item Component
function TabTriggerItem({
  value,
  icon: Icon,
  label,
  count,
}: {
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md",
        "text-sm font-medium",
        "data-[state=active]:bg-background",
        "data-[state=active]:text-foreground",
        "data-[state=active]:shadow-sm",
        "text-muted-foreground",
        "transition-all duration-200"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.slice(0, 3)}</span>
      {count !== undefined && count > 0 && (
        <span
          className={cn(
            "ml-1 px-1.5 py-0.5 text-xs rounded-full",
            "bg-primary/10 text-primary"
          )}
        >
          {count}
        </span>
      )}
    </TabsTrigger>
  );
}

// Empty State Component
function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <div
            className={cn(
              "w-14 h-14 rounded-xl mb-5",
              "bg-muted border border-border/50",
              "flex items-center justify-center"
            )}
          >
            <Icon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
