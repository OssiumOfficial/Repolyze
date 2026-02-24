"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Bug,
  Lightbulb,
  FileText,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Tag,
  Filter,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Issue types derived from analysis
export interface SuggestedIssue {
  id: string;
  type: "bug" | "feature" | "documentation" | "improvement";
  title: string;
  description: string;
  body: string;
  labels: string[];
  priority: "low" | "medium" | "high" | "critical";
  source: "automation" | "refactor" | "insight" | "custom";
  estimatedEffort?: string;
  affectedFiles?: string[];
}

interface IssuesPanelProps {
  repoFullName: string;
  suggestedIssues?: SuggestedIssue[];
  onIssueCreated?: (issue: SuggestedIssue) => void;
}

const typeConfig = {
  bug: {
    icon: Bug,
    color: "text-red-500 bg-red-500/10 border-red-500/20",
    label: "Bug",
    defaultLabels: ["bug"],
  },
  feature: {
    icon: Lightbulb,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    label: "Feature",
    defaultLabels: ["enhancement"],
  },
  documentation: {
    icon: FileText,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    label: "Docs",
    defaultLabels: ["documentation"],
  },
  improvement: {
    icon: Sparkles,
    color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    label: "Improvement",
    defaultLabels: ["enhancement"],
  },
};

const priorityConfig = {
  critical: {
    color: "bg-red-600/10 text-red-600 border-red-600/20",
    label: "Critical",
  },
  high: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "High",
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

function IssueItem({
  issue,
  index,
  repoFullName,
}: {
  issue: SuggestedIssue;
  index: number;
  repoFullName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const config = typeConfig[issue.type] || typeConfig.improvement;
  const Icon = config.icon;

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(issue.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getGitHubUrl = () => {
    const params = new URLSearchParams({
      title: issue.title,
      body: issue.body,
    });
    if (issue.labels?.length) {
      params.set("labels", issue.labels.join(","));
    }
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
          "rounded-xl border transition-all duration-200 overflow-hidden bg-background",
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
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
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
                    priorityConfig[issue.priority]?.color,
                  )}
                >
                  {priorityConfig[issue.priority]?.label}
                </Badge>

                {issue.source !== "custom" && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] h-5 px-1.5 font-normal capitalize hidden sm:inline-flex"
                  >
                    {issue.source}
                  </Badge>
                )}
              </div>

              <h4 className="font-medium text-sm line-clamp-1 pr-4">
                {issue.title}
              </h4>

              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {issue.description}
              </p>

              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {issue.estimatedEffort && (
                  <span className="text-[10px] text-muted-foreground">
                    ⏱ {issue.estimatedEffort}
                  </span>
                )}
                {issue.affectedFiles && issue.affectedFiles.length > 0 && (
                  <span className="text-[10px] text-muted-foreground">
                    📁 {issue.affectedFiles.length} file
                    {issue.affectedFiles.length !== 1 ? "s" : ""}
                  </span>
                )}
                {issue.labels.slice(0, 2).map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="text-[10px] h-4 px-1 font-normal bg-muted"
                  >
                    {label}
                  </Badge>
                ))}
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
                {issue.affectedFiles && issue.affectedFiles.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Related Files
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.affectedFiles.map((file) => (
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

                {/* Issue Body Preview */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">
                    Issue Body
                  </h5>
                  <div className="relative rounded-lg bg-muted/50 border overflow-hidden">
                    <ScrollArea className="h-50 sm:h-62.5">
                      <pre className="p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word leading-relaxed">
                        {issue.body}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>

                {/* All Labels */}
                {issue.labels.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Labels
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {issue.labels.map((label) => (
                        <Badge
                          key={label}
                          variant="outline"
                          className="text-xs"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs font-normal"
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
                        Copy Body
                      </>
                    )}
                  </Button>

                  <Button size="sm" className="text-xs font-normal" asChild>
                    <Link
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Create on GitHub
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function CreateIssueDialog({
  repoFullName,
  onIssueCreated,
}: {
  repoFullName: string;
  onIssueCreated?: (issue: SuggestedIssue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<SuggestedIssue["type"]>("improvement");
  const [priority, setPriority] =
    useState<SuggestedIssue["priority"]>("medium");
  const [labels, setLabels] = useState("");

  const handleCreate = () => {
    const config = typeConfig[type];
    const allLabels = [
      ...config.defaultLabels,
      ...labels
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
    ];

    const body = `## Description
${description}

---
*Created via Repolyze*`;

    const issue: SuggestedIssue = {
      id: `custom-${Date.now()}`,
      type,
      title,
      description: description.slice(0, 200),
      body,
      labels: allLabels,
      priority,
      source: "custom",
    };

    // Open GitHub directly
    const params = new URLSearchParams({
      title,
      body,
      labels: allLabels.join(","),
    });
    window.open(
      `https://github.com/${repoFullName}/issues/new?${params}`,
      "_blank",
    );

    onIssueCreated?.(issue);
    setOpen(false);
    setTitle("");
    setDescription("");
    setLabels("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span>Create Issue</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-primary" />
            Create New Issue
          </DialogTitle>
          <DialogDescription>
            Create a new issue for {repoFullName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className="font-normal text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id="title"
              placeholder="Brief summary of the issue"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="space-y-2">
              <Label className="font-normal text-muted-foreground">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as SuggestedIssue["type"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="bug">🐛 Bug</SelectItem>
                  <SelectItem value="feature">💡 Feature</SelectItem>
                  <SelectItem value="improvement">✨ Improvement</SelectItem>
                  <SelectItem value="documentation">
                    📝 Documentation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-normal text-muted-foreground">
                Priority
              </Label>
              <Select
                value={priority}
                onValueChange={(v) =>
                  setPriority(v as SuggestedIssue["priority"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="critical">🔴 Critical</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="font-normal text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Detailed description of the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="labels"
              className="font-normal text-muted-foreground"
            >
              Labels (comma separated)
            </Label>
            <Input
              id="labels"
              placeholder="e.g., help-wanted, good-first-issue"
              value={labels}
              onChange={(e) => setLabels(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Create on GitHub
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IssuesPanel({
  repoFullName,
  suggestedIssues = [],
  onIssueCreated,
}: IssuesPanelProps) {
  const [filter, setFilter] = useState<"all" | SuggestedIssue["type"]>("all");
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | SuggestedIssue["priority"]
  >("all");

  const filteredIssues = useMemo(() => {
    return suggestedIssues.filter((issue) => {
      if (filter !== "all" && issue.type !== filter) return false;
      if (priorityFilter !== "all" && issue.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [suggestedIssues, filter, priorityFilter]);

  const counts = {
    bugs: suggestedIssues.filter((i) => i.type === "bug").length,
    features: suggestedIssues.filter((i) => i.type === "feature").length,
    docs: suggestedIssues.filter((i) => i.type === "documentation").length,
    improvements: suggestedIssues.filter((i) => i.type === "improvement")
      .length,
  };

  const highPriorityCount = suggestedIssues.filter(
    (i) => i.priority === "high" || i.priority === "critical",
  ).length;

  return (
    <Card className="h-full flex flex-col bg-background">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <AlertCircle className="w-5 h-5 text-primary" />
              Issues
              {highPriorityCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 ml-1">
                  {highPriorityCount} High Priority
                </Badge>
              )}
            </CardTitle>

            <CreateIssueDialog
              repoFullName={repoFullName}
              onIssueCreated={onIssueCreated}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5">
              <Select
                value={filter}
                onValueChange={(v) =>
                  setFilter(v as "all" | SuggestedIssue["type"])
                }
              >
                <SelectTrigger className="h-7 text-xs w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="bug">🐛 Bugs ({counts.bugs})</SelectItem>
                  <SelectItem value="feature">
                    💡 Features ({counts.features})
                  </SelectItem>
                  <SelectItem value="improvement">
                    ✨ Improvements ({counts.improvements})
                  </SelectItem>
                  <SelectItem value="documentation">
                    📝 Docs ({counts.docs})
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={priorityFilter}
                onValueChange={(v) =>
                  setPriorityFilter(v as "all" | SuggestedIssue["priority"])
                }
              >
                <SelectTrigger className="h-7 text-xs w-25">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-1.5 ml-auto">
              {counts.bugs > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal bg-red-500/10 text-red-600 border-red-500/20"
                >
                  {counts.bugs} Bug{counts.bugs !== 1 ? "s" : ""}
                </Badge>
              )}
              {counts.features > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] h-5 px-1.5 font-normal bg-blue-500/10 text-blue-600 border-blue-500/20"
                >
                  {counts.features} Feature{counts.features !== 1 ? "s" : ""}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4 sm:px-6 pb-4">
          <div className="space-y-3 pt-1">
            {filteredIssues.map((issue, index) => (
              <IssueItem
                key={issue.id}
                issue={issue}
                index={index}
                repoFullName={repoFullName}
              />
            ))}

            {filteredIssues.length === 0 && suggestedIssues.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Filter className="w-8 h-8 opacity-40 mb-3" />
                <p className="font-medium text-sm">No matching issues</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </motion.div>
            )}

            {suggestedIssues.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 opacity-40" />
                </div>
                <p className="font-medium">No suggested issues</p>
                <p className="text-sm mt-1 max-w-62.5 text-center opacity-80">
                  Create a new issue to track work for this repository
                </p>
                <div className="mt-4">
                  <CreateIssueDialog
                    repoFullName={repoFullName}
                    onIssueCreated={onIssueCreated}
                  />
                </div>
              </motion.div>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
