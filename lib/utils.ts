import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SCORE_THRESHOLDS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getScoreLevel(
  score: number
): "excellent" | "good" | "fair" | "poor" {
  if (score >= SCORE_THRESHOLDS.excellent) return "excellent";
  if (score >= SCORE_THRESHOLDS.good) return "good";
  if (score >= SCORE_THRESHOLDS.fair) return "fair";
  return "poor";
}

export function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  const colors = {
    excellent: "text-green-500",
    good: "text-emerald-500",
    fair: "text-yellow-500",
    poor: "text-red-500",
  };
  return colors[level];
}

export function getScoreBgColor(score: number): string {
  const level = getScoreLevel(score);
  const colors = {
    excellent: "bg-green-500/10 border-green-500/20",
    good: "bg-emerald-500/10 border-emerald-500/20",
    fair: "bg-yellow-500/10 border-yellow-500/20",
    poor: "bg-red-500/10 border-red-500/20",
  };
  return colors[level];
}

export function getScoreGradient(score: number): string {
  const level = getScoreLevel(score);
  const gradients = {
    excellent: "from-green-500 to-emerald-500",
    good: "from-emerald-500 to-teal-500",
    fair: "from-yellow-500 to-orange-500",
    poor: "from-red-500 to-rose-500",
  };
  return gradients[level];
}

export function getPriorityColor(
  priority: "low" | "medium" | "high" | "critical"
): string {
  const colors = {
    critical: "bg-red-500/10 text-red-500 border-red-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    low: "bg-green-500/10 text-green-500 border-green-500/20",
  };
  return colors[priority];
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
}

export function getLanguageFromExtension(filename: string): string | undefined {
  const ext = getFileExtension(filename);
  const languageMap: Record<string, string> = {
    ts: "TypeScript",
    tsx: "TypeScript",
    js: "JavaScript",
    jsx: "JavaScript",
    py: "Python",
    go: "Go",
    rs: "Rust",
    java: "Java",
    rb: "Ruby",
    php: "PHP",
    swift: "Swift",
    kt: "Kotlin",
    cs: "C#",
    cpp: "C++",
    c: "C",
    html: "HTML",
    css: "CSS",
    scss: "SCSS",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    md: "Markdown",
    sql: "SQL",
    sh: "Shell",
    dockerfile: "Docker",
  };
  return languageMap[ext];
}
