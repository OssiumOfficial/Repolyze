"use client";

import { ArrowUpRight, Github } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import ThemeToggle from "./ui/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="max-w-4xl mx-auto lg:px-0 px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="instrument-serif lg:text-3xl md:text-2xl text-xl">
              <h1>
                RepoGist
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              asChild
            >
              <Link
                href="https://github.com/Devsethi3/repo-gist"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5"
              >
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">GitHub</span>
                <ArrowUpRight className="h-3 w-3 opacity-50" />
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
