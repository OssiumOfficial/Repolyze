"use client";

import { Footer } from "@/components/footer";
import { HeroHeader } from "@/components/header";
import { RepoAnalyzer } from "@/components/repo-analyzer";

export default function Home() {
  return (
    <div className="min-h-screen w-full relative jetbrains-mono">
      <div className="fixed inset-0 flex items-end w-full h-screen gap-0 justify-between pb-0 pointer-events-none -z-10">
        {/* TODO: Background here */}
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
