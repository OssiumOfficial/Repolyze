"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Github, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import RepolyzeLogo from "@/components/icons/Repolyze-logo";

interface SharePageClientProps {
  repoFullName: string;
}

const REDIRECT_DELAY = 3;

export function SharePageClient({ repoFullName }: SharePageClientProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 100 / (REDIRECT_DELAY * 10);
      });
    }, 100);

    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const timer = setTimeout(() => {
      router.push(
        `/?repo=${encodeURIComponent(`https://github.com/${repoFullName}`)}`
      );
    }, REDIRECT_DELAY * 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
      clearTimeout(timer);
    };
  }, [repoFullName, router, isPaused]);

  const handleAnalyzeNow = () => {
    router.push(
      `/?repo=${encodeURIComponent(`https://github.com/${repoFullName}`)}`
    );
  };

  const handleViewOnGitHub = () => {
    window.open(
      `https://github.com/${repoFullName}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const [owner, repo] = repoFullName.split("/");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-200 h-200 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 left-1/4 w-150 h-150 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
              className="p-2.5 rounded-xl bg-primary/10 border border-primary/20"
            >
              <div className="flex items-center gap-2.5 group w-fit">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-colors" />
                  <RepolyzeLogo className="relative size-8 text-primary" />
                </div>
              </div>
            </motion.div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-medium instrument-serif tracking-wider text-foreground">
            Repolyze
          </h1>
          <p className="text-sm text-muted-foreground">
            AI-Powered Repository Analysis
          </p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-border/50 shadow-xl shadow-primary/5">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Shared badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="flex justify-center"
              >
                <Badge
                  variant="secondary"
                  className="gap-1.5 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Shared Analysis
                </Badge>
              </motion.div>

              {/* Repository info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground text-center">
                  Preparing analysis for
                </p>
                <div
                  className={cn(
                    "flex items-center justify-center gap-3",
                    "bg-muted/50 rounded-xl px-4 py-3.5",
                    "border border-border/50"
                  )}
                >
                  <div className="p-2 rounded-lg bg-background border border-border shadow-sm">
                    <Github className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground font-medium">
                      {owner}
                    </p>
                    <p className="font-semibold text-foreground text-lg">
                      {repo}
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-center gap-2.5">
                  {/* Animated bars */}
                  <div className="flex items-center gap-0.5 h-4">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <motion.div
                        key={index}
                        className="w-1 rounded-full bg-primary origin-center"
                        animate={
                          isPaused
                            ? { height: "8px" }
                            : {
                                height: ["8px", "16px", "8px"],
                              }
                        }
                        transition={{
                          duration: 0.8,
                          repeat: isPaused ? 0 : Infinity,
                          delay: index * 0.1,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {isPaused ? "Paused" : "Loading Analysis"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-2.5">
                  <Progress value={progress} className="h-1.5" />
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-xs text-muted-foreground text-center">
                      Redirecting in{" "}
                      <span className="font-mono font-semibold text-foreground tabular-nums">
                        {countdown}
                      </span>{" "}
                      second{countdown !== 1 ? "s" : ""}...
                    </p>
                    {/* Pause button for testing */}
                    <button
                      onClick={togglePause}
                      className="text-xs text-primary hover:underline"
                    >
                      {isPaused ? "Resume" : "Pause"}
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-3 text-xs text-muted-foreground">
                    or continue manually
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3 w-full"
              >
                <Button
                  onClick={handleAnalyzeNow}
                  className="lg:w-1/2 w-full gap-2"
                  size="lg"
                >
                  <span>Analyze Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleViewOnGitHub}
                  className="lg:w-1/2 w-full gap-2"
                  size="lg"
                >
                  <Github className="w-4 h-4" />
                  <span>View on GitHub</span>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="text-center space-y-1"
        >
          <p className="text-xs text-muted-foreground">
            The analysis will start automatically when redirected
          </p>
        </motion.div>
      </div>
    </div>
  );
}
