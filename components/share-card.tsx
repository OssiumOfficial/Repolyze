"use client";

import { forwardRef } from "react";
import {
  Star,
  GitFork,
  Code,
  Shield,
  FileText,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  AlertCircle,
  Github,
  Sparkles,
  Eye,
  TestTube,
  Package,
} from "lucide-react";
import { ShareCardData } from "@/lib/share";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  data: ShareCardData;
  variant?: "default" | "compact" | "detailed";
  showWatermark?: boolean;
  className?: string;
}

// Score utilities
function getScoreLevel(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function getScoreColor(score: number): string {
  const level = getScoreLevel(score);
  const colors = {
    excellent: "text-green-400",
    good: "text-emerald-400",
    fair: "text-yellow-400",
    poor: "text-red-400",
  };
  return colors[level];
}

function getScoreGradient(score: number): string {
  const level = getScoreLevel(score);
  const gradients = {
    excellent: "from-green-500 to-emerald-500",
    good: "from-emerald-500 to-teal-500",
    fair: "from-yellow-500 to-orange-500",
    poor: "from-red-500 to-rose-500",
  };
  return gradients[level];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, variant = "default", showWatermark = true, className }, ref) => {
    const scoreLevel = getScoreLevel(data.overallScore);

    // Compact Variant
    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={cn(
            "w-105 p-5 rounded-2xl",
            "bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800",
            "border border-zinc-700/50 shadow-2xl",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md scale-110" />
              <img
                src={data.ownerAvatar}
                alt={data.ownerLogin}
                className="relative w-11 h-11 rounded-xl border-2 border-zinc-700"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{data.repoName}</h3>
              <p className="text-xs text-zinc-400">@{data.ownerLogin}</p>
            </div>
            <div
              className={cn(
                "flex flex-col items-center px-3 py-1.5 rounded-xl",
                "bg-linear-to-br",
                scoreLevel === "excellent" && "from-green-500/20 to-emerald-500/10",
                scoreLevel === "good" && "from-emerald-500/20 to-teal-500/10",
                scoreLevel === "fair" && "from-yellow-500/20 to-orange-500/10",
                scoreLevel === "poor" && "from-red-500/20 to-rose-500/10"
              )}
            >
              <span className={cn("text-2xl font-bold", getScoreColor(data.overallScore))}>
                {data.overallScore}
              </span>
              <span className="text-[10px] text-zinc-400">Score</span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-white">{formatNumber(data.stars)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">{formatNumber(data.forks)}</span>
            </div>
            {data.language && (
              <div className="flex items-center gap-1.5">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-zinc-300">{data.language}</span>
              </div>
            )}
          </div>

          {/* Tech Stack */}
          {data.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {data.techStack.slice(0, 5).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-zinc-300 border border-white/5"
                >
                  {tech}
                </span>
              ))}
              {data.techStack.length > 5 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-zinc-500">
                  +{data.techStack.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Watermark */}
          {showWatermark && (
            <div className="flex items-center justify-between pt-3 border-t border-zinc-700/50">
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>RepoGist</span>
              </div>
              <span className="text-[10px] text-zinc-600">{data.analyzedAt}</span>
            </div>
          )}
        </div>
      );
    }

    // Detailed Variant
    if (variant === "detailed") {
      return (
        <div
          ref={ref}
          className={cn(
            "w-150 p-7 rounded-3xl",
            "bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800",
            "border border-zinc-700/50 shadow-2xl",
            className
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg scale-110" />
              <img
                src={data.ownerAvatar}
                alt={data.ownerLogin}
                className="relative w-16 h-16 rounded-2xl border-2 border-zinc-700"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-white truncate">{data.repoName}</h2>
              <p className="text-sm text-zinc-400">@{data.ownerLogin}</p>
              {data.description && (
                <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{data.description}</p>
              )}
            </div>
          </div>

          {/* Score Circle & Breakdown */}
          <div className="flex items-start gap-6 mb-6">
            {/* Score Circle */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="10"
                  className="text-zinc-700"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  strokeWidth="10"
                  strokeLinecap="round"
                  className={cn("stroke-current", getScoreColor(data.overallScore))}
                  strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - data.overallScore / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-3xl font-bold", getScoreColor(data.overallScore))}>
                  {data.overallScore}
                </span>
                <span className="text-[10px] text-zinc-500">Overall</span>
              </div>
            </div>

            {/* Score Breakdown Grid */}
            <div className="flex-1 grid grid-cols-2 gap-2">
              {[
                { label: "Code Quality", value: data.scores.codeQuality, icon: Code },
                { label: "Documentation", value: data.scores.documentation, icon: FileText },
                { label: "Security", value: data.scores.security, icon: Shield },
                { label: "Maintainability", value: data.scores.maintainability, icon: Wrench },
                { label: "Test Coverage", value: data.scores.testCoverage, icon: TestTube },
                { label: "Dependencies", value: data.scores.dependencies, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <Icon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-zinc-400 truncate">{label}</span>
                      <span className={cn("font-medium", getScoreColor(value))}>{value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-zinc-700 overflow-hidden">
                      <div
                        className={cn("h-full rounded-full bg-linear-to-r", getScoreGradient(value))}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats & Insights Row */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 mb-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4" />
                  <span className="font-bold text-white">{formatNumber(data.stars)}</span>
                </div>
                <span className="text-[10px] text-zinc-500">Stars</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-blue-400">
                  <GitFork className="w-4 h-4" />
                  <span className="font-bold text-white">{formatNumber(data.forks)}</span>
                </div>
                <span className="text-[10px] text-zinc-500">Forks</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-zinc-400">
                  <Eye className="w-4 h-4" />
                  <span className="font-bold text-white">{formatNumber(data.watchers)}</span>
                </div>
                <span className="text-[10px] text-zinc-500">Watchers</span>
              </div>
              {data.language && (
                <div className="text-center">
                  <div className="flex items-center gap-1 text-purple-400">
                    <Code className="w-4 h-4" />
                    <span className="font-bold text-white">{data.language}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Language</span>
                </div>
              )}
            </div>

            {/* Insights Summary */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-500/10">
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs font-medium text-green-400">{data.topInsights.strengths}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10">
                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-medium text-red-400">{data.topInsights.weaknesses}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-500/10">
                <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-medium text-blue-400">{data.topInsights.suggestions}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs font-medium text-yellow-400">{data.topInsights.warnings}</span>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          {data.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {data.techStack.slice(0, 10).map((tech, index) => (
                <span
                  key={tech}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border",
                    index < 3
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/5 text-zinc-300 border-white/10"
                  )}
                >
                  {tech}
                </span>
              ))}
              {data.techStack.length > 10 && (
                <span className="px-3 py-1 text-xs rounded-full bg-white/5 text-zinc-500 border border-white/5">
                  +{data.techStack.length - 10} more
                </span>
              )}
            </div>
          )}

          {/* Watermark */}
          {showWatermark && (
            <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/20">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-white">RepoGist</span>
                  <span className="text-xs text-zinc-500 ml-2">AI-Powered Analysis</span>
                </div>
              </div>
              <span className="text-xs text-zinc-600">{data.analyzedAt}</span>
            </div>
          )}
        </div>
      );
    }

    // Default Variant
    return (
      <div
        ref={ref}
        className={cn(
          "w-125 p-6 rounded-2xl",
          "bg-linear-to-br from-zinc-900 via-zinc-900 to-zinc-800",
          "border border-zinc-700/50 shadow-2xl",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4 mb-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-xl bg-primary/30 blur-md scale-110" />
            <img
              src={data.ownerAvatar}
              alt={data.ownerLogin}
              className="relative w-14 h-14 rounded-xl border-2 border-zinc-700"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white truncate">{data.repoName}</h3>
            <p className="text-sm text-zinc-400">@{data.ownerLogin}</p>
          </div>
          <div
            className={cn(
              "flex flex-col items-center px-4 py-2 rounded-xl",
              "bg-linear-to-br",
              scoreLevel === "excellent" && "from-green-500/20 to-emerald-500/10",
              scoreLevel === "good" && "from-emerald-500/20 to-teal-500/10",
              scoreLevel === "fair" && "from-yellow-500/20 to-orange-500/10",
              scoreLevel === "poor" && "from-red-500/20 to-rose-500/10"
            )}
          >
            <span className={cn("text-3xl font-bold", getScoreColor(data.overallScore))}>
              {data.overallScore}
            </span>
            <span className="text-[10px] text-zinc-400">Score</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 mb-5">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-medium text-white">{formatNumber(data.stars)}</span>
            <span className="text-xs text-zinc-500">stars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <GitFork className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">{formatNumber(data.forks)}</span>
            <span className="text-xs text-zinc-500">forks</span>
          </div>
          {data.language && (
            <div className="flex items-center gap-1.5">
              <Code className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-white">{data.language}</span>
            </div>
          )}
        </div>

        {/* Score Bars */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            { label: "Quality", value: data.scores.codeQuality },
            { label: "Docs", value: data.scores.documentation },
            { label: "Security", value: data.scores.security },
            { label: "Maintain", value: data.scores.maintainability },
          ].map(({ label, value }) => (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-400">{label}</span>
                <span className={getScoreColor(value)}>{value}</span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-700 overflow-hidden">
                <div
                  className={cn("h-full rounded-full bg-linear-to-r", getScoreGradient(value))}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        {data.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {data.techStack.slice(0, 6).map((tech, index) => (
              <span
                key={tech}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-full border",
                  index < 2
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-white/5 text-zinc-300 border-white/10"
                )}
              >
                {tech}
              </span>
            ))}
            {data.techStack.length > 6 && (
              <span className="px-2.5 py-1 text-xs rounded-full bg-white/5 text-zinc-500 border border-white/5">
                +{data.techStack.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Insights Summary */}
        <div className="flex items-center justify-center gap-6 mb-5 p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-sm text-zinc-300">{data.topInsights.strengths} strengths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-zinc-300">{data.topInsights.suggestions} tips</span>
          </div>
        </div>

        {/* Watermark */}
        {showWatermark && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-700/50">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-zinc-400">Analyzed by</span>
              <span className="font-semibold text-white">RepoGist</span>
            </div>
            <span className="text-xs text-zinc-600">{data.analyzedAt}</span>
          </div>
        )}
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";