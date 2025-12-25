import { LucideIcon } from "lucide-react";
import { RepoMetadata, AnalysisResult } from "@/lib/types";

export interface AnalysisHeaderProps {
  metadata: RepoMetadata;
  techStack?: string[];
  summary?: string;
  result?: Partial<AnalysisResult>;
}

export interface ExtendedAnalysis {
  whatItDoes: string;
  targetAudience: string;
  howToRun: string[];
  keyFolders: { name: string; description: string }[];
}

export interface InfoSectionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accentColor?: "primary" | "blue" | "green" | "purple" | "orange" | "cyan";
  count?: number;
  isHighlighted?: boolean;
  children: React.ReactNode;
}

export interface TechBadgeProps {
  name: string;
  isPrimary?: boolean;
}

export interface CommandStepProps {
  step: number;
  command: string;
}

export interface FolderCardProps {
  name: string;
  description: string;
}

export interface StatItem {
  icon: LucideIcon;
  value: number;
  label: string;
  highlight: boolean;
}

export type AccentColor =
  | "primary"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "cyan";

export interface ColorClasses {
  iconBg: string;
  iconText: string;
  border: string;
  bg: string;
}
