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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Automation } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AutomationsPanelProps {
  automations: Automation[];
  repoFullName?: string;
}

const typeConfig = {
  issue: {
    icon: AlertCircle,
    color: "text-green-500 bg-green-500/10 border-green-500/20",
    label: "Issue",
  },
  "pull-request": {
    icon: GitPullRequest,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    label: "Pull Request",
  },
  workflow: {
    icon: Workflow,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    label: "Workflow",
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

  // Safe access with fallback
  const config = typeConfig[automation.type] || typeConfig.issue;
  const Icon = config.icon;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(automation.body || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGitHubUrl = () => {
    if (!repoFullName || automation.type !== "issue") return null;
    const params = new URLSearchParams({
      title: automation.title || "",
      body: automation.body || "",
      labels: (automation.labels || []).join(","),
    });
    return `https://github.com/${repoFullName}/issues/new?${params}`;
  };

  const githubUrl = getGitHubUrl();

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
          <div className="flex items-start gap-3">
            <div className={cn("p-2 rounded-lg shrink-0 border hidden sm:flex", config.color)}>
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                 {/* Mobile Icon (visible only on small screens) */}
                <div className={cn("p-1.5 rounded-md shrink-0 border sm:hidden", config.color)}>
                   <Icon className="w-3 h-3" />
                </div>

                <Badge
                  variant="outline"
                  className={cn("text-[10px] h-5 px-1.5 font-normal", config.color)}
                >
                  {config.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-1.5 font-normal capitalize",
                    priorityColors[automation.priority || "medium"]
                  )}
                >
                  {automation.priority || "medium"}
                </Badge>
              </div>

              <h4 className="font-medium text-sm mt-1.5 line-clamp-1 pr-4">
                {automation.title}
              </h4>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {automation.description}
              </p>

              {automation.labels && automation.labels.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {automation.labels.slice(0, 3).map((label) => (
                    <Badge key={label} variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-muted">
                      {label}
                    </Badge>
                  ))}
                  {automation.labels.length > 3 && (
                     <span className="text-[10px] text-muted-foreground self-center">+{automation.labels.length - 3}</span>
                  )}
                </div>
              )}
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
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-xs font-medium text-muted-foreground">
                      Suggested Content
                    </h5>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopy}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <ScrollArea className="max-h-60 w-full">
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                        {automation.body || "No content available"}
                      </pre>
                    </div>
                  </ScrollArea>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 w-full sm:w-auto"
                    onClick={handleCopy}
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    Copy Content
                  </Button>
                  {githubUrl && (
                    <Button size="sm" className="text-xs h-8 w-full sm:w-auto" asChild>
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                        Open in GitHub
                      </a>
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
  // Ensure automations is always an array
  const safeAutomations = Array.isArray(automations) ? automations : [];

  const counts = {
    issues: safeAutomations.filter((a) => a.type === "issue").length,
    prs: safeAutomations.filter((a) => a.type === "pull-request").length,
    workflows: safeAutomations.filter((a) => a.type === "workflow").length,
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Zap className="w-5 h-5 text-primary" />
            Automations
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
      
      <CardContent className="flex-1 min-h-0 p-0 sm:p-0">
        <ScrollArea className="px-4 sm:px-6 pb-4">
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
                <p className="text-sm mt-1 max-w-50 text-center opacity-80">
                  The repository seems to be well-automated!
                </p>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}