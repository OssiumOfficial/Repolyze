import { IconSvgElement } from "@hugeicons/react";
import { RepoMetadata, AnalysisResult, BranchInfo } from "@/lib/types";
import { UserTier } from "@/lib/tiers";

export interface AnalysisHeaderProps {
  metadata: RepoMetadata;
  techStack?: string[];
  summary?: string;
  result?: Partial<AnalysisResult>;
  branch?: string;
  availableBranches?: BranchInfo[];
  onBranchChange?: (branch: string) => void;
  isLoading?: boolean;
  tier?: UserTier;
}

export interface ExtendedAnalysis {
  whatItDoes: string;
  targetAudience: string;
  howToRun: string[];
  keyFolders: { name: string; description: string }[];
}

export interface InfoSectionProps {
  icon: IconSvgElement;
  title: string;
  description: string;
  accentColor?: "primary" | "blue" | "green" | "purple" | "orange" | "cyan";
  count?: number;
  isHighlighted?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
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
  icon: IconSvgElement;
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

export interface CopyButtonProps {
  text: string;
  label?: string;
  className?: string;
}

export interface BranchSelectorProps {
  currentBranch: string;
  branches: BranchInfo[];
  onBranchChange: (branch: string) => void;
  disabled?: boolean;
}
