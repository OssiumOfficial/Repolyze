// share-card.tsx
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
  Lightbulb,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { ShareCardData } from "@/lib/share";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  data: ShareCardData;
  variant?: "default" | "compact" | "detailed";
  showWatermark?: boolean;
  className?: string;
}

function getScoreLevel(score: number): "excellent" | "good" | "fair" | "poor" {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "poor";
}

function getScoreColor(level: "excellent" | "good" | "fair" | "poor"): string {
  const colors = {
    excellent: "#22c55e",
    good: "#10b981",
    fair: "#f59e0b",
    poor: "#ef4444",
  };
  return colors[level];
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, variant = "default", showWatermark = true, className }, ref) => {
    const scoreLevel = getScoreLevel(data.overallScore);
    const scoreColor = getScoreColor(scoreLevel);

    // Compact Variant - Minimal, perfect for Twitter
    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={cn(
            "w-[400px] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]",
            "rounded-2xl overflow-hidden",
            "border border-[#30363d]",
            "font-sans",
            className
          )}
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Gradient accent line */}
          <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

          <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <img
                src={data.ownerAvatar}
                alt={data.ownerLogin}
                className="w-10 h-10 rounded-xl border border-[#30363d]"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-base truncate">
                  {data.repoName}
                </h3>
                <p className="text-[#8b949e] text-sm">@{data.ownerLogin}</p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#21262d] border border-[#30363d]">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                  style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
                >
                  {data.overallScore}
                </div>
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400" />
                <span className="text-white font-medium text-sm">
                  {formatNumber(data.stars)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitFork className="w-4 h-4 text-blue-400" />
                <span className="text-white font-medium text-sm">
                  {formatNumber(data.forks)}
                </span>
              </div>
              {data.language && (
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                  <span className="text-[#8b949e] text-sm">{data.language}</span>
                </div>
              )}
            </div>

            {/* Tech Stack Pills */}
            {data.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {data.techStack.slice(0, 5).map((tech, i) => (
                  <span
                    key={tech}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-xs",
                      i === 0
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                    )}
                  >
                    {tech}
                  </span>
                ))}
                {data.techStack.length > 5 && (
                  <span className="px-2 py-0.5 rounded-md text-xs bg-[#21262d] text-[#484f58]">
                    +{data.techStack.length - 5}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            {showWatermark && (
              <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[#8b949e] text-xs font-medium">RepoGist</span>
                </div>
                <span className="text-[#484f58] text-xs">{data.analyzedAt}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Detailed Variant - Full breakdown
    if (variant === "detailed") {
      const scoreItems = [
        { label: "Code Quality", value: data.scores.codeQuality, icon: Code },
        { label: "Documentation", value: data.scores.documentation, icon: FileText },
        { label: "Security", value: data.scores.security, icon: Shield },
        { label: "Maintainability", value: data.scores.maintainability, icon: Wrench },
      ];

      return (
        <div
          ref={ref}
          className={cn(
            "w-[520px] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]",
            "rounded-2xl overflow-hidden",
            "border border-[#30363d]",
            "font-sans",
            className
          )}
          style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
        >
          {/* Gradient accent */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

          <div className="p-6">
            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 rounded-2xl blur-sm" />
                <img
                  src={data.ownerAvatar}
                  alt={data.ownerLogin}
                  className="relative w-14 h-14 rounded-xl border-2 border-[#30363d]"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-white font-bold text-xl truncate mb-0.5">
                  {data.repoName}
                </h2>
                <p className="text-[#8b949e] text-sm">@{data.ownerLogin}</p>
                {data.description && (
                  <p className="text-[#8b949e] text-sm mt-2 line-clamp-2 leading-relaxed">
                    {data.description}
                  </p>
                )}
              </div>
            </div>

            {/* Score Section */}
            <div className="flex gap-4 mb-5">
              {/* Main Score */}
              <div className="flex-shrink-0">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="#21262d"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - data.overallScore / 100)}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: scoreColor }}
                    >
                      {data.overallScore}
                    </span>
                    <span className="text-[#484f58] text-[10px] uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                {scoreItems.map(({ label, value, icon: Icon }) => {
                  const level = getScoreLevel(value);
                  const color = getScoreColor(level);
                  return (
                    <div
                      key={label}
                      className="flex items-center gap-2 p-2 rounded-lg bg-[#21262d]/50 border border-[#30363d]/50"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#484f58] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#8b949e] text-[10px] truncate">
                            {label}
                          </span>
                          <span
                            className="text-xs font-semibold"
                            style={{ color }}
                          >
                            {value}
                          </span>
                        </div>
                        <div className="h-1 rounded-full bg-[#30363d] overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${value}%`,
                              backgroundColor: color,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stats Row */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#21262d]/50 border border-[#30363d]/50 mb-5">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-400 mb-0.5">
                    <Star className="w-4 h-4" />
                    <span className="text-white font-semibold">
                      {formatNumber(data.stars)}
                    </span>
                  </div>
                  <span className="text-[#484f58] text-[10px]">Stars</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-400 mb-0.5">
                    <GitFork className="w-4 h-4" />
                    <span className="text-white font-semibold">
                      {formatNumber(data.forks)}
                    </span>
                  </div>
                  <span className="text-[#484f58] text-[10px]">Forks</span>
                </div>
                {data.language && (
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-purple-400 mb-0.5">
                      <Code className="w-4 h-4" />
                      <span className="text-white font-semibold">{data.language}</span>
                    </div>
                    <span className="text-[#484f58] text-[10px]">Language</span>
                  </div>
                )}
              </div>

              {/* Insights */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/10">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">
                    {data.topInsights.strengths}
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10">
                  <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400 text-xs font-medium">
                    {data.topInsights.suggestions}
                  </span>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            {data.techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {data.techStack.slice(0, 8).map((tech, i) => (
                  <span
                    key={tech}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-medium",
                      i < 2
                        ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                    )}
                  >
                    {tech}
                  </span>
                ))}
                {data.techStack.length > 8 && (
                  <span className="px-2.5 py-1 rounded-lg text-xs bg-[#21262d] text-[#484f58]">
                    +{data.techStack.length - 8}
                  </span>
                )}
              </div>
            )}

            {/* Footer */}
            {showWatermark && (
              <div className="flex items-center justify-between pt-4 border-t border-[#21262d]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-white font-semibold text-sm">RepoGist</span>
                    <span className="text-[#484f58] text-xs ml-2">AI Analysis</span>
                  </div>
                </div>
                <span className="text-[#484f58] text-xs">{data.analyzedAt}</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default Variant - Balanced view
    return (
      <div
        ref={ref}
        className={cn(
          "w-[440px] bg-gradient-to-br from-[#0d1117] via-[#161b22] to-[#0d1117]",
          "rounded-2xl overflow-hidden",
          "border border-[#30363d]",
          "font-sans",
          className
        )}
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        {/* Gradient accent */}
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-br from-emerald-500/40 to-cyan-500/40 rounded-xl blur-sm" />
              <img
                src={data.ownerAvatar}
                alt={data.ownerLogin}
                className="relative w-12 h-12 rounded-xl border border-[#30363d]"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-lg truncate">
                {data.repoName}
              </h3>
              <p className="text-[#8b949e] text-sm">@{data.ownerLogin}</p>
            </div>

            {/* Score Badge */}
            <div
              className="flex flex-col items-center px-4 py-2 rounded-xl border"
              style={{
                backgroundColor: `${scoreColor}10`,
                borderColor: `${scoreColor}30`,
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: scoreColor }}
              >
                {data.overallScore}
              </span>
              <span className="text-[10px] text-[#8b949e] uppercase tracking-wider">
                Score
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-white font-medium">
                {formatNumber(data.stars)}
              </span>
              <span className="text-[#484f58] text-xs">stars</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitFork className="w-4 h-4 text-blue-400" />
              <span className="text-white font-medium">
                {formatNumber(data.forks)}
              </span>
              <span className="text-[#484f58] text-xs">forks</span>
            </div>
            {data.language && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-white font-medium">{data.language}</span>
              </div>
            )}
          </div>

          {/* Score Bars */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Quality", value: data.scores.codeQuality },
              { label: "Docs", value: data.scores.documentation },
              { label: "Security", value: data.scores.security },
              { label: "Maintain", value: data.scores.maintainability },
            ].map(({ label, value }) => {
              const level = getScoreLevel(value);
              const color = getScoreColor(level);
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8b949e]">{label}</span>
                    <span style={{ color }} className="font-medium">
                      {value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${value}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tech Stack */}
          {data.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {data.techStack.slice(0, 6).map((tech, i) => (
                <span
                  key={tech}
                  className={cn(
                    "px-2 py-0.5 rounded-md text-xs",
                    i < 2
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-[#21262d] text-[#8b949e] border border-[#30363d]"
                  )}
                >
                  {tech}
                </span>
              ))}
              {data.techStack.length > 6 && (
                <span className="px-2 py-0.5 rounded-md text-xs bg-[#21262d] text-[#484f58]">
                  +{data.techStack.length - 6}
                </span>
              )}
            </div>
          )}

          {/* Insights Summary */}
          <div className="flex items-center justify-center gap-6 p-3 rounded-xl bg-[#21262d]/50 border border-[#30363d]/50 mb-4">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-[#c9d1d9] text-sm">
                {data.topInsights.strengths} strengths
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-blue-400" />
              <span className="text-[#c9d1d9] text-sm">
                {data.topInsights.suggestions} tips
              </span>
            </div>
          </div>

          {/* Footer */}
          {showWatermark && (
            <div className="flex items-center justify-between pt-3 border-t border-[#21262d]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[#8b949e] text-sm">
                  Analyzed by <span className="text-white font-medium">RepoGist</span>
                </span>
              </div>
              <span className="text-[#484f58] text-xs">{data.analyzedAt}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";