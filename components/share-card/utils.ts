import { ScoreConfig, ScoreTier } from "./types";

export function getScoreConfig(score: number): ScoreConfig {
  if (score >= 90)
    return { label: "EXCELLENT", tier: "excellent" as ScoreTier, hex: "#34d399" };
  if (score >= 70)
    return { label: "GOOD", tier: "good" as ScoreTier, hex: "#38bdf8" };
  if (score >= 50)
    return { label: "FAIR", tier: "fair" as ScoreTier, hex: "#fbbf24" };
  return { label: "POOR", tier: "poor" as ScoreTier, hex: "#f43f5e" };
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}