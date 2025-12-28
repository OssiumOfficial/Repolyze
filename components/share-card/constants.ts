import { TierStyle, ScoreTier } from "./types";

export const TIER_STYLES: Record<ScoreTier, TierStyle> = {
  excellent: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    bgSolid: "bg-emerald-500",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
  },
  good: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    bgSolid: "bg-sky-500",
    border: "border-sky-500/20",
    gradient: "from-sky-500 to-blue-400",
  },
  fair: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    bgSolid: "bg-amber-500",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-400",
  },
  poor: {
    text: "text-rose-300",
    bg: "bg-rose-500/10",
    bgSolid: "bg-rose-500",
    border: "border-rose-500/20",
    gradient: "from-rose-500 to-red-400",
  },
};

export const CARD_BASE_CLASSES =
  "relative overflow-hidden text-zinc-200 select-none bg-black antialiased border";