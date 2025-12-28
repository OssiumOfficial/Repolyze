"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn, formatBytes } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Cancel01Icon,
  FolderLibraryIcon,
} from "@hugeicons/core-free-icons";

import { FileTreeProps } from "./types";
import { DEFAULT_EXPAND_LEVEL } from "./constants";
import { calculateTotalSize } from "./utils";
import { TreeNode } from "./tree-node";
import { EmptyState } from "./empty-state";
import { LanguageTags } from "./language-tags";
import { FileNode } from "@/lib/types";

function nodeMatchesSearch(node: FileNode, query: string): boolean {
  const lowerQuery = query.toLowerCase();

  if (node.name.toLowerCase().includes(lowerQuery)) {
    return true;
  }

  if (node.children && node.children.length > 0) {
    return node.children.some((child) => nodeMatchesSearch(child, query));
  }

  return false;
}

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  if (!query.trim()) return nodes;

  return nodes
    .filter((node) => nodeMatchesSearch(node, query))
    .map((node) => {
      if (node.children && node.children.length > 0) {
        return {
          ...node,
          children: filterTree(node.children, query),
        };
      }
      return node;
    });
}

function countMatchingFiles(nodes: FileNode[], query: string): number {
  if (!query.trim()) return 0;

  let count = 0;
  const lowerQuery = query.toLowerCase();

  function countNodes(nodeList: FileNode[]) {
    for (const node of nodeList) {
      if (node.name.toLowerCase().includes(lowerQuery)) {
        count++;
      }
      if (node.children) {
        countNodes(node.children);
      }
    }
  }

  countNodes(nodes);
  return count;
}

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

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  const totalSize = useMemo(() => calculateTotalSize(tree), [tree]);

  // Filter tree based on search query
  const filteredTree = useMemo(() => {
    return filterTree(tree, searchQuery);
  }, [tree, searchQuery]);

  // Count matching files for display
  const matchCount = useMemo(() => {
    return countMatchingFiles(tree, searchQuery);
  }, [tree, searchQuery]);

  // Determine if we should show empty state
  const showEmptyState =
    tree.length === 0 || (searchQuery && filteredTree.length === 0);
  const isSearchEmpty = searchQuery && filteredTree.length === 0;

  return (
    <Card className="flex bg-background flex-col h-125 sm:h-140 lg:h-150 border-border/60 overflow-hidden py-0 gap-0">
      {/* Header */}
      <div className="shrink-0 p-4 border-b border-border/50 space-y-3 bg-muted/10">
        {/* Title Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <HugeiconsIcon
                icon={FolderLibraryIcon}
                className="w-4 h-4 text-primary"
              />
            </div>
            <h3 className="text-sm font-medium text-foreground">
              File Structure
            </h3>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {searchQuery && matchCount > 0 ? (
              <span className="text-primary">
                {matchCount} match{matchCount !== 1 ? "es" : ""}
              </span>
            ) : (
              <>
                <span className="hidden sm:inline">
                  {stats.totalFiles.toLocaleString()} files
                </span>
                <span className="hidden sm:inline">·</span>
                <span>{stats.totalDirectories.toLocaleString()} folders</span>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60"
          />
          <Input
            placeholder="Search files and folders..."
            value={searchQuery}
            onChange={handleSearchChange}
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
                  <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Tags */}
        <LanguageTags languages={topLanguages} />
      </div>

      {/* Tree Content */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            <AnimatePresence mode="wait">
              {showEmptyState ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmptyState
                    message={
                      isSearchEmpty ? "No matching files" : "No files found"
                    }
                    description={
                      isSearchEmpty
                        ? `No files match "${searchQuery}". Try a different keyword.`
                        : "This repository appears to be empty."
                    }
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="tree"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-px"
                >
                  {filteredTree.map((node) => (
                    <TreeNode
                      key={node.path}
                      node={node}
                      level={0}
                      searchQuery={searchQuery}
                      defaultExpandLevel={
                        searchQuery ? 10 : DEFAULT_EXPAND_LEVEL
                      }
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
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
