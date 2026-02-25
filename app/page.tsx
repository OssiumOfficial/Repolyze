"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { RepoAnalyzer } from "@/components/repo-analyzer";
import { useAnalysis } from "@/hooks/use-analysis";
import { Sparkles } from "lucide-react";

function HomeContent() {
  const searchParams = useSearchParams();
  const { analyze } = useAnalysis();

  useEffect(() => {
    const repoParam = searchParams.get("repo");
    const branchParam = searchParams.get("branch");

    if (repoParam) {
      analyze(repoParam, branchParam || undefined);
    }
  }, [searchParams, analyze]);

  return (
    <div className="w-full relative jetbrains-mono">
      <div className="fixed inset-0 w-full h-full pointer-events-none -z-10">
        <div className="fixed inset-0 -z-10">
          {/* Base gradient */}
          <div className="absolute inset-0 bg-linear-to-b from-background via-background to-primary/2" />

          {/* Subtle top glow */}
          <div className="absolute -top-1/4 left-1/2 -translate-x-1/2 w-full max-w-3xl aspect-square bg-primary/5 rounded-full blur-[150px]" />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_80%)]" />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex flex-col relative">
        {/* Header */}
        <div className="pb-24">
          <HeroHeader />
        </div>
        <div className="flex justify-center">
          <div className="relative rounded-full py-3 transition-colors flex flex-col items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-medium text-primary">
              <Sparkles size={13} />Good News: Acquired by <a href="https://ossium.live" className="underline">Ossium Inc.</a>!
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative flex-1">
          <div className="mx-auto px-2 sm:px-4 lg:px-5">
            <div className="flex flex-col items-center py-6">
              {/* py-16 sm:py-16 lg:py-20 */}
              {/* Heading */}
              <div className="instrument-serif flex flex-col gap-2 px-6 lg:text-7xl md:text-5xl text-4xl">
                <h1 className="dark:text-white/30 text-secondary-foreground/50">
                  Understand{" "}
                  <span className="dark:text-white text-secondary-foreground">
                    Any
                  </span>{" "}
                  Codebase
                </h1>
                <h2 className="dark:text-white/30 -mt-1 text-secondary-foreground/50">
                  
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
                  {" "},{" "}Not in Hours.
                </h2>
              </div>
            </div>

            {/* Analyzer Component Container */}
            <div className="relative pb-16 sm:pb-20 lg:pb-24">
              <div className="relative mx-auto max-w-4xl">
                <RepoAnalyzer />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <HomeContent />
    </Suspense>
  );
}
