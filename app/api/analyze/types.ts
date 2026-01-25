// api/analyze/types.ts
import { fetchRepoMetadata, calculateFileStats } from "@/lib/github";
import { FileNode, BranchInfo } from "@/lib/types";
import { GeneratedRefactor } from "./refactor-generator";
import { GeneratedPR } from "./pr-generator";

export interface EnvConfig {
  OPENROUTER_API_KEY: string;
  GITHUB_TOKEN: string | undefined;
}

export interface StreamEventPullRequests {
  type: "pullRequests";
  data: GeneratedPR[];
}

export interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

export interface StreamEventMetadata {
  type: "metadata";
  data: {
    metadata: RepoMetadata;
    fileTree: FileNode[];
    fileStats: FileStats;
    branch: string;
    availableBranches: BranchInfo[];
  };
}

export interface StreamEventContent {
  type: "content";
  data: string;
}

export interface StreamEventError {
  type: "error";
  data: string;
}

export interface StreamEventDone {
  type: "done";
}

export interface StreamEventScores {
  type: "scores";
  data: {
    overall: number;
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
    breakdown: Record<string, { score: number; factors: string[] }>;
  };
}

export interface StreamEventAutomations {
  type: "automations";
  data: Array<{
    id: string;
    type: "issue" | "pull-request" | "workflow";
    title: string;
    description: string;
    body: string;
    labels: string[];
    priority: "low" | "medium" | "high";
    category: string;
    estimatedEffort: string;
    files?: string[];
  }>;
}

export interface StreamEventRefactors {
  type: "refactors";
  data: GeneratedRefactor[];
}

export type StreamEvent =
  | StreamEventMetadata
  | StreamEventContent
  | StreamEventError
  | StreamEventDone
  | StreamEventScores
  | StreamEventAutomations
  | StreamEventRefactors
  | StreamEventPullRequests;

export type RepoMetadata = Awaited<ReturnType<typeof fetchRepoMetadata>>;
export type FileStats = ReturnType<typeof calculateFileStats>;

export interface AnalyzeRequestBody {
  url: string;
  branch?: string;
}

export interface HealthCheckResponse {
  status: "ok" | "misconfigured";
  timestamp: string;
  services: {
    openrouter: "configured" | "missing";
    github: "configured" | "optional";
  };
}

export interface ErrorResponse {
  error: string;
}

export interface PromptContext {
  metadata: RepoMetadata;
  fileStats: FileStats;
  compactTree: string;
  filesContent: string;
  branch: string;
}
