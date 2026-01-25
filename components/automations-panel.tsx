// components/automations-panel.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  GitPullRequest,
  AlertCircle,
  Workflow,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Clock,
  FileCode,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Automation } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AutomationsPanelProps {
  automations: Automation[];
  repoFullName?: string;
}

const typeConfig = {
  issue: {
    icon: AlertCircle,
    color: "text-green-500 bg-green-500/10 border-green-500/20",
    label: "Issue",
    githubAction: "issues/new",
  },
  "pull-request": {
    icon: GitPullRequest,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    label: "Pull Request",
    githubAction: null,
  },
  workflow: {
    icon: Workflow,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    label: "Workflow",
    githubAction: null,
  },
};

const priorityColors = {
  high: "bg-red-500/10 text-red-500 border-red-500/20",
  medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  low: "bg-green-500/10 text-green-500 border-green-500/20",
};

function AutomationItem({
  automation,
  index,
  repoFullName,
}: {
  automation: Automation;
  index: number;
  repoFullName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = typeConfig[automation.type] || typeConfig.issue;
  const Icon = config.icon;

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(automation.body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGitHubUrl = () => {
    if (!repoFullName) return null;

    if (automation.type === "issue") {
      const params = new URLSearchParams({
        title: automation.title || "",
        body: automation.body || "",
      });
      if (automation.labels?.length) {
        params.set("labels", automation.labels.join(","));
      }
      return `https://github.com/${repoFullName}/issues/new?${params}`;
    }

    return null;
  };

  const githubUrl = getGitHubUrl();

  // Extract estimated effort if available
  const estimatedEffort = (automation as { estimatedEffort?: string })
    .estimatedEffort;
  const category = (automation as { category?: string }).category;
  const files = (automation as { files?: string[] }).files;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div
        className={cn(
          "rounded-xl border transition-all duration-200 overflow-hidden",
          isOpen && "border-primary/30 shadow-sm",
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 sm:p-4 text-left hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "p-2 rounded-lg shrink-0 border hidden sm:flex",
                config.color,
              )}
            >
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <div
                  className={cn(
                    "p-1.5 rounded-md shrink-0 border sm:hidden",
                    config.color,
                  )}
                >
                  <Icon className="w-3 h-3" />
                </div>

                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-1.5 font-normal",
                    config.color,
                  )}
                >
                  {config.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-1.5 font-normal capitalize",
                    priorityColors[automation.priority || "medium"],
                  )}
                >
                  {automation.priority || "medium"}
                </Badge>
                {category && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 font-normal hidden sm:inline-flex"
                  >
                    {category}
                  </Badge>
                )}
              </div>

              <h4 className="font-medium text-sm mt-1.5 line-clamp-1 pr-4">
                {automation.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {automation.description}
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {estimatedEffort && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">{estimatedEffort}</span>
                  </div>
                )}
                {files && files.length > 0 && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FileCode className="w-3 h-3" />
                    <span className="text-[10px]">
                      {files.length} file{files.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
                {automation.labels && automation.labels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {automation.labels.slice(0, 2).map((label) => (
                      <Badge
                        key={label}
                        variant="secondary"
                        className="text-[10px] h-4 px-1 font-normal bg-muted"
                      >
                        {label}
                      </Badge>
                    ))}
                    {automation.labels.length > 2 && (
                      <span className="text-[10px] text-muted-foreground self-center">
                        +{automation.labels.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 mt-1"
            >
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
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
              <div className="px-3 sm:px-4 pb-4 space-y-4 border-t pt-4">
                {/* Affected Files */}
                {files && files.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Files to Create/Modify
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {files.map((file) => (
                        <code
                          key={file}
                          className="text-[10px] sm:text-xs bg-muted px-2 py-1 rounded-md font-mono"
                        >
                          {file}
                        </code>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-muted-foreground">
                      {automation.type === "workflow"
                        ? "Workflow Configuration"
                        : automation.type === "pull-request"
                          ? "PR Description"
                          : "Issue Body"}
                    </h5>
                  </div>
                  <div className="relative rounded-lg bg-muted/50 border overflow-hidden">
                    <ScrollArea className="h-55 sm:h-62.5">
                      <pre className="p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {automation.body || "No content available"}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-9 flex-1 sm:flex-none"
                    onClick={() => handleCopy()}
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Content
                      </>
                    )}
                  </Button>

                  {githubUrl && (
                    <Button
                      size="sm"
                      className="text-xs h-9 flex-1 sm:flex-none"
                      asChild
                    >
                      <Link
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Create Issue on GitHub
                      </Link>
                    </Button>
                  )}

                  {automation.type === "workflow" && repoFullName && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-9 flex-1 sm:flex-none"
                      asChild
                    >
                      <Link
                        href={`https://github.com/${repoFullName}/new/main?filename=.github/workflows/ci.yml`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Create Workflow File
                      </Link>
                    </Button>
                  )}

                  {automation.type === "pull-request" && repoFullName && (
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs h-9 flex-1 sm:flex-none"
                      asChild
                    >
                      <Link
                        href={`https://github.com/${repoFullName}/compare`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GitPullRequest className="w-3.5 h-3.5 mr-1.5" />
                        Open Compare View
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function AutomationsPanel({
  automations = [],
  repoFullName,
}: AutomationsPanelProps) {
  const safeAutomations = Array.isArray(automations) ? automations : [];

  const counts = {
    issues: safeAutomations.filter((a) => a.type === "issue").length,
    prs: safeAutomations.filter((a) => a.type === "pull-request").length,
    workflows: safeAutomations.filter((a) => a.type === "workflow").length,
  };

  const highPriorityCount = safeAutomations.filter(
    (a) => a.priority === "high",
  ).length;

  return (
    <Card className="h-full flex flex-col bg-background">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Automations
            {highPriorityCount > 0 && (
              <Badge variant="destructive" className="text-[10px] h-5 ml-1">
                {highPriorityCount} High Priority
              </Badge>
            )}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {counts.issues > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal bg-green-500/10 text-green-600 border-green-500/20"
              >
                {counts.issues} Issue{counts.issues !== 1 ? "s" : ""}
              </Badge>
            )}
            {counts.prs > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal bg-purple-500/10 text-purple-600 border-purple-500/20"
              >
                {counts.prs} PR{counts.prs !== 1 ? "s" : ""}
              </Badge>
            )}
            {counts.workflows > 0 && (
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal bg-blue-500/10 text-blue-600 border-blue-500/20"
              >
                {counts.workflows} Workflow{counts.workflows !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4 sm:px-6 pb-4">
          <div className="space-y-3 pt-1">
            {safeAutomations.map((automation, index) => (
              <AutomationItem
                key={automation.id || index}
                automation={automation}
                index={index}
                repoFullName={repoFullName}
              />
            ))}

            {safeAutomations.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 opacity-40" />
                </div>
                <p className="font-medium">No automation suggestions</p>
                <p className="text-sm mt-1 max-w-62.5 text-center opacity-80">
                  The repository seems to be well-automated!
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
