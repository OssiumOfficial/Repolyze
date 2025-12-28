import { IconSvgElement } from "@hugeicons/react";

export interface SectionHeaderProps {
  title: string;
  icon?: IconSvgElement;
}

export interface TabTriggerItemProps {
  value: string;
  icon: IconSvgElement;
  label: string;
  count?: number;
}

export interface EmptyStateProps {
  icon: IconSvgElement;
  title: string;
  description: string;
}