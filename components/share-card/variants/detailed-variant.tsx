import { forwardRef } from "react";
import { Code, Shield, FileText, Wrench, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShareCardData } from "@/lib/share";
import { ScoreConfig, MetricItem } from "../types";
import { TIER_STYLES, CARD_BASE_CLASSES } from "../constants";
import { formatNumber, getScoreConfig } from "../utils";
import { TechnicalFrame } from "../technical-frame";

interface DetailedVariantProps {
  data: ShareCardData;
  config: ScoreConfig;
  showWatermark?: boolean;
  className?: string;
}

export const DetailedVariant = forwardRef<HTMLDivElement, DetailedVariantProps>(
  ({ data, config, showWatermark = true, className }, ref) => {
    const styles = TIER_STYLES[config.tier];

    const breakdown: MetricItem[] = [
      {
        label: "Code_Quality",
        shortLabel: "Quality",
        value: data.scores.codeQuality,
        icon: Code,
      },
      {
        label: "Security",
        shortLabel: "Security",
        value: data.scores.security,
        icon: Shield,
      },
      {
        label: "Docs",
        shortLabel: "Docs",
        value: data.scores.documentation,
        icon: FileText,
      },
      {
        label: "Maintenance",
        shortLabel: "Maintain",
        value: data.scores.maintainability,
        icon: Wrench,
      },
    ];

    return (
      <div ref={ref} className="w-full max-w-85 sm:max-w-120 md:max-w-150">
        <TechnicalFrame config={config}>
          <div className={cn(CARD_BASE_CLASSES, className)}>
            <div className="p-3 sm:p-5 md:p-6 relative z-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={data.ownerAvatar}
                      alt={data.ownerLogin}
                      className="w-11 h-11 sm:w-14 md:w-16 sm:h-14 md:h-16 rounded bg-zinc-950"
                      crossOrigin="anonymous"
                    />
                    <div className="absolute inset-0 rounded" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
                      <h2 className="text-base sm:text-lg md:text-xl font-medium text-white tracking-wide jetbrains-mono truncate">
                        {data.repoName}
                      </h2>
                      <span
                        className={cn(
                          "px-1 sm:px-1.5 py-0.5 rounded-[2px] text-[7px] sm:text-[9px] uppercase font-bold text-primary shrink-0",
                          styles.bg.replace("/10", "")
                        )}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400 jetbrains-mono mb-1 sm:mb-2 truncate">
                      @{data.ownerLogin}
                    </p>
                    {data.description && (
                      <p className="text-[10px] sm:text-xs text-zinc-500 line-clamp-1 sm:line-clamp-2 jetbrains-mono max-w-full sm:max-w-70 md:max-w-75">
                        {data.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Big Score Box */}
                <div className="text-left sm:text-right shrink-0">
                  <div
                    className={cn(
                      "text-4xl sm:text-5xl md:text-6xl jetbrains-mono tracking-tighter leading-none",
                      styles.text
                    )}
                  >
                    {data.overallScore}
                  </div>
                  <span className="text-[8px] sm:text-[9px] jetbrains-mono text-zinc-600 uppercase tracking-widest">
                    /100
                  </span>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-5 sm:mb-6 md:mb-8">
                {breakdown.map((item) => {
                  const itemConfig = getScoreConfig(item.value);
                  const itemStyle = TIER_STYLES[itemConfig.tier];
                  return (
                    <div key={item.label} className="group">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1 sm:mb-1.5 jetbrains-mono">
                        <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors truncate">
                          <span className="hidden sm:inline uppercase jetbrains-mono">
                            {item.label}
                          </span>
                          <span className="sm:hidden jetbrains-mono">
                            {item.shortLabel}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "font-bold jetbrains-mono shrink-0 ml-1",
                            itemStyle.text
                          )}
                        >
                          {item.value}
                        </span>
                      </div>
                      <div className="h-1 sm:h-1.5 w-full bg-zinc-950 border border-zinc-800">
                        <div
                          className={cn(
                            "h-full transition-all duration-500",
                            itemStyle.bg.replace("/10", "")
                          )}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer Info */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 pt-3 sm:pt-4 border-t border-dashed border-zinc-800">
                <div className="flex gap-4 sm:gap-6 jetbrains-mono text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2 jetbrains-mono">
                    <span className="text-zinc-600">STARS</span>
                    <span className="text-zinc-300">
                      {formatNumber(data.stars)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 jetbrains-mono">
                    <span className="text-zinc-600">FORKS</span>
                    <span className="text-zinc-300">
                      {formatNumber(data.forks)}
                    </span>
                  </div>
                </div>

                {showWatermark && (
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Terminal className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-zinc-600" />
                    <span className="text-[8px] sm:text-[10px] font-bold text-zinc-500 tracking-widest uppercase">
                      <span className="hidden sm:inline jetbrains-mono">
                        GENERATED BY{" "}
                      </span>
                      <span className="jetbrains-mono">REPOGIST</span>
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

DetailedVariant.displayName = "DetailedVariant";