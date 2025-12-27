"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ui/theme-toggle";
import RepoGistLogo from "./icons/repogist-logo";
import Link from "next/link";

import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

export const HeroHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav className="fixed z-20 w-full px-2">
        <div
          className={cn(
            `
      mx-auto mt-2
      w-full max-w-6xl
      px-3 sm:px-4 lg:px-6
      bg-background/60
      backdrop-blur-lg
      rounded-2xl
      border
      transition-all duration-300
      overflow-hidden
      `,
            isScrolled && "max-w-4xl px-3 sm:px-4 lg:px-5"
          )}
        >
          <div className="flex items-center justify-between gap-2 py-3 lg:py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <RepoGistLogo className="relative size-7 sm:size-8 text-primary" />
              </div>
              <h1 className="instrument-serif text-lg sm:text-xl md:text-2xl truncate">
                RepoGist
              </h1>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />

              <Button asChild variant="outline">
                <Link
                  href="https://github.com/Devsethi3/repo-gist"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HugeiconsIcon
                    icon={GithubIcon}
                    className="w-4 h-4 text-foreground/70"
                    strokeWidth={1.5}
                  />{" "}
                  <span className="hidden sm:inline">GitHub</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
