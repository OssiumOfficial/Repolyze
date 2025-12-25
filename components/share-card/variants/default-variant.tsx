import { forwardRef } from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCardData } from "@/lib/share";
import { ScoreConfig, BreakdownItem } from "../types";
import { TIER_STYLES, CARD_BASE_CLASSES } from "../constants";
import { getScoreConfig } from "../utils";
import { TechnicalFrame } from "../technical-frame";
import { TechPill } from "../tech-pill";

interface DefaultVariantProps {
  data: ShareCardData;
  config: ScoreConfig;
  showWatermark?: boolean;
  className?: string;
}

export const DefaultVariant = forwardRef<HTMLDivElement, DefaultVariantProps>(
  ({ data, config, showWatermark = true, className }, ref) => {
    const styles = TIER_STYLES[config.tier];

    const metrics: BreakdownItem[] = [
      {
        l: "CODE_QUALITY",
        short: "QUALITY",
        v: data.scores.codeQuality,
      },
      { l: "SECURITY", short: "SECURITY", v: data.scores.security },
      {
        l: "MAINTAINABILITY",
        short: "MAINTAIN",
        v: data.scores.maintainability,
      },
    ];

    return (
      <div ref={ref} className="w-full max-w-[320px] sm:max-w-105 md:max-w-125">
        <TechnicalFrame config={config}>
          <div className={cn(CARD_BASE_CLASSES, className)}>
            <div className="p-3 sm:p-5 md:p-6 relative z-10">
              {/* Top Row */}
              <div className="flex justify-between items-start gap-2 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                <div className="flex gap-2.5 sm:gap-3 md:gap-4 min-w-0">
                  <img
                    src={data.ownerAvatar}
                    alt={data.ownerLogin}
                    className="w-10 h-10 sm:w-12 md:w-14 sm:h-12 md:h-14 rounded-sm border border-white/10 bg-zinc-950 shrink-0"
                    crossOrigin="anonymous"
                  />
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium text-white tracking-wide jetbrains-mono truncate">
                      {data.repoName}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                      <span className="text-[10px] sm:text-xs text-zinc-500 jetbrains-mono truncate">
                        @{data.ownerLogin}
                      </span>
                      {data.language && (
                        <>
                          <span className="text-zinc-700 hidden sm:inline">
                            /
                          </span>
                          <span className="text-[10px] sm:text-xs text-zinc-400 jetbrains-mono hidden sm:inline">
                            {data.language}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end shrink-0">
                  <span
                    className={cn(
                      "text-3xl sm:text-4xl md:text-5xl jetbrains-mono tracking-tighter leading-none",
                      styles.text
                    )}
                  >
                    {data.overallScore}
                  </span>
                  <span className="text-[7px] sm:text-[8px] md:text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5 sm:mt-1">
                    Total Score
                  </span>
                </div>
              </div>

              {/* Metrics with "Technical" bars */}
              <div className="space-y-2 sm:space-y-2.5 md:space-y-3 mb-4 sm:mb-5 md:mb-6">
                {metrics.map((m) => {
                  const mConfig = getScoreConfig(m.v);
                  const mStyle = TIER_STYLES[mConfig.tier];
                  // Ensure value is between 0-100
                  const progressValue = Math.min(100, Math.max(0, m.v));

                  return (
                    <div key={m.l} className="flex items-center gap-2 sm:gap-3">
                      {/* Label */}
                      <span className="text-[8px] sm:text-[9px] md:text-[10px] jetbrains-mono text-zinc-500 w-14 sm:w-20 md:w-24 shrink-0 truncate">
                        <span className="hidden md:inline">{m.l}</span>
                        <span className="md:hidden">{m.short}</span>
                      </span>

                      {/* Progress Bar Container */}
                      <div className="flex-1 h-1.5 sm:h-2 bg-zinc-950 border border-zinc-800 relative overflow-hidden">
                        {/* Diagonal stripe pattern */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                              -45deg,
                              transparent,
                              transparent 2px,
                              rgba(63, 63, 70, 0.4) 2px,
                              rgba(63, 63, 70, 0.4) 4px
                            )`,
                          }}
                        />

                        {/* Progress Fill - Using inline style for reliability */}
                        <div
                          className="h-full relative z-10 transition-all duration-500"
                          style={{
                            width: `${progressValue}%`,
                            backgroundColor: mConfig.hex,
                          }}
                        />
                      </div>

                      {/* Value */}
                      <span
                        className={cn(
                          "text-[10px] sm:text-xs jetbrains-mono font-bold w-6 sm:w-8 text-right shrink-0",
                          mStyle.text
                        )}
                      >
                        {m.v}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-dashed border-zinc-800">
                <div className="flex flex-wrap gap-1 sm:gap-1.5 max-w-full sm:max-w-[65%]">
                  {data.techStack.slice(0, 3).map((t) => (
                    <TechPill key={t} tech={t} />
                  ))}
                  {data.techStack.length > 3 && (
                    <span className="text-[8px] sm:text-[10px] text-zinc-600 jetbrains-mono self-center">
                      +{data.techStack.length - 3}
                    </span>
                  )}
                </div>

                {showWatermark && (
                  <div className="text-left sm:text-right">
                    <div className="flex items-center sm:justify-end gap-1 sm:gap-1.5 mb-0.5 opacity-60">
                      <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600" />
                      <span className="text-[8px] jetbrains-mono sm:text-[9px] tracking-widest text-zinc-300">
                        REPOGIST
                      </span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-zinc-600 jetbrains-mono">
                      {data.analyzedAt.split(",")[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TechnicalFrame>
      </div>
    );
  }
);

DefaultVariant.displayName = "DefaultVariant";