"use client";

import { useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShareModal } from "@/components/share-modal";
import { AnalysisResult } from "@/lib/types";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

import { AnalysisHeaderProps, StatItem } from "./types";
import { generateExtendedAnalysis } from "./utils";
import { InfoSection } from "./info-section";
import { TechBadge } from "./tech-badge";
import { CommandStep } from "./command-step";
import { FolderCard } from "./folder-card";
import { BranchSelector } from "./branch-selector";
import { ExportActions } from "./export-actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  StarIcon,
  GitForkIcon,
  ViewIcon,
  SourceCodeIcon,
  LicenseIcon,
  Copy01Icon,
  Clock01Icon,
  UserMultiple02Icon,
  ComputerTerminal01Icon,
  Folder01Icon,
  RocketIcon,
  Target01Icon,
  Layers01Icon,
  Search01Icon,
  LaptopIssueIcon,
  Tick01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";

export function AnalysisHeader({
  metadata,
  techStack,
  summary,
  result,
  branch,
  availableBranches,
  onBranchChange,
  isLoading = false,
  tier = "anonymous",
}: AnalysisHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const handleCopyUrl = useCallback(async () => {
    await navigator.clipboard.writeText(
      `https://github.com/${metadata.fullName}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [metadata.fullName]);

  const shareResult: Partial<AnalysisResult> = useMemo(() => {
    if (result) return { ...result, branch };
    return { metadata, techStack, summary, branch };
  }, [result, metadata, techStack, summary, branch]);

  const extendedAnalysis = useMemo(() => {
    return generateExtendedAnalysis(metadata, techStack, result);
  }, [metadata, techStack, result]);

  const currentBranch = branch || metadata.defaultBranch;

  const stats: StatItem[] = useMemo(
    () => [
      {
        icon: StarIcon,
        value: metadata.stars,
        label: "Stars",
        highlight: true,
      },
      {
        icon: GitForkIcon,
        value: metadata.forks,
        label: "Forks",
        highlight: false,
      },
      {
        icon: ViewIcon,
        value: metadata.watchers,
        label: "Watchers",
        highlight: false,
      },
      {
        icon: LaptopIssueIcon,
        value: metadata.openIssues,
        label: "Issues",
        highlight: false,
      },
    ],
    [metadata.stars, metadata.forks, metadata.watchers, metadata.openIssues]
  );

  return (
    <>
      <Card className="border-border/60 overflow-hidden p-0 bg-background">
        <div className="p-4 sm:p-6">
          {/* Top Row: Avatar, Info, Actions */}
          <div className="flex gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative shrink-0 flex items-start justify-center">
              <Image
                src={metadata.owner.avatarUrl}
                alt={metadata.owner.login}
                width={56}
                height={56}
                unoptimized
                className="relative z-10 h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 border-background object-cover"
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg instrument-serif tracking-wide sm:text-2xl text-foreground truncate">
                  {metadata.name}
                </h1>
                <Badge
                  variant={metadata.isPrivate ? "secondary" : "outline"}
                  className={cn(
                    "text-[10px] sm:text-xs shrink-0",
                    !metadata.isPrivate && "border-primary/30 text-primary"
                  )}
                >
                  {metadata.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground">
                <Link
                  href={`https://github.com/${metadata.owner.login}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline"
                >
                  @{metadata.owner.login}
                </Link>
              </p>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-start gap-2 shrink-0">
              <ExportActions result={shareResult} tier={tier} />

              <div className="w-px h-10 bg-border/50 mx-1" />

              {/* Share & GitHub */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="h-10 gap-1.5"
              >
                <HugeiconsIcon icon={SentIcon} className="w-4 h-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    className="w-4 h-4 text-primary"
                  />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4" />
                )}
              </Button>
              <Button variant="outline" size="sm" className="h-10" asChild>
                <Link
                  href={`https://github.com/${metadata.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <HugeiconsIcon
                    icon={GithubIcon}
                    className="w-3.5 h-3.5 mr-1.5"
                  />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>

          {metadata.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-3 sm:mt-4">
              {metadata.description}
            </p>
          )}

          {/* Meta Badges Row */}
          <div className="mt-4">
            {/* Mobile: Full-width Branch Selector */}
            {availableBranches &&
              availableBranches.length > 1 &&
              onBranchChange && (
                <div className="sm:hidden mb-3">
                  <BranchSelector
                    currentBranch={currentBranch}
                    branches={availableBranches}
                    onBranchChange={onBranchChange}
                    disabled={isLoading}
                    fullWidth
                  />
                </div>
              )}

            {/* Scrollable badges */}
            <ScrollArea className="w-full">
              <div className="flex items-center gap-1.5 pb-1">
                {metadata.language && (
                  <Badge className="text-[10px] sm:text-xs shrink-0 gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <HugeiconsIcon icon={SourceCodeIcon} className="w-3 h-3" />
                    {metadata.language}
                  </Badge>
                )}
                {metadata.license && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs shrink-0 gap-1"
                  >
                    <HugeiconsIcon icon={LicenseIcon} className="w-3 h-3" />
                    {metadata.license}
                  </Badge>
                )}
                {/* Branch Selector - Desktop only (inline) */}
                <div className="hidden sm:block">
                  {availableBranches &&
                  availableBranches.length > 0 &&
                  onBranchChange ? (
                    <BranchSelector
                      currentBranch={currentBranch}
                      branches={availableBranches}
                      onBranchChange={onBranchChange}
                      disabled={isLoading}
                    />
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[10px] sm:text-xs shrink-0 gap-1"
                    >
                      <HugeiconsIcon
                        icon={SourceCodeIcon}
                        className="w-3 h-3"
                      />
                      {currentBranch}
                    </Badge>
                  )}
                </div>
                {/* Mobile: Show branch as badge when no selector available */}
                {(!availableBranches ||
                  availableBranches.length <= 1 ||
                  !onBranchChange) && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs shrink-0 gap-1 sm:hidden"
                  >
                    <HugeiconsIcon icon={SourceCodeIcon} className="w-3 h-3" />
                    {currentBranch}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs shrink-0 gap-1"
                >
                  <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" />
                  {formatDate(metadata.pushedAt)}
                </Badge>
              </div>
              <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
            </ScrollArea>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {stats.map(({ icon, value, label, highlight }) => (
              <div
                key={label}
                className={cn(
                  "group flex items-center gap-2.5 p-3 rounded-lg transition-colors cursor-default border",
                  highlight
                    ? "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    : "bg-muted/20 border-border/40 hover:bg-muted/40"
                )}
              >
                <div
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    highlight
                      ? "bg-primary/10 group-hover:bg-primary/20"
                      : "bg-muted/60"
                  )}
                >
                  <HugeiconsIcon
                    icon={icon}
                    className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4",
                      highlight ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-sm sm:text-base tabular-nums",
                      highlight ? "text-primary" : "text-foreground"
                    )}
                  >
                    {formatNumber(value)}
                  </div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">
                    {label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden gap-2 mt-4">
            <ExportActions result={shareResult} tier={tier} className="flex-1" />
          </div>

          {/* Mobile Secondary Actions */}
          <div className="flex sm:hidden gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={() => setShareModalOpen(true)}
            >
              <HugeiconsIcon icon={SentIcon} className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <HugeiconsIcon
                  icon={Tick01Icon}
                  className="w-3.5 h-3.5 text-primary"
                />
              ) : (
                <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              className="flex-1 h-9 bg-primary hover:bg-primary/90"
              asChild
            >
              <Link
                href={`https://github.com/${metadata.fullName}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HugeiconsIcon
                  icon={GithubIcon}
                  className="w-3.5 h-3.5 mr-1.5"
                />
                GitHub
              </Link>
            </Button>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6 pt-4 space-y-4 border-t border-border/50">
          {/* What This Repo Does */}
          <InfoSection
            icon={RocketIcon}
            title="What This Repo Does"
            description="A plain English explanation of this project"
            accentColor="primary"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              {extendedAnalysis.whatItDoes}
            </p>
          </InfoSection>

          {/* Who It's For */}
          <InfoSection
            icon={UserMultiple02Icon}
            title="Who It's For"
            description="The target audience for this project"
            accentColor="blue"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              {extendedAnalysis.targetAudience}
            </p>
          </InfoSection>

          {/* Tech Stack */}
          {techStack && techStack.length > 0 && (
            <InfoSection
              icon={Layers01Icon}
              title="Tech Stack"
              description="Technologies and frameworks used"
              accentColor="purple"
              count={techStack.length}
            >
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech, index) => (
                  <TechBadge key={tech} name={tech} isPrimary={index < 3} />
                ))}
              </div>
            </InfoSection>
          )}

          {/* How to Run Locally */}
          <InfoSection
            icon={ComputerTerminal01Icon}
            title="How to Run Locally"
            description="Quick start commands to get this running"
            accentColor="green"
          >
            <div className="space-y-2">
              {extendedAnalysis.howToRun.map((step, index) => (
                <CommandStep key={index} step={index + 1} command={step} />
              ))}
            </div>
          </InfoSection>

          {/* Key Folders Explained */}
          {extendedAnalysis.keyFolders.length > 0 && (
            <InfoSection
              icon={Folder01Icon}
              title="Key Folders Explained"
              description="Understanding the project structure"
              accentColor="orange"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {extendedAnalysis.keyFolders.map((folder) => (
                  <FolderCard
                    key={folder.name}
                    name={folder.name}
                    description={folder.description}
                  />
                ))}
              </div>
            </InfoSection>
          )}

          {/* Topics */}
          {metadata.topics?.length > 0 && (
            <InfoSection
              icon={Target01Icon}
              title="Topics"
              description="Related categories and tags"
              accentColor="cyan"
              count={metadata.topics.length}
            >
              <ScrollArea className="w-full">
                <div className="flex gap-1.5 pb-1">
                  {metadata.topics.slice(0, 15).map((topic, index) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className={cn(
                        "text-[10px] sm:text-xs shrink-0 transition-colors cursor-default",
                        index === 0
                          ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                          : "bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      {topic}
                    </Badge>
                  ))}
                  {metadata.topics.length > 15 && (
                    <span className="text-[10px] sm:text-xs text-muted-foreground/50 self-center shrink-0 pl-1">
                      +{metadata.topics.length - 15}
                    </span>
                  )}
                </div>
                <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
              </ScrollArea>
            </InfoSection>
          )}

          {/* AI Summary */}
          {summary && (
            <InfoSection
              icon={Search01Icon}
              title="AI Summary"
              description="Intelligent analysis of this repository"
              accentColor="primary"
              isHighlighted
            >
              <p className="text-sm text-foreground/80 leading-relaxed">
                {summary}
              </p>
            </InfoSection>
          )}
        </CardContent>
      </Card>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        result={shareResult}
      />
    </>
  );
}

export { BranchSelector } from "./branch-selector";
export { ExportActions } from "./export-actions";
