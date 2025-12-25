import { forwardRef } from "react";
import { Star, GitFork, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCardData } from "@/lib/share";
import { ScoreConfig } from "../types";
import { TIER_STYLES, CARD_BASE_CLASSES } from "../constants";
import { formatNumber } from "../utils";
import { TechnicalFrame } from "../technical-frame";
import { TechPill } from "../tech-pill";

interface CompactVariantProps {
  data: ShareCardData;
  config: ScoreConfig;
  className?: string;
}

export const CompactVariant = forwardRef<HTMLDivElement, CompactVariantProps>(
  ({ data, config, className }, ref) => {
    const styles = TIER_STYLES[config.tier];

    return (
      <div
        ref={ref}
        className="w-full max-w-[320px] sm:max-w-95 md:max-w-110"
      >
        <TechnicalFrame config={config}>
          <div className={cn(CARD_BASE_CLASSES, "flex flex-col", className)}>
            <div className="p-3 sm:p-4 md:p-5 relative z-10">
              {/* Header */}
              <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4 mb-3 sm:mb-4 md:mb-5">
                {/* Avatar Box */}
                <div className="relative shrink-0">
                  <img
                    src={data.ownerAvatar}
                    alt={data.ownerLogin}
                    className="relative w-9 h-9 sm:w-10 md:w-12 sm:h-10 md:h-12 rounded bg-zinc-800 object-cover border border-white/10"
                    crossOrigin="anonymous"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm sm:text-base font-medium text-white truncate tracking-wide jetbrains-mono">
                    {data.repoName}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-zinc-500 truncate jetbrains-mono">
                    @{data.ownerLogin}
                  </p>
                </div>

                {/* Score */}
                <div className="text-right shrink-0">
                  <span
                    className={cn(
                      "text-2xl sm:text-3xl jetbrains-mono leading-none",
                      styles.text
                    )}
                  >
                    {data.overallScore}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-px bg-zinc-800/50 border border-zinc-800 mb-3 sm:mb-4 jetbrains-mono">
                <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                  <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 mx-auto mb-0.5 sm:mb-1" />
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-300">
                    {formatNumber(data.stars)}
                  </span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                  <GitFork className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400 mx-auto mb-0.5 sm:mb-1" />
                  <span className="text-[10px] sm:text-xs font-bold text-zinc-300">
                    {formatNumber(data.forks)}
                  </span>
                </div>
                <div className="bg-zinc-900/80 p-1.5 sm:p-2 text-center">
                  <Code className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-violet-400 mx-auto mb-0.5 sm:mb-1" />
                  <span className="text-[8px] sm:text-[10px] font-bold text-zinc-300 truncate block px-0.5">
                    {data.language || "N/A"}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {data.techStack.slice(0, 3).map((tech) => (
                  <TechPill key={tech} tech={tech} />
                ))}
                {data.techStack.length > 3 && (
                  <span className="text-[8px] sm:text-[10px] text-zinc-600 jetbrains-mono self-center">
                    +{data.techStack.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        </TechnicalFrame>
      </div>
    );
  }
);

CompactVariant.displayName = "CompactVariant";