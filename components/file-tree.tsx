"use client";

import { useState, useMemo, memo, useCallback, JSX } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  Search,
  FileCode,
  FileJson,
  FileText,
  Image as ImageIcon,
  Settings,
  X,
  FolderTree,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { FileNode } from "@/lib/types";
import { cn, formatBytes } from "@/lib/utils";

// --- Types & Props ---

interface FileTreeProps {
  tree: FileNode[];
  stats: {
    totalFiles: number;
    totalDirectories: number;
    languages: Record<string, number>;
  };
}

// --- File Icon Helper ---

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const baseClass = "w-4 h-4 shrink-0";

  const iconMap: Record<string, JSX.Element> = {
    ts: <FileCode className={cn(baseClass, "text-primary")} />,
    tsx: <FileCode className={cn(baseClass, "text-primary")} />,
    js: <FileCode className={cn(baseClass, "text-primary/70")} />,
    jsx: <FileCode className={cn(baseClass, "text-primary/70")} />,
    json: <FileJson className={cn(baseClass, "text-muted-foreground")} />,
    css: <FileCode className={cn(baseClass, "text-primary/60")} />,
    scss: <FileCode className={cn(baseClass, "text-primary/60")} />,
    html: <FileCode className={cn(baseClass, "text-muted-foreground")} />,
    md: <FileText className={cn(baseClass, "text-muted-foreground")} />,
    mdx: <FileText className={cn(baseClass, "text-muted-foreground")} />,
    png: <ImageIcon className={cn(baseClass, "text-muted-foreground")} />,
    jpg: <ImageIcon className={cn(baseClass, "text-muted-foreground")} />,
    jpeg: <ImageIcon className={cn(baseClass, "text-muted-foreground")} />,
    svg: <ImageIcon className={cn(baseClass, "text-muted-foreground")} />,
    yaml: <Settings className={cn(baseClass, "text-muted-foreground/70")} />,
    yml: <Settings className={cn(baseClass, "text-muted-foreground/70")} />,
    lock: <File className={cn(baseClass, "text-muted-foreground/50")} />,
  };

  return iconMap[ext || ""] || <File className={cn(baseClass, "text-muted-foreground/60")} />;
}

// --- Tree Node Component ---

const TreeNode = memo(function TreeNode({
  node,
  level,
  searchQuery,
}: {
  node: FileNode;
  level: number;
  searchQuery: string;
}) {
  const [isOpen, setIsOpen] = useState(level < 1);

  const matchesSearch = useMemo(() => {
    if (!searchQuery) return false;
    return node.name.toLowerCase().includes(searchQuery.toLowerCase());
  }, [node.name, searchQuery]);

  const hasMatchingChildren = useMemo(() => {
    if (!searchQuery) return true;
    if (!node.children) return matchesSearch;

    const checkChildren = (children: FileNode[]): boolean =>
      children.some(
        (child) =>
          child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (child.children && checkChildren(child.children))
      );

    return matchesSearch || checkChildren(node.children);
  }, [node, searchQuery, matchesSearch]);

  const shouldBeOpen = searchQuery && hasMatchingChildren ? true : isOpen;

  const handleToggle = useCallback(() => {
    if (!searchQuery) setIsOpen((prev) => !prev);
  }, [searchQuery]);

  if (searchQuery && !hasMatchingChildren) return null;

  const indent = level * 14 + 8;

  // --- Directory ---
  if (node.type === "directory") {
    return (
      <div>
        <button
          onClick={handleToggle}
          className={cn(
            "flex items-center gap-2 w-full py-1.5 px-2 rounded-md",
            "text-sm transition-colors duration-150",
            "hover:bg-muted/60 active:bg-muted/80",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "group"
          )}
          style={{ paddingLeft: `${indent}px` }}
        >
          {/* Chevron */}
          <ChevronRight
            className={cn(
              "w-3.5 h-3.5 shrink-0 text-muted-foreground/50",
              "transition-transform duration-200",
              "group-hover:text-muted-foreground",
              shouldBeOpen && "rotate-90"
            )}
          />

          {/* Folder Icon */}
          {shouldBeOpen ? (
            <FolderOpen className="w-4 h-4 shrink-0 text-primary/80" />
          ) : (
            <Folder className="w-4 h-4 shrink-0 text-primary/60" />
          )}

          {/* Name */}
          <span
            className={cn(
              "truncate font-medium text-foreground/90",
              "group-hover:text-foreground",
              matchesSearch && "bg-primary/10 text-primary px-1 rounded"
            )}
          >
            {node.name}
          </span>

          {/* Child Count */}
          {node.children && (
            <span className="ml-auto text-[10px] text-muted-foreground/40 tabular-nums">
              {node.children.length}
            </span>
          )}
        </button>

        {/* Children */}
        <AnimatePresence initial={false}>
          {shouldBeOpen && node.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden relative"
            >
              {/* Indent Guide Line */}
              <div
                className="absolute top-0 bottom-2 w-px bg-border/50"
                style={{ left: `${indent + 7}px` }}
              />

              <div className="relative">
                {node.children.map((child) => (
                  <TreeNode
                    key={child.path}
                    node={child}
                    level={level + 1}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- File ---
  return (
    <div
      className={cn(
        "flex items-center gap-2 py-1.5 px-2 rounded-md",
        "text-sm transition-colors duration-150",
        "hover:bg-muted/40 cursor-default group",
        matchesSearch && "bg-primary/5"
      )}
      style={{ paddingLeft: `${indent + 18}px` }}
    >
      {getFileIcon(node.name)}

      <span
        className={cn(
          "truncate text-muted-foreground",
          "group-hover:text-foreground",
          matchesSearch && "bg-primary/10 text-primary px-1 rounded font-medium"
        )}
      >
        {node.name}
      </span>

      {node.size !== undefined && node.size > 0 && (
        <span className="ml-auto text-[10px] text-muted-foreground/40 tabular-nums hidden sm:block">
          {formatBytes(node.size)}
        </span>
      )}
    </div>
  );
});

// --- Main Component ---

export function FileTree({ tree, stats }: FileTreeProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const topLanguages = useMemo(
    () =>
      Object.entries(stats.languages)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5),
    [stats.languages]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const totalSize = useMemo(() => {
    const calculateSize = (nodes: FileNode[]): number =>
      nodes.reduce((acc, node) => {
        if (node.type === "directory" && node.children) {
          return acc + calculateSize(node.children);
        }
        return acc + (node.size || 0);
      }, 0);
    return calculateSize(tree);
  }, [tree]);

  return (
    <Card className="flex flex-col h-125 sm:h-140 lg:h-150 border-border/60 overflow-hidden py-0 gap-0">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border/50 space-y-3 bg-muted/20">
        {/* Title Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <FolderTree className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              File Structure
            </h3>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">
              {stats.totalFiles.toLocaleString()} files
            </span>
            <span className="hidden sm:inline">·</span>
            <span>{stats.totalDirectories.toLocaleString()} folders</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "pl-9 pr-9 h-9 text-sm",
              "bg-background border-border/60",
              "placeholder:text-muted-foreground/40",
              "focus-visible:ring-1 focus-visible:ring-ring"
            )}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.1 }}
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={clearSearch}
                >
                  <X className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Tags */}
        {topLanguages.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topLanguages.map(([lang, count]) => (
              <span
                key={lang}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md",
                  "text-[10px] font-medium",
                  "bg-muted/60 text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    "bg-primary/60"
                  )}
                />
                {lang}
                <span className="text-muted-foreground/60">{count}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            {tree.length > 0 ? (
              <div className="space-y-px">
                {tree.map((node) => (
                  <TreeNode
                    key={node.path}
                    node={node}
                    level={0}
                    searchQuery={searchQuery}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>

      {/* Footer */}
      <div
        className={cn(
          "shrink-0 px-4 py-2.5 border-t border-border/50",
          "bg-muted/30",
          "flex items-center justify-between",
          "text-xs text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-pulse" />
          <span>{stats.totalFiles.toLocaleString()} files indexed</span>
        </div>
        <span className="tabular-nums">{formatBytes(totalSize)}</span>
      </div>
    </Card>
  );
}

// --- Empty State ---

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
        <FolderOpen className="w-6 h-6 text-muted-foreground/40" />
      </div>
      <p className="text-sm text-muted-foreground">No files found</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        Try a different search term
      </p>
    </div>
  );
}
