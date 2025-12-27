"use client";

import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { RepoAnalyzer } from "@/components/repo-analyzer";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative jetbrains-mono">
       <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
       <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-linear-to-b from-background via-background to-primary/2" />
        
        {/* Noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.35] dark:opacity-[0.09]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Subtle top glow */}
        <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl aspect-square bg-primary/5 rounded-full blur-[150px]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_80%)]" />
      </div>
      </div>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col relative">
        {/* Header */}
        <div className="pb-24">
          <HeroHeader />
        </div>

        {/* Hero Section */}
        <section className="relative flex-1">
          <div className="mx-auto px-2 sm:px-4 lg:px-5">
            <div className="flex flex-col items-center py-12 sm:py-16 lg:py-20">
              {/* Heading */}
              <div className="instrument-serif flex flex-col gap-2 px-6 lg:text-7xl md:text-5xl text-4xl">
                <h1 className="dark:text-white/30 text-secondary-foreground/50">
                  Understand{" "}
                  <span className="dark:text-white text-secondary-foreground">
                    Any
                  </span>{" "}
                  Code
                </h1>
                <h2 className="dark:text-white/30 -mt-1 text-secondary-foreground/50">
                  Instantly{" "}
                  <span className="relative inline-block">
                    <span className="dark:text-white text-secondary-foreground relative z-10">
                      In Seconds
                    </span>
                    {/* Unsymmetrical Underline SVG */}
                    <svg
                      className="absolute -bottom-2 w-full lg:h-3 h-1 left-0 text-primary z-0"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 5.5C15 3.5 45 2.5 60 4.5C75 6.5 90 8 98 5"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h2>
              </div>
            </div>

            {/* Analyzer Component Container */}
            <div className="relative pb-16 sm:pb-20 lg:pb-24">
              {/* Card wrapper for analyzer */}
              <div className="relative mx-auto max-w-4xl">
                <div className="">
                  <RepoAnalyzer />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
