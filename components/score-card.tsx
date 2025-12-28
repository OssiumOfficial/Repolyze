"use client";

import { motion } from "framer-motion";
import {
  Code,
  FileText,
  Shield,
  Wrench,
  TestTube,
  Package,
  BarChart3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  scores: ScoreMetrics;
}

const scoreConfig = [
  { key: "codeQuality", label: "Code Quality", icon: Code },
  { key: "documentation", label: "Documentation", icon: FileText },
  { key: "security", label: "Security", icon: Shield },
  { key: "maintainability", label: "Maintainability", icon: Wrench },
  { key: "testCoverage", label: "Test Coverage", icon: TestTube },
  { key: "dependencies", label: "Dependencies", icon: Package },
] as const;

// Score level helpers
function getScoreLevel(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function ScoreCard({ scores }: ScoreCardProps) {
  const circumference = 2 * Math.PI * 52;

  return (
    <Card className="h-full border-border/60 bg-background overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <div className="p-1.5 rounded-md bg-primary/10">
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            Repository Score
          </div>
          <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-muted/50 rounded-md">
            {getScoreLabel(scores.overall)}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-6 pb-6 space-y-6">
        {/* Overall Score - Circular Gauge */}
        <div className="flex justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            {/* Circular Progress */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                {/* Background track */}
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  className="stroke-muted"
                />

                {/* Progress arc */}
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className="stroke-primary"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{
                    strokeDashoffset:
                      circumference * (1 - scores.overall / 100),
                  }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                />

                {/* Tick marks */}
                {[0, 25, 50, 75, 100].map((tick) => {
                  const angle = (tick / 100) * 360 - 90;
                  const radians = (angle * Math.PI) / 180;
                  const innerRadius = 44;
                  const outerRadius = 48;

                  return (
                    <line
                      key={tick}
                      x1={60 + innerRadius * Math.cos(radians)}
                      y1={60 + innerRadius * Math.sin(radians)}
                      x2={60 + outerRadius * Math.cos(radians)}
                      y2={60 + outerRadius * Math.sin(radians)}
                      className="stroke-primary"
                      strokeWidth="1.5"
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className="text-center"
                >
                  <span className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
                    {scores.overall}
                  </span>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    out of 100
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/60" />
          <span className="text-xs text-muted-foreground">Breakdown</span>
          <div className="flex-1 h-px bg-border/60" />
        </div>

        {/* Individual Scores Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:gap-x-6 sm:gap-y-5">
          {scoreConfig.map(({ key, label, icon: Icon }, index) => {
            const score = scores[key];
            const level = getScoreLevel(score);

            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.08 * index + 0.5,
                  duration: 0.25,
                }}
                className="space-y-2"
              >
                {/* Label Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs sm:text-sm text-muted-foreground truncate">
                      {label}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-foreground tabular-nums shrink-0">
                    {score}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="relative h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className={cn(
                      "absolute inset-y-0 left-0 rounded-full",
                      level === "high" && "bg-primary",
                      level === "medium" && "bg-primary/70",
                      level === "low" && "bg-primary/50"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{
                      duration: 0.5,
                      delay: 0.08 * index + 0.6,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          <FooterStat
            label="High"
            count={scoreConfig.filter(({ key }) => scores[key] >= 70).length}
            total={scoreConfig.length}
          />
          <FooterStat
            label="Medium"
            count={
              scoreConfig.filter(
                ({ key }) => scores[key] >= 40 && scores[key] < 70
              ).length
            }
            total={scoreConfig.length}
          />
          <FooterStat
            label="Low"
            count={scoreConfig.filter(({ key }) => scores[key] < 40).length}
            total={scoreConfig.length}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Footer Stat Component
function FooterStat({
  label,
  count,
}: {
  label: string;
  count: number;
  total: number;
}) {
  return (
    <div className="text-center p-2 rounded-lg bg-muted/30">
      <div className="text-lg font-semibold text-foreground">{count}</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
