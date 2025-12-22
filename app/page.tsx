"use client"
import { RepoAnalyzer } from "@/components/repo-analyzer";
import { Header } from "@/components/header";
import { motion } from "framer-motion";

export default function Home() {
   const bars = [
    { height: "65%", opacity: 0.3 },
    { height: "50%", opacity: 0.4 },
    { height: "40%", opacity: 0.5 },
    { height: "30%", opacity: 0.6 },
    { height: "25%", opacity: 0.7 },
    { height: "20%", opacity: 0.8 },
    { height: "15%", opacity: 0.9 }, // Center
    { height: "20%", opacity: 0.8 },
    { height: "25%", opacity: 0.7 },
    { height: "30%", opacity: 0.6 },
    { height: "40%", opacity: 0.5 },
    { height: "50%", opacity: 0.4 },
    { height: "65%", opacity: 0.3 },
  ];
  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />

      {/* Bar */}

      <div className="absolute inset-0 flex items-end w-full h-full gap-0 justify-between pb-0 pointer-events-none">
          {bars.map((bar, index) => (
            <motion.div
              key={index}
              className="w-full rounded-t-sm bg-linear-to-t from-yellow-400 via-yellow-400/60 dark:from-yellow-600 dark:via-yellow-600/60 to-transparent"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: bar.height, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: Math.abs(index - Math.floor(bars.length / 2)) * 0.1,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Gradient Overlay to fade top and bottom */}
        <div className="absolute inset-0 bg-linear-to-b from-white via-transparent to-white/60 dark:from-zinc-950 dark:via-transparent dark:to-zinc-950/30 pointer-events-none" />


      {/* Hero Section */}
      <section className="relative flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center py-12 sm:py-16 lg:py-20">
            {/* Heading */}
            <div className="instrument-serif flex flex-col gap-2 px-6 lg:text-6xl md:text-5xl sm:text-4xl text-3xl">
              <h1 className="dark:text-white/30 text-secondary-foreground/50">
                Don't Just{" "}
                <span className="dark:text-white text-secondary-foreground">
                  Read
                </span>{" "}
                The Code
              </h1>
              <h2 className="dark:text-white/30 -mt-1 text-secondary-foreground/50">
                Instantly{" "}
                <span className="relative inline-block">
                  <span className="dark:text-white text-secondary-foreground relative z-10">
                    Understand It
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
  );
}
