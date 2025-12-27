import { fetchRepoMetadata, calculateFileStats } from "@/lib/github";
import { FileNode } from "@/lib/types";

export interface EnvConfig {
  OPENROUTER_API_KEY: string;
  GITHUB_TOKEN: string | undefined;
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

export type StreamEvent =
  | StreamEventMetadata
  | StreamEventContent
  | StreamEventError
  | StreamEventDone;

export type RepoMetadata = Awaited<ReturnType<typeof fetchRepoMetadata>>;
export type FileStats = ReturnType<typeof calculateFileStats>;

export interface AnalyzeRequestBody {
  url: string;
}

export interface HealthCheckResponse {
  status: "ok" | "misconfigured";
  timestamp: string;
  services: {
    openrouter: "configured" | "missing";
    github: "configured" | "optional (rate-limited)";
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
}