import { memo } from "react";
import {
  File,
  FileCode,
  FileJson,
  FileText,
  Image as ImageIcon,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFileExtension } from "./utils";
import {
  CODE_EXTENSIONS,
  CONFIG_EXTENSIONS,
  DOC_EXTENSIONS,
  IMAGE_EXTENSIONS,
  LOCK_EXTENSIONS,
} from "./constants";

interface FileIconProps {
  filename: string;
  className?: string;
}

export const FileIcon = memo(function FileIcon({
  filename,
  className,
}: FileIconProps) {
  const ext = getFileExtension(filename);
  const baseClass = cn("w-4 h-4 shrink-0", className);

  // TypeScript/JavaScript files
  if (["ts", "tsx"].includes(ext)) {
    return <FileCode className={cn(baseClass, "text-primary")} />;
  }

  if (["js", "jsx"].includes(ext)) {
    return <FileCode className={cn(baseClass, "text-primary/70")} />;
  }

  // CSS files
  if (["css", "scss", "sass", "less"].includes(ext)) {
    return <FileCode className={cn(baseClass, "text-primary/60")} />;
  }

  // HTML files
  if (ext === "html") {
    return <FileCode className={cn(baseClass, "text-muted-foreground")} />;
  }

  // JSON files
  if (ext === "json") {
    return <FileJson className={cn(baseClass, "text-muted-foreground")} />;
  }

  // Documentation files
  if (DOC_EXTENSIONS.includes(ext)) {
    return <FileText className={cn(baseClass, "text-muted-foreground")} />;
  }

  // Image files
  if (IMAGE_EXTENSIONS.includes(ext)) {
    return <ImageIcon className={cn(baseClass, "text-muted-foreground")} />;
  }

  // Config files
  if (["yaml", "yml", "toml", "ini"].includes(ext)) {
    return <Settings className={cn(baseClass, "text-muted-foreground/70")} />;
  }

  // Lock files
  if (LOCK_EXTENSIONS.includes(ext)) {
    return <File className={cn(baseClass, "text-muted-foreground/50")} />;
  }

  // Default
  return <File className={cn(baseClass, "text-muted-foreground/60")} />;
});