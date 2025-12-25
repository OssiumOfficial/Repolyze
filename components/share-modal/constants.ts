import { VariantConfig } from "./types";

export const VARIANTS: VariantConfig[] = [
  { id: "compact", label: "Compact", desc: "Best for Twitter", size: "420px" },
  { id: "default", label: "Default", desc: "Balanced view", size: "500px" },
  { id: "detailed", label: "Detailed", desc: "Full breakdown", size: "600px" },
];

export const VARIANT_SCALE = {
  compact: {
    mobile: 0.7,
    desktop: 0.95,
  },
  default: {
    mobile: 0.55,
    desktop: 0.85,
  },
  detailed: {
    mobile: 0.45,
    desktop: 0.75,
  },
} as const;