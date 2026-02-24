import { cn } from "@/lib/utils";
import { TechnicalFrameProps } from "./types";
import { TIER_STYLES } from "./constants";
import { GitBranch } from "lucide-react";

export function TechnicalFrame({
  children,
  config,
  branch,
  className,
}: TechnicalFrameProps) {
  const styles = TIER_STYLES[config.tier];

  return (
    <div className={cn("relative bg-[#050505] p-4 sm:p-6 md:p-8", className)}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[16px_16px] sm:bg-size-[24px_24px] pointer-events-none opacity-60" />

      {/* Main Border Box (No Radius) */}
      <div className="relative h-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        {/* Corner Brackets (Based on score color) */}
        <div
          className={cn(
            "absolute -top-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -top-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-r-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-px -left-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-l-2",
            styles.text,
            "border-current"
          )}
        />
        <div
          className={cn(
            "absolute -bottom-px -right-px w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2",
            styles.text,
            "border-current"
          )}
        />

        {/* Top Label */}
        <div className="absolute -top-2.5 sm:-top-3 left-3 sm:left-6 px-1.5 sm:px-2 bg-[#050505] text-[7px] sm:text-[9px] jetbrains-mono text-zinc-500 uppercase tracking-widest border-x border-zinc-900 flex items-center gap-1 sm:gap-1.5">
          <span className="hidden sm:inline">SYS.ANALYSIS // </span>
          <span className={styles.text}>{config.label}</span>
          {branch && (
            <>
              <span className="text-zinc-700 hidden sm:inline">{"//"}</span>
              <span className="flex items-center gap-0.5 text-zinc-400">
                <GitBranch className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                <span className="max-w-16 sm:max-w-24 truncate">{branch}</span>
              </span>
            </>
          )}
        </div>

        {/* Bottom Metadata */}
        <div className="absolute -bottom-2.5 sm:-bottom-3 right-3 sm:right-6 px-1.5 sm:px-2 bg-[#050505] text-[7px] sm:text-[9px] jetbrains-mono text-zinc-600 uppercase tracking-widest border-x border-zinc-900 flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline">OSSIUM INC.</span>
          <span className="sm:hidden">REPOLYZE</span>
          <span className="text-zinc-700">|</span>
          <span>V.2.0</span>
        </div>

        {/* Inner Content Padding */}
        <div className="p-0.5 sm:p-1">{children}</div>
      </div>
    </div>
  );
}
