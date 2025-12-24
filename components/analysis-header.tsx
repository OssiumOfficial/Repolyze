"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Star,
  GitFork,
  Eye,
  ExternalLink,
  Code,
  Scale,
  CircleDot,
  Copy,
  Check,
  GitBranch,
  Clock,
  Sparkles,
  Share2,
  Users,
  Terminal,
  FolderTree,
  Rocket,
  Target,
  Layers,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShareModal } from "@/components/share-modal";
import { RepoMetadata, AnalysisResult, FileNode } from "@/lib/types";
import { formatNumber, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

interface AnalysisHeaderProps {
  metadata: RepoMetadata;
  techStack?: string[];
  summary?: string;
  result?: Partial<AnalysisResult>;
}

// Extended analysis data that we'll extract or generate
interface ExtendedAnalysis {
  whatItDoes: string;
  targetAudience: string;
  howToRun: string[];
  keyFolders: { name: string; description: string }[];
}

export function AnalysisHeader({
  metadata,
  techStack,
  summary,
  result,
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

  // Create share result
  const shareResult: Partial<AnalysisResult> = useMemo(() => {
    if (result) return result;
    return { metadata, techStack, summary };
  }, [result, metadata, techStack, summary]);

  // Generate extended analysis from available data
  // Now properly uses result.whatItDoes and result.targetAudience from AI response
  const extendedAnalysis: ExtendedAnalysis = useMemo(() => {
    return generateExtendedAnalysis(metadata, techStack, result);
  }, [metadata, techStack, result]);

  const stats = useMemo(
    () => [
      { icon: Star, value: metadata.stars, label: "Stars", highlight: true },
      {
        icon: GitFork,
        value: metadata.forks,
        label: "Forks",
        highlight: false,
      },
      {
        icon: Eye,
        value: metadata.watchers,
        label: "Watchers",
        highlight: false,
      },
      {
        icon: CircleDot,
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
        {/* Main Header Section */}
        <div className="p-4 sm:p-6">
          {/* Top Row: Avatar, Info, Actions */}
          <div className="flex gap-3 sm:gap-4">
            {/* Avatar with primary accent ring */}
            <div className="relative shrink-0 flex items-start justify-center">
              <div
                aria-hidden
                className="absolute inset-0 rounded-xl bg-primary/30 blur-md scale-110 md:hidden block"
              />
              <Image
                src={metadata.owner.avatarUrl}
                alt={metadata.owner.login}
                width={56}
                height={56}
                loading="lazy"
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

              {metadata.description && (
                <p className="hidden sm:block text-sm text-muted-foreground leading-relaxed line-clamp-1 pt-1">
                  {metadata.description}
                </p>
              )}
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-start gap-1.5 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={() => setShareModalOpen(true)}
              >
                <Share2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                onClick={handleCopyUrl}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                asChild
              >
                <Link
                  href={`https://github.com/${metadata.fullName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  GitHub
                </Link>
              </Button>
            </div>
          </div>

          {/* Description - Mobile only */}
          {metadata.description && (
            <p className="sm:hidden text-sm text-muted-foreground leading-relaxed line-clamp-2 mt-3">
              {metadata.description}
            </p>
          )}

          {/* Meta Badges Row */}
          <div className="mt-4">
            <ScrollArea className="w-full">
              <div className="flex items-center gap-1.5 pb-1">
                {metadata.language && (
                  <Badge className="text-[10px] sm:text-xs shrink-0 gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                    <Code className="w-3 h-3" />
                    {metadata.language}
                  </Badge>
                )}
                {metadata.license && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs shrink-0 gap-1"
                  >
                    <Scale className="w-3 h-3" />
                    {metadata.license}
                  </Badge>
                )}
                {metadata.defaultBranch && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs shrink-0 gap-1"
                  >
                    <GitBranch className="w-3 h-3" />
                    {metadata.defaultBranch}
                  </Badge>
                )}
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs shrink-0 gap-1"
                >
                  <Clock className="w-3 h-3" />
                  {formatDate(metadata.pushedAt)}
                </Badge>
              </div>
              <ScrollBar orientation="horizontal" className="h-0 opacity-0" />
            </ScrollArea>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {stats.map(({ icon: Icon, value, label, highlight }) => (
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
                  <Icon
                    className={cn(
                      "w-3.5 h-3.5 sm:w-4 sm:h-4",
                      highlight ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="min-w-0">
                  <div
                    className={cn(
                      "text-sm sm:text-base font-semibold tabular-nums",
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
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-primary" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
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
                <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                GitHub
              </Link>
            </Button>
          </div>
        </div>

        {/* Extended Information Section */}
        <CardContent className="p-4 sm:p-6 pt-0 space-y-4 border-t border-border/50">
          {/* What This Repo Does - Uses AI-generated whatItDoes */}
          <InfoSection
            icon={Rocket}
            title="What This Repo Does"
            description="A plain English explanation of this project"
            accentColor="primary"
          >
            <p className="text-sm text-foreground/80 leading-relaxed">
              {extendedAnalysis.whatItDoes}
            </p>
          </InfoSection>

          {/* Who It's For - Uses AI-generated targetAudience */}
          <InfoSection
            icon={Users}
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
              icon={Layers}
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

          {/* How to Run Locally - Uses AI-generated howToRun */}
          <InfoSection
            icon={Terminal}
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

          {/* Key Folders Explained - Uses AI-generated keyFolders */}
          {extendedAnalysis.keyFolders.length > 0 && (
            <InfoSection
              icon={FolderTree}
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
              icon={Target}
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

          {/* AI Summary - Uses the separate summary field */}
          {summary && (
            <InfoSection
              icon={Search}
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

// ============================================
// Sub-components
// ============================================

interface InfoSectionProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  accentColor?: "primary" | "blue" | "green" | "purple" | "orange" | "cyan";
  count?: number;
  isHighlighted?: boolean;
  children: React.ReactNode;
}

function InfoSection({
  icon: Icon,
  title,
  description,
  accentColor = "primary",
  count,
  isHighlighted = false,
  children,
}: InfoSectionProps) {
  const colorClasses = {
    primary: {
      iconBg: "bg-primary/10",
      iconText: "text-primary",
      border: "border-primary/10",
      bg: "bg-primary/5",
    },
    blue: {
      iconBg: "bg-blue-500/10",
      iconText: "text-blue-500",
      border: "border-blue-500/10",
      bg: "bg-blue-500/5",
    },
    green: {
      iconBg: "bg-green-500/10",
      iconText: "text-green-500",
      border: "border-green-500/10",
      bg: "bg-green-500/5",
    },
    purple: {
      iconBg: "bg-purple-500/10",
      iconText: "text-purple-500",
      border: "border-purple-500/10",
      bg: "bg-purple-500/5",
    },
    orange: {
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-500",
      border: "border-orange-500/10",
      bg: "bg-orange-500/5",
    },
    cyan: {
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-500",
      border: "border-cyan-500/10",
      bg: "bg-cyan-500/5",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-4 first:pt-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 rounded-md", colors.iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", colors.iconText)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {count !== undefined && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {count}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-3 sm:p-4 rounded-lg border",
          isHighlighted ? colors.bg : "bg-muted/20",
          isHighlighted ? colors.border : "border-border/40"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}

interface TechBadgeProps {
  name: string;
  isPrimary?: boolean;
}

function TechBadge({ name, isPrimary = false }: TechBadgeProps) {
  const icon = getTechIcon(name);

  return (
    <Badge
      variant={isPrimary ? "default" : "secondary"}
      className={cn(
        "gap-1.5 text-xs py-1 px-2.5 transition-all cursor-default",
        isPrimary
          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
          : "hover:bg-muted/60"
      )}
    >
      {icon && <span className="text-sm">{icon}</span>}
      {name}
    </Badge>
  );
}

interface CommandStepProps {
  step: number;
  command: string;
}

function CommandStep({ step, command }: CommandStepProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group flex items-center gap-2 p-2 rounded-md bg-primary/10 border hover:border-primary/20 transition-colors">
      <span className="flex items-center justify-center w-5 h-5 rounded text-[10px] font-medium bg-primary/10 text-primary shrink-0">
        {step}
      </span>
      <code className="flex-1 text-xs sm:text-sm jetbrains-mono truncate">
        {command}
      </code>
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-3 h-3 text-green-500" />
        ) : (
          <Copy className="w-3 h-3 text-muted-foreground" />
        )}
      </Button>
    </div>
  );
}

interface FolderCardProps {
  name: string;
  description: string;
}

function FolderCard({ name, description }: FolderCardProps) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
      <div className="p-1.5 rounded bg-orange-500/10 shrink-0">
        <FolderTree className="w-3 h-3 text-orange-500" />
      </div>
      <div className="min-w-0">
        <code className="text-xs font-medium text-foreground">{name}</code>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  );
}

// ============================================
// Helper Functions
// ============================================

function generateExtendedAnalysis(
  metadata: RepoMetadata,
  techStack?: string[],
  result?: Partial<AnalysisResult>
): ExtendedAnalysis {
  const language = metadata.language?.toLowerCase() || "";
  const topics = metadata.topics || [];
  const description = metadata.description || "";

  // FIXED: Use result.whatItDoes from AI response, NOT result.summary
  let whatItDoes = "";
  if (result?.whatItDoes) {
    // Use the AI-generated whatItDoes field
    whatItDoes = result.whatItDoes;
  } else if (description) {
    // Fallback to description
    whatItDoes = description;
  } else {
    // Generate a basic description
    whatItDoes = `${metadata.name} is a ${
      metadata.language || "software"
    } project maintained by ${metadata.owner.login}. `;
    if (topics.length > 0) {
      whatItDoes += `It focuses on ${topics.slice(0, 3).join(", ")}.`;
    }
  }

  // FIXED: Use result.targetAudience from AI response
  let targetAudience = "";
  if (result?.targetAudience) {
    // Use the AI-generated targetAudience field
    targetAudience = result.targetAudience;
  } else {
    // Fallback to generated audience based on topics
    targetAudience = generateTargetAudienceFallback(topics, metadata.language);
  }

  // FIXED: Use result.howToRun from AI response if available
  let howToRun: string[] = [];
  if (result?.howToRun && result.howToRun.length > 0) {
    howToRun = result.howToRun;
  } else {
    howToRun = generateRunCommands(
      language,
      techStack || [],
      metadata.fullName
    );
  }

  // FIXED: Use result.keyFolders from AI response if available
  let keyFolders: { name: string; description: string }[] = [];
  if (result?.keyFolders && result.keyFolders.length > 0) {
    keyFolders = result.keyFolders;
  } else {
    keyFolders = generateKeyFolders(
      result?.fileTree,
      language,
      techStack || []
    );
  }

  return {
    whatItDoes,
    targetAudience,
    howToRun,
    keyFolders,
  };
}

function generateTargetAudienceFallback(
  topics: string[],
  language?: string | null
): string {
  if (topics.includes("framework") || topics.includes("library")) {
    return "Developers looking for a reusable solution to integrate into their projects.";
  } else if (topics.includes("cli") || topics.includes("tool")) {
    return "Developers and DevOps engineers who need command-line automation tools.";
  } else if (topics.includes("api") || topics.includes("backend")) {
    return "Backend developers building services and APIs.";
  } else if (
    topics.includes("frontend") ||
    topics.includes("ui") ||
    topics.includes("react") ||
    topics.includes("vue")
  ) {
    return "Frontend developers building modern web applications and user interfaces.";
  } else if (
    topics.includes("mobile") ||
    topics.includes("ios") ||
    topics.includes("android")
  ) {
    return "Mobile developers creating native or cross-platform applications.";
  } else if (
    topics.includes("machine-learning") ||
    topics.includes("ai") ||
    topics.includes("deep-learning")
  ) {
    return "Data scientists and ML engineers working on AI/ML projects.";
  } else if (
    topics.includes("devops") ||
    topics.includes("docker") ||
    topics.includes("kubernetes")
  ) {
    return "DevOps engineers and system administrators managing infrastructure.";
  } else {
    return `Developers and teams working with ${
      language || "this technology"
    } who need a ${topics[0] || "quality"} solution.`;
  }
}

function generateRunCommands(
  language: string,
  techStack: string[],
  repoFullName: string
): string[] {
  const commands: string[] = [];
  const techLower = techStack.map((t) => t.toLowerCase());
  const repoName = repoFullName.split("/").pop() || repoFullName;

  // Clone command
  commands.push(`git clone https://github.com/${repoFullName}.git`);
  commands.push(`cd ${repoName}`);

  // Install and run based on stack
  if (techLower.includes("next.js") || techLower.includes("nextjs")) {
    commands.push("pnpm install  # or npm install");
    commands.push("pnpm dev      # starts development server");
  } else if (techLower.includes("react") || techLower.includes("vite")) {
    commands.push("npm install");
    commands.push("npm run dev");
  } else if (techLower.includes("vue") || techLower.includes("nuxt")) {
    commands.push("npm install");
    commands.push("npm run dev");
  } else if (language === "python") {
    commands.push("pip install -r requirements.txt");
    commands.push("python main.py  # or python app.py");
  } else if (language === "go") {
    commands.push("go mod download");
    commands.push("go run .");
  } else if (language === "rust") {
    commands.push("cargo build");
    commands.push("cargo run");
  } else if (language === "java") {
    commands.push("./mvnw install  # or ./gradlew build");
    commands.push("./mvnw spring-boot:run");
  } else if (language === "ruby") {
    commands.push("bundle install");
    commands.push("rails server  # or ruby app.rb");
  } else if (language === "php") {
    commands.push("composer install");
    commands.push("php artisan serve  # for Laravel");
  } else if (techLower.includes("docker")) {
    commands.push("docker-compose up -d");
  } else {
    // Generic JavaScript/TypeScript
    commands.push("npm install");
    commands.push("npm start");
  }

  return commands;
}

function generateKeyFolders(
  fileTree?: FileNode[],
  language?: string,
  techStack?: string[]
): { name: string; description: string }[] {
  const folders: { name: string; description: string }[] = [];
  const techLower = (techStack || []).map((t) => t.toLowerCase());

  if (fileTree && fileTree.length > 0) {
    const topDirs = fileTree
      .filter((node) => node.type === "directory")
      .slice(0, 8);

    for (const dir of topDirs) {
      const desc = getFolderDescription(dir.name, language, techLower);
      if (desc) {
        folders.push({ name: dir.name, description: desc });
      }
    }
  }

  if (folders.length === 0) {
    if (techLower.includes("next.js") || techLower.includes("nextjs")) {
      folders.push(
        { name: "app/", description: "App Router pages and layouts" },
        { name: "components/", description: "Reusable React components" },
        { name: "lib/", description: "Utility functions and helpers" },
        { name: "public/", description: "Static assets (images, fonts)" }
      );
    } else if (techLower.includes("react")) {
      folders.push(
        { name: "src/", description: "Source code and components" },
        { name: "components/", description: "Reusable UI components" },
        { name: "hooks/", description: "Custom React hooks" },
        { name: "public/", description: "Static assets" }
      );
    } else if (language === "python") {
      folders.push(
        { name: "src/", description: "Main source code" },
        { name: "tests/", description: "Unit and integration tests" },
        { name: "docs/", description: "Documentation files" }
      );
    }
  }

  return folders.slice(0, 6);
}

function getFolderDescription(
  name: string,
  language?: string,
  techStack?: string[]
): string | null {
  const folderDescriptions: Record<string, string> = {
    src: "Main source code directory",
    lib: "Utility functions and shared libraries",
    utils: "Helper functions and utilities",
    helpers: "Helper functions and utilities",
    config: "Configuration files and settings",
    scripts: "Build and automation scripts",
    tests: "Unit and integration tests",
    test: "Test files and test utilities",
    __tests__: "Jest test files",
    spec: "Test specifications",
    docs: "Documentation and guides",
    examples: "Example code and demos",
    samples: "Sample implementations",
    app: "Application routes and pages (App Router)",
    pages: "Page components and routes",
    components: "Reusable UI components",
    ui: "UI component library",
    hooks: "Custom React/Vue hooks",
    stores: "State management stores",
    store: "State management (Redux/Vuex)",
    context: "React Context providers",
    contexts: "React Context providers",
    styles: "CSS and styling files",
    assets: "Static assets (images, fonts)",
    public: "Publicly served static files",
    static: "Static files and assets",
    api: "API routes and endpoints",
    routes: "Route definitions",
    controllers: "Request handlers",
    models: "Data models and schemas",
    services: "Business logic services",
    middleware: "Middleware functions",
    database: "Database migrations and seeds",
    db: "Database related files",
    migrations: "Database migration files",
    types: "TypeScript type definitions",
    interfaces: "Interface definitions",
    constants: "Constant values and enums",
    providers: "Service providers",
    plugins: "Plugin implementations",
    modules: "Feature modules",
    features: "Feature-based modules",
    core: "Core functionality",
    common: "Shared/common code",
    shared: "Shared utilities and types",
    build: "Build output directory",
    dist: "Distribution/compiled files",
    out: "Output directory",
    ".github": "GitHub Actions and workflows",
    ".vscode": "VS Code configuration",
    docker: "Docker configuration files",
    deploy: "Deployment configurations",
    infra: "Infrastructure as code",
    terraform: "Terraform configurations",
    k8s: "Kubernetes manifests",
    kubernetes: "Kubernetes configurations",
    packages: "Monorepo packages",
    apps: "Application packages (monorepo)",
    prisma: "Prisma schema and migrations",
    drizzle: "Drizzle ORM configuration",
    supabase: "Supabase configuration",
  };

  const lowerName = name.toLowerCase().replace(/\/$/, "");
  return folderDescriptions[lowerName] || null;
}

function getTechIcon(tech: string): string | null {
  const techIcons: Record<string, string> = {
    typescript: "📘",
    javascript: "📒",
    python: "🐍",
    rust: "🦀",
    go: "🐹",
    java: "☕",
    ruby: "💎",
    php: "🐘",
    swift: "🍎",
    kotlin: "🎯",
    "c#": "🔷",
    "c++": "⚡",
    react: "⚛️",
    "next.js": "▲",
    nextjs: "▲",
    vue: "💚",
    "vue.js": "💚",
    angular: "🅰️",
    svelte: "🔶",
    nuxt: "💚",
    "nuxt.js": "💚",
    remix: "💿",
    astro: "🚀",
    "node.js": "💚",
    nodejs: "💚",
    express: "🚂",
    fastify: "⚡",
    nestjs: "🐱",
    django: "🎸",
    flask: "🧪",
    fastapi: "⚡",
    rails: "💎",
    laravel: "🔴",
    spring: "🌱",
    postgresql: "🐘",
    postgres: "🐘",
    mysql: "🐬",
    mongodb: "🍃",
    redis: "🔴",
    sqlite: "📦",
    prisma: "🔷",
    drizzle: "💧",
    supabase: "⚡",
    docker: "🐳",
    kubernetes: "☸️",
    aws: "☁️",
    vercel: "▲",
    netlify: "🔷",
    github: "🐙",
    graphql: "💜",
    rest: "🔗",
    trpc: "🔷",
    tailwindcss: "🎨",
    "tailwind css": "🎨",
    css: "🎨",
    sass: "💅",
    scss: "💅",
    "styled-components": "💅",
    jest: "🃏",
    vitest: "⚡",
    playwright: "🎭",
    cypress: "🌲",
    redux: "💜",
    zustand: "🐻",
    jotai: "👻",
    recoil: "⚛️",
    tensorflow: "🧠",
    pytorch: "🔥",
    openai: "🤖",
    langchain: "🦜",
  };

  const lowerTech = tech.toLowerCase();
  return techIcons[lowerTech] || null;
}
