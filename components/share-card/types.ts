import { ShareCardData } from "@/lib/share";

export interface ShareCardProps {
  data: ShareCardData;
  variant?: "default" | "compact" | "detailed";
  showWatermark?: boolean;
  className?: string;
}

export interface TechPillProps {
  tech: string;
  isPrimary?: boolean;
}

export interface TechnicalFrameProps {
  children: React.ReactNode;
  config: ScoreConfig;
  className?: string;
}

export interface ScoreConfig {
  label: string;
  tier: ScoreTier;
  hex: string;
}

export type ScoreTier = "excellent" | "good" | "fair" | "poor";

export interface TierStyle {
  text: string;
  bg: string;
  bgSolid: string;
  border: string;
  gradient: string;
}

export interface MetricItem {
  label: string;
  shortLabel: string;
  value: number;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreakdownItem {
  l: string;
  short: string;
  v: number;
}