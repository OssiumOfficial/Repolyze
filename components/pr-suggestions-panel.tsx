// components/pr-suggestions-panel.tsx
"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitPullRequest,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  FileCode,
  Clock,
  Tag,
  Filter,
  Plus,
  Eye,
  Code2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface PRFileChange {
  path: string;
  action: "create" | "modify" | "delete";
  content?: string;
  description: string;
}

export interface PRSuggestion {
  id: string;
  title: string;
  description: string;
  body: string;
  branch: string;
  baseBranch: string;
  labels: string[];
  priority: "low" | "medium" | "high";
  category: string;
  estimatedEffort: string;
  files: PRFileChange[];
}

interface PRSuggestionsPanelProps {
  suggestions: PRSuggestion[];
  repoFullName: string;
}

const priorityConfig = {
  high: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    label: "High Priority",
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

const actionConfig = {
  create: {
    color: "text-green-500 bg-green-500/10",
    label: "Create",
  },
  modify: {
    color: "text-yellow-500 bg-yellow-500/10",
    label: "Modify",
  },
  delete: {
    color: "text-red-500 bg-red-500/10",
    label: "Delete",
  },
};

function FileChangePreview({ file }: { file: PRFileChange }) {
  const [copied, setCopied] = useState(false);
  const config = actionConfig[file.action];

  const handleCopy = async () => {
    if (file.content) {
      await navigator.clipboard.writeText(file.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn("text-[10px] h-5", config.color)}
          >
            {config.label}
          </Badge>
          <code className="text-xs font-mono">{file.path}</code>
        </div>
        {file.content && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 mr-1 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        )}
      </div>
      <p className="px-3 py-2 text-xs text-muted-foreground border-b">
        {file.description}
      </p>
      {file.content && (
        <ScrollArea className="h-50">
          <pre className="p-3 text-xs font-mono whitespace-pre-wrap wrap-break-word bg-muted/30">
            {file.content}
          </pre>
        </ScrollArea>
      )}
    </div>
  );
}

function PRPreviewDialog({
  pr,
  repoFullName,
}: {
  pr: PRSuggestion;
  repoFullName: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyBody = async () => {
    await navigator.clipboard.writeText(pr.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs h-8">
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <GitPullRequest className="w-5 h-5 text-primary" />
            {pr.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="gap-1">
              <GitBranch className="w-3 h-3" />
              {pr.branch}
            </Badge>
            <span className="text-muted-foreground">→</span>
            <Badge variant="secondary">{pr.baseBranch}</Badge>
            <Badge
              variant="outline"
              className={cn("ml-2", priorityConfig[pr.priority].color)}
            >
              {priorityConfig[pr.priority].label}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="description"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="description" className="gap-1.5">
              <FileCode className="w-4 h-4" />
              Description
            </TabsTrigger>
            <TabsTrigger value="files" className="gap-1.5">
              <Code2 className="w-4 h-4" />
              Files ({pr.files.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="description"
            className="flex-1 overflow-hidden mt-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">PR Description</h4>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={handleCopyBody}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 mr-1 text-green-500" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <ScrollArea className="h-100 border rounded-lg">
              <div className="p-4">
                <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono">
                  {pr.body}
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-112.5">
              <div className="space-y-4 pr-4">
                {pr.files.map((file, index) => (
                  <FileChangePreview key={index} file={file} />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
          <Button variant="outline" onClick={handleCopyBody}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Description
          </Button>
          <Button asChild>
            <Link
              href={`https://github.com/${repoFullName}/compare/${pr.baseBranch}...${pr.branch}?expand=1&title=${encodeURIComponent(pr.title)}&body=${encodeURIComponent(pr.body)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open on GitHub
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PRSuggestionItem({
  pr,
  index,
  repoFullName,
}: {
  pr: PRSuggestion;
  index: number;
  repoFullName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  const handleCopyFile = async (file: PRFileChange) => {
    if (file.content) {
      await navigator.clipboard.writeText(file.content);
      setCopiedFile(file.path);
      setTimeout(() => setCopiedFile(null), 2000);
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
          "rounded-xl border transition-all duration-200 overflow-hidden bg-background",
          isOpen && "border-primary/30 shadow-sm",
        )}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full p-3 sm:p-4 text-left hover:bg-accent/30 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 shrink-0 hidden sm:flex">
              <GitPullRequest className="w-4 h-4 text-purple-500" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <div className="p-1.5 rounded-md bg-purple-500/10 sm:hidden">
                  <GitPullRequest className="w-3 h-3 text-purple-500" />
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 px-1.5 font-normal capitalize",
                    priorityConfig[pr.priority].color,
                  )}
                >
                  {pr.priority}
                </Badge>
                <Badge
                  variant="secondary"
                  className="text-[10px] h-5 px-1.5 font-normal"
                >
                  {pr.category}
                </Badge>
              </div>

              <h4 className="font-medium text-sm line-clamp-1 pr-4">
                {pr.title}
              </h4>

              <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                {pr.description}
              </p>

              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GitBranch className="w-3 h-3" />
                  <code className="text-[10px] font-mono">{pr.branch}</code>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{pr.estimatedEffort}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileCode className="w-3 h-3" />
                  <span className="text-[10px]">
                    {pr.files.length} file{pr.files.length !== 1 ? "s" : ""}
                  </span>
                </div>
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
                {/* Branch Info */}
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <GitBranch className="w-4 h-4 text-muted-foreground" />
                  <code className="text-xs font-mono">{pr.branch}</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-xs font-mono">{pr.baseBranch}</code>
                </div>

                {/* Labels */}
                {pr.labels.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-muted-foreground mb-2">
                      Labels
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {pr.labels.map((label) => (
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

                {/* Files Changed */}
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">
                    Files to Change
                  </h5>
                  <div className="space-y-2">
                    {pr.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-muted/30 rounded-lg"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] h-5 shrink-0",
                              actionConfig[file.action].color,
                            )}
                          >
                            {actionConfig[file.action].label}
                          </Badge>
                          <code className="text-xs font-mono truncate">
                            {file.path}
                          </code>
                        </div>
                        {file.content && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] shrink-0"
                            onClick={() => handleCopyFile(file)}
                          >
                            {copiedFile === file.path ? (
                              <Check className="w-3 h-3 text-green-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                  <PRPreviewDialog pr={pr} repoFullName={repoFullName} />

                  <Button
                    size="sm"
                    className="text-xs h-8 flex-1 sm:flex-none"
                    asChild
                  >
                    <Link
                      href={`https://github.com/${repoFullName}/compare/${pr.baseBranch}...${pr.branch}?expand=1&title=${encodeURIComponent(pr.title)}&body=${encodeURIComponent(pr.body)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Create PR on GitHub
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

export function PRSuggestionsPanel({
  suggestions = [],
  repoFullName,
}: PRSuggestionsPanelProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const categories = useMemo(() => {
    const cats = new Set(suggestions.map((s) => s.category));
    return Array.from(cats);
  }, [suggestions]);

  const filteredSuggestions = useMemo(() => {
    return suggestions.filter((pr) => {
      if (categoryFilter !== "all" && pr.category !== categoryFilter)
        return false;
      if (priorityFilter !== "all" && pr.priority !== priorityFilter)
        return false;
      return true;
    });
  }, [suggestions, categoryFilter, priorityFilter]);

  const highPriorityCount = suggestions.filter(
    (s) => s.priority === "high",
  ).length;
  const totalFiles = suggestions.reduce((acc, s) => acc + s.files.length, 0);

  return (
    <Card className="h-full flex flex-col bg-background">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <GitPullRequest className="w-5 h-5 text-purple-500" />
              Pull Request Suggestions
              {highPriorityCount > 0 && (
                <Badge variant="destructive" className="text-[10px] h-5 ml-1">
                  {highPriorityCount} High Priority
                </Badge>
              )}
            </CardTitle>
          </div>

          {/* Filters & Stats */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-7 text-xs w-30">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-7 text-xs w-25">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-1.5 ml-auto">
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal bg-purple-500/10 text-purple-600 border-purple-500/20"
              >
                {suggestions.length} PR{suggestions.length !== 1 ? "s" : ""}
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] h-5 px-1.5 font-normal"
              >
                {totalFiles} file{totalFiles !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-0">
        <ScrollArea className="h-full px-4 sm:px-6 pb-4">
          <div className="space-y-3 pt-1">
            {filteredSuggestions.map((pr, index) => (
              <PRSuggestionItem
                key={pr.id}
                pr={pr}
                index={index}
                repoFullName={repoFullName}
              />
            ))}

            {filteredSuggestions.length === 0 && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-muted-foreground"
              >
                <Filter className="w-8 h-8 opacity-40 mb-3" />
                <p className="font-medium text-sm">No matching PRs</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </motion.div>
            )}

            {suggestions.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <GitPullRequest className="w-6 h-6 opacity-40" />
                </div>
                <p className="font-medium">No PR suggestions</p>
                <p className="text-sm mt-1 max-w-62.5 text-center opacity-80">
                  The repository is well-configured!
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
