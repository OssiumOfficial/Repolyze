import { FileNode } from "@/lib/types";
import { JSX } from "react";

export interface FileTreeProps {
  tree: FileNode[];
  stats: {
    totalFiles: number;
    totalDirectories: number;
    languages: Record<string, number>;
  };
}

export interface TreeNodeProps {
  node: FileNode;
  level: number;
  searchQuery: string;
  defaultExpandLevel?: number;
}

export interface FileIconProps {
  filename: string;
  className?: string;
}

export interface LanguageTagsProps {
  languages: [string, number][];
}

export interface EmptyStateProps {
  message?: string;
  description?: string;
}

export type IconMapType = Record<string, JSX.Element>;
