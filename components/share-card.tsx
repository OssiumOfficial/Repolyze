"use client";

import { forwardRef } from "react";
import {
  Star,
  GitFork,
  Code,
  Shield,
  FileText,
  Wrench,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Eye,
  Activity,
  Zap,
  Hash,
  Terminal,
} from "lucide-react";
import { ShareCardData } from "@/lib/share";
import { cn } from "@/lib/utils";

interface ShareCardProps {
  data: ShareCardData;
  variant?: "default" | "compact" | "detailed";
  showWatermark?: boolean;
  className?: string;
}

// --- Score Configuration ---
function getScoreConfig(score: number) {
  if (score >= 90)
    return { label: "EXCELLENT", tier: "excellent" as const, hex: "#34d399" };
  if (score >= 70)
    return { label: "GOOD", tier: "good" as const, hex: "#38bdf8" };
  if (score >= 50)
    return { label: "FAIR", tier: "fair" as const, hex: "#fbbf24" };
  return { label: "POOR", tier: "poor" as const, hex: "#f43f5e" };
}

// Tier-based styling
const tierStyles = {
  excellent: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    gradient: "from-emerald-500 to-teal-400",
  },
  good: {
    text: "text-sky-400",
    bg: "bg-sky-500/10",
    border: "border-sky-500/20",
    gradient: "from-sky-500 to-blue-400",
  },
  fair: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    gradient: "from-amber-500 to-orange-400",
  },
  poor: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    gradient: "from-rose-500 to-red-400",
  },
};

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

// --- Sub-Components ---

const NoiseOverlay = () => (
  <div
    className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }}
  />
);

const TechPill = ({ tech, isPrimary = false }: { tech: string; isPrimary?: boolean }) => (
  <span
    className={cn(
      "px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wide border",
      isPrimary
        ? "bg-primary/10 text-primary border-primary/20"
        : "bg-zinc-900/50 text-zinc-400 border-white/5"
    )}
  >
    {tech}
  </span>
);

// --- The Industrial Frame Wrapper ---
const TechnicalFrame = ({
  children,
  config,
  className,
}: {
  children: React.ReactNode;
  config: ReturnType<typeof getScoreConfig>;
  className?: string;
}) => {
  const styles = tierStyles[config.tier];

  return (
    <div className={cn("relative bg-[#050505] p-8", className)}>
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />
      
      {/* Main Border Box (No Radius) */}
      <div className="relative h-full border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
        
        {/* Corner Brackets (Based on score color) */}
        <div className={cn("absolute -top-px -left-px w-4 h-4 border-t-2 border-l-2", styles.text, "border-current")} />
        <div className={cn("absolute -top-px -right-px w-4 h-4 border-t-2 border-r-2", styles.text, "border-current")} />
        <div className={cn("absolute -bottom-px -left-px w-4 h-4 border-b-2 border-l-2", styles.text, "border-current")} />
        <div className={cn("absolute -bottom-px -right-px w-4 h-4 border-b-2 border-r-2", styles.text, "border-current")} />

        {/* Top Label */}
        <div className="absolute -top-3 left-6 px-2 bg-[#050505] text-[9px] font-mono text-zinc-500 uppercase tracking-widest border-x border-zinc-900">
          SYS.ANALYSIS // <span className={styles.text}>{config.label}</span>
        </div>

        {/* Bottom Metadata */}
        <div className="absolute -bottom-3 right-6 px-2 bg-[#050505] text-[9px] font-mono text-zinc-600 uppercase tracking-widest border-x border-zinc-900 flex items-center gap-2">
          <span>REPOGIST_IO</span>
          <span className="text-zinc-700">|</span>
          <span>V.2.0</span>
        </div>

        {/* Inner Content Padding */}
        <div className="p-1">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Main Component ---

export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ data, variant = "default", showWatermark = true, className }, ref) => {
    const config = getScoreConfig(data.overallScore);
    const styles = tierStyles[config.tier];

    // Inner Card Base (The floating element inside the frame)
    const cardBase = cn(
      "relative overflow-hidden bg-zinc-900/80 text-zinc-200 select-none",
      "font-sans antialiased",
      // We keep slight rounding inside to contrast with the sharp frame, or 0 for total brutalism
      "rounded-sm", 
      "border border-white/5",
      className
    );

    // ==========================================
    // COMPACT VARIANT
    // ==========================================
    if (variant === "compact") {
      return (
        <div ref={ref} className="w-full max-w-110">
          <TechnicalFrame config={config}>
            <div className={cn(cardBase, "flex flex-col")}>
              <NoiseOverlay />
              
              {/* Gradient Top Line */}
              <div className={cn("h-0.5 w-full bg-linear-to-r", styles.gradient)} />

              <div className="p-5 relative z-10">
                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                   {/* Avatar Box */}
                  <div className="relative shrink-0">
                    <img
                      src={data.ownerAvatar}
                      alt={data.ownerLogin}
                      className="relative w-12 h-12 rounded bg-zinc-800 object-cover border border-white/10"
                      crossOrigin="anonymous"
                    />
                    {/* Status Dot */}
                    <div className={cn("absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-900", styles.bg.replace('/10', ''))} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-white truncate font-mono tracking-tight">
                      {data.repoName}
                    </h3>
                    <p className="text-xs text-zinc-500 truncate font-mono">
                      @{data.ownerLogin}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <span className={cn("text-3xl font-black leading-none", styles.text)}>
                      {data.overallScore}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-px bg-zinc-800/50 border border-zinc-800 mb-4">
                   <div className="bg-zinc-900/80 p-2 text-center">
                      <Star className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-zinc-300">{formatNumber(data.stars)}</span>
                   </div>
                   <div className="bg-zinc-900/80 p-2 text-center">
                      <GitFork className="w-3.5 h-3.5 text-sky-400 mx-auto mb-1" />
                      <span className="text-xs font-bold text-zinc-300">{formatNumber(data.forks)}</span>
                   </div>
                   <div className="bg-zinc-900/80 p-2 text-center">
                      <Code className="w-3.5 h-3.5 text-violet-400 mx-auto mb-1" />
                      <span className="text-[10px] font-bold text-zinc-300 truncate px-1">{data.language || 'N/A'}</span>
                   </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                    {data.techStack.slice(0, 4).map((tech) => (
                       <TechPill key={tech} tech={tech} />
                    ))}
                </div>
              </div>
            </div>
          </TechnicalFrame>
        </div>
      );
    }

    // ==========================================
    // DETAILED VARIANT
    // ==========================================
    if (variant === "detailed") {
      const breakdown = [
        { label: "Code Quality", value: data.scores.codeQuality, icon: Code },
        { label: "Security", value: data.scores.security, icon: Shield },
        { label: "Docs", value: data.scores.documentation, icon: FileText },
        { label: "Maintenance", value: data.scores.maintainability, icon: Wrench },
      ];

      return (
        <div ref={ref} className="w-full max-w-150">
          <TechnicalFrame config={config}>
            <div className={cardBase}>
              <NoiseOverlay />
              
              <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-8">
                  <div className="flex gap-4">
                     <div className="relative">
                        <img
                          src={data.ownerAvatar}
                          alt={data.ownerLogin}
                          className="w-16 h-16 rounded border border-white/10 bg-zinc-950"
                          crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 border border-white/10" />
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-1">
                           <h2 className="text-xl font-bold text-white tracking-tight">{data.repoName}</h2>
                           <span className={cn("px-1.5 py-0.5 rounded-[2px] text-[9px] uppercase font-bold text-zinc-950", styles.bg.replace('/10', ''))}>
                             {config.label}
                           </span>
                        </div>
                        <p className="text-sm text-zinc-400 font-mono mb-2">@{data.ownerLogin}</p>
                        {data.description && (
                          <p className="text-xs text-zinc-500 line-clamp-1 max-w-75">
                            {data.description}
                          </p>
                        )}
                     </div>
                  </div>
                  
                  {/* Big Score Box */}
                  <div className="text-right">
                     <div className={cn("text-6xl font-black tracking-tighter leading-none", styles.text)}>
                        {data.overallScore}
                     </div>
                  </div>
                </div>

                {/* Data Grid */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                   {breakdown.map((item) => {
                      const itemConfig = getScoreConfig(item.value);
                      const itemStyle = tierStyles[itemConfig.tier];
                      return (
                        <div key={item.label} className="group">
                           <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                              <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{item.label}</span>
                              <span className={cn("font-bold", itemStyle.text)}>{item.value}</span>
                           </div>
                           <div className="h-1.5 w-full bg-zinc-950 border border-zinc-800">
                              <div 
                                className={cn("h-full transition-all duration-500", itemStyle.bg.replace('/10', ''))} 
                                style={{ width: `${item.value}%` }} 
                              />
                           </div>
                        </div>
                      )
                   })}
                </div>

                {/* Footer Info */}
                <div className="flex items-center justify-between pt-4 border-t border-dashed border-zinc-800">
                   <div className="flex gap-6 font-mono text-xs">
                      <div className="flex items-center gap-2">
                         <span className="text-zinc-600">STARS</span>
                         <span className="text-zinc-300">{formatNumber(data.stars)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-zinc-600">FORKS</span>
                         <span className="text-zinc-300">{formatNumber(data.forks)}</span>
                      </div>
                   </div>

                   {showWatermark && (
                      <div className="flex items-center gap-2">
                         <Terminal className="w-3 h-3 text-zinc-600" />
                         <span className="text-[10px] font-bold text-zinc-500 tracking-widest uppercase">GENERATED BY REPOGIST</span>
                      </div>
                   )}
                </div>
              </div>
            </div>
          </TechnicalFrame>
        </div>
      );
    }

    // ==========================================
    // DEFAULT VARIANT
    // ==========================================
    return (
      <div ref={ref} className="w-full max-w-125">
        <TechnicalFrame config={config}>
          <div className={cardBase}>
            <NoiseOverlay />
            
            <div className="p-6 relative z-10">
              {/* Top Row */}
              <div className="flex justify-between items-start mb-6">
                 <div className="flex gap-4">
                    <img
                      src={data.ownerAvatar}
                      alt={data.ownerLogin}
                      className="w-14 h-14 rounded-sm border border-white/10 bg-zinc-950"
                      crossOrigin="anonymous"
                    />
                    <div>
                       <h3 className="text-lg font-bold text-white font-mono">{data.repoName}</h3>
                       <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-500 font-mono">@{data.ownerLogin}</span>
                          <span className="text-zinc-700">/</span>
                          <span className="text-xs text-zinc-400 font-mono">{data.language}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex flex-col items-end">
                    <span className={cn("text-5xl font-black tracking-tighter leading-none", styles.text)}>
                       {data.overallScore}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                       Total Score
                    </span>
                 </div>
              </div>

              {/* Metrics with "Technical" bars */}
              <div className="space-y-3 mb-6">
                 {[
                   { l: "CODE_QUALITY", v: data.scores.codeQuality },
                   { l: "SECURITY", v: data.scores.security },
                   { l: "MAINTAINABILITY", v: data.scores.maintainability }
                 ].map((m) => {
                   const mConfig = getScoreConfig(m.v);
                   const mStyle = tierStyles[mConfig.tier];
                   return (
                     <div key={m.l} className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-zinc-500 w-24 shrink-0">{m.l}</span>
                        <div className="flex-1 h-2 bg-zinc-950 border border-zinc-800 relative">
                           {/* Pattern inside bar */}
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik00IDBMIHAgNCIgc3Ryb2tlPSIjMjcyNzJhIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')] opacity-30" />
                           <div 
                              className={cn("h-full relative z-10", mStyle.bg.replace('/10', ''))} 
                              style={{ width: `${m.v}%` }} 
                           />
                        </div>
                        <span className={cn("text-xs font-mono font-bold w-8 text-right", mStyle.text)}>{m.v}</span>
                     </div>
                   )
                 })}
              </div>

              {/* Footer */}
              <div className="flex items-end justify-between pt-4 border-t border-dashed border-zinc-800">
                 <div className="flex flex-wrap gap-1.5 max-w-[65%]">
                    {data.techStack.slice(0, 4).map(t => (
                       <TechPill key={t} tech={t} />
                    ))}
                 </div>
                 
                 {showWatermark && (
                    <div className="text-right">
                       <div className="flex items-center justify-end gap-1.5 mb-0.5 opacity-60">
                          <Activity className="w-3 h-3 text-zinc-400" />
                          <span className="text-[9px] font-bold text-zinc-300 tracking-widest">REPOGIST</span>
                       </div>
                       <span className="text-[9px] text-zinc-600 font-mono">{data.analyzedAt.split(',')[0]}</span>
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

ShareCard.displayName = "ShareCard";
