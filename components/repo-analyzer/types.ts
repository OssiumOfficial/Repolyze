import { LucideIcon } from "lucide-react";

export interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
}

export interface TabTriggerItemProps {
  value: string;
  icon: LucideIcon;
  label: string;
  count?: number;
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}