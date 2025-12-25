"use client";

import { useState, useMemo, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, FolderOpen, ChevronRight } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";
import { FileNode } from "@/lib/types";
import { TreeNodeProps } from "./types";
import { DEFAULT_EXPAND_LEVEL } from "./constants";
import { nodeMatchesSearch, nameMatchesSearch } from "./utils";
import { FileIcon } from "./file-icon";

export const TreeNode = memo(function TreeNode({
  node,
  level,
  searchQuery,
  defaultExpandLevel = DEFAULT_EXPAND_LEVEL,
}: TreeNodeProps) {
  // FIXED: Changed from `level < 1` to `level < defaultExpandLevel`
  // This allows folders to be expanded up to the specified level
  const [isOpen, setIsOpen] = useState(level < defaultExpandLevel);

  const matchesSearch = useMemo(
    () => nameMatchesSearch(node.name, searchQuery),
    [node.name, searchQuery]
  );

  const hasMatchingChildren = useMemo(() => {
    if (!searchQuery) return true;
    return nodeMatchesSearch(node, searchQuery);
  }, [node, searchQuery]);

  // When searching, auto-expand if there are matching children
  const shouldBeOpen = useMemo(() => {
    if (searchQuery && hasMatchingChildren) return true;
    return isOpen;
  }, [searchQuery, hasMatchingChildren, isOpen]);

  const handleToggle = useCallback(() => {
    if (!searchQuery) {
      setIsOpen((prev) => !prev);
    }
  }, [searchQuery]);

  // Hide nodes that don't match search
  if (searchQuery && !hasMatchingChildren) return null;

  const indent = level * 14 + 8;

  // --- Directory Node ---
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
          {node.children && node.children.length > 0 && (
            <span className="ml-auto text-[10px] text-muted-foreground/40 tabular-nums">
              {node.children.length}
            </span>
          )}
        </button>

        {/* Children */}
        <AnimatePresence initial={false}>
          {shouldBeOpen && node.children && node.children.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="overflow-hidden relative"
            >
              {/* Indent Guide Line */}
              <div
                className="absolute top-0 bottom-2 w-px bg-border/50"
                style={{ left: `${indent + 7}px` }}
                aria-hidden="true"
              />

              <div className="relative">
                {node.children.map((child) => (
                  <TreeNode
                    key={child.path}
                    node={child}
                    level={level + 1}
                    searchQuery={searchQuery}
                    defaultExpandLevel={defaultExpandLevel}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // --- File Node ---
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
      <FileIcon filename={node.name} />

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