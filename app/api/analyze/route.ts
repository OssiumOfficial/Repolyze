/**
 * @fileoverview GitHub Repository Analysis API Endpoint
 *
 * This API endpoint analyzes GitHub repositories using AI to provide
 * comprehensive insights including code quality scores, architecture
 * analysis, refactoring suggestions, and more.
 *
 * @example
 * // Request
 * POST /api/analyze
 * Content-Type: application/json
 * {
 *   "url": "https://github.com/owner/repo"
 * }
 *
 * @example
 * // Response (Server-Sent Events stream)
 * data: {"type":"metadata","data":{...}}
 * data: {"type":"content","data":"..."}
 * data: {"type":"done"}
 */

import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchImportantFiles,
  calculateFileStats,
  createCompactTreeString,
} from "@/lib/github";
import { validateGitHubUrl } from "@/lib/validators";
import type { RepoMetadata, FileNode, FileStats } from "@/lib/types";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Request body for the analyze endpoint
 */
interface AnalyzeRequestBody {
  /** GitHub repository URL (e.g., "https://github.com/owner/repo") */
  url: string;
}

/**
 * Rate limit check result
 */
interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
}

/**
 * Rate limit record stored in memory
 */
interface RateLimitRecord {
  /** Number of requests made in current window */
  count: number;
  /** Timestamp when the rate limit window resets */
  resetTime: number;
}

/**
 * Server-Sent Event types
 */
type SSEEventType = "metadata" | "content" | "error" | "done";

/**
 * Metadata event payload sent at the start of the stream
 */
interface MetadataEventPayload {
  metadata: RepoMetadata;
  fileTree: FileNode[];
  fileStats: FileStats;
}

/**
 * SSE event structure
 */
interface SSEEvent {
  type: SSEEventType;
  data?: MetadataEventPayload | string;
}

/**
 * AI analysis response structure (parsed from AI output)
 *
 * @remarks
 * This is the expected JSON structure from the AI model.
 * The actual response is streamed and parsed on the client side.
 */
interface AIAnalysisResponse {
  /** Technical summary of the repository (2-3 sentences) */
  summary: string;

  /** Plain English explanation for non-technical users */
  whatItDoes: string;

  /** Description of the target audience */
  targetAudience: string;

  /** List of technologies, frameworks, and tools used */
  techStack: string[];

  /** Commands to clone and run the project locally */
  howToRun: string[];

  /** Key directories with descriptions */
  keyFolders: Array<{
    name: string;
    description: string;
  }>;

  /** Quality scores (0-100) for various metrics */
  scores: {
    overall: number;
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
  };

  /** AI-generated insights about the codebase */
  insights: Array<{
    type: "strength" | "weakness" | "suggestion" | "warning";
    category: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high" | "critical";
    affectedFiles?: string[];
  }>;

  /** Suggested refactoring improvements */
  refactors: Array<{
    id: string;
    title: string;
    description: string;
    impact: "low" | "medium" | "high";
    effort: "low" | "medium" | "high";
    category: string;
    files: string[];
    suggestedCode?: string;
  }>;

  /** Suggested GitHub automations (issues, PRs, workflows) */
  automations: Array<{
    id: string;
    type: "issue" | "pull-request" | "workflow";
    title: string;
    description: string;
    body: string;
    labels: string[];
    priority: "low" | "medium" | "high";
  }>;

  /** Architecture components identified in the codebase */
  architecture: Array<{
    id: string;
    name: string;
    type:
      | "frontend"
      | "backend"
      | "database"
      | "service"
      | "external"
      | "middleware";
    description: string;
    technologies: string[];
    connections: string[];
  }>;

  /** Data flow visualization data */
  dataFlow: {
    nodes: Array<{
      id: string;
      name: string;
      type: "source" | "process" | "store" | "output";
      description: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      label: string;
      dataType: string;
    }>;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

/** AI model identifier */
const MODEL_ID = "mistralai/devstral-2512:free";

/** Rate limit window duration in milliseconds (1 minute) */
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

/** Maximum requests allowed per rate limit window */
const RATE_LIMIT_MAX_REQUESTS = 10;

/** Maximum URL length to accept */
const MAX_URL_LENGTH = 500;

/** Minimum valid API key length */
const MIN_API_KEY_LENGTH = 20;

/** Maximum file content length to include in prompt */
const MAX_FILE_CONTENT_LENGTH = 2000;

/** Maximum number of important files to include */
const MAX_IMPORTANT_FILES = 6;

/** Maximum lines in compact tree representation */
const MAX_TREE_LINES = 50;

/** AI model temperature (creativity level) */
const MODEL_TEMPERATURE = 0.7;

/** Maximum output tokens for AI response */
const MAX_OUTPUT_TOKENS = 4000;

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * In-memory rate limit storage
 *
 * @remarks
 * This is a simple implementation suitable for single-instance deployments.
 * For production with multiple instances, consider using Redis or similar.
 *
 * @example
 * // Storage structure
 * Map {
 *   "192.168.1.1" => { count: 5, resetTime: 1699999999999 }
 * }
 */
const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * Checks if a client IP is within rate limits
 *
 * @param ip - Client IP address
 * @returns Object containing whether request is allowed and remaining requests
 *
 * @example
 * const result = checkRateLimit("192.168.1.1");
 * if (!result.allowed) {
 *   return Response.json({ error: "Rate limited" }, { status: 429 });
 * }
 */
function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // New client or expired window - reset counter
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  // Rate limit exceeded
  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  // Increment counter
  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

/**
 * Extracts client IP address from request headers
 *
 * @param request - Incoming HTTP request
 * @returns Client IP address or "unknown" if not determinable
 *
 * @remarks
 * Checks headers in order of preference:
 * 1. x-forwarded-for (set by proxies/load balancers)
 * 2. x-real-ip (set by nginx)
 * 3. Falls back to "unknown"
 */
function getClientIP(request: Request): string {
  // Check x-forwarded-for (common for proxies)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Take first IP if multiple are present
    return forwarded.split(",")[0].trim();
  }

  // Check x-real-ip (nginx)
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "unknown";
}

// ============================================================================
// VALIDATION & SANITIZATION
// ============================================================================

/**
 * Creates and validates the OpenRouter AI client
 *
 * @throws {Error} If OPENROUTER_API_KEY is not configured or invalid
 * @returns Configured OpenRouter client
 *
 * @example
 * const client = getOpenRouterClient();
 * const model = client.chat(MODEL_ID);
 */
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not configured"
    );
  }

  if (apiKey.length < MIN_API_KEY_LENGTH) {
    throw new Error("OPENROUTER_API_KEY appears to be invalid");
  }

  return createOpenRouter({ apiKey });
}

/**
 * Sanitizes and validates the input URL
 *
 * @param url - Raw URL input from request
 * @throws {Error} If URL is not a string or not a GitHub URL
 * @returns Sanitized URL string
 *
 * @example
 * const cleanUrl = sanitizeUrl("https://github.com/owner/repo");
 */
function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    throw new Error("URL must be a string");
  }

  // Trim and limit length to prevent abuse
  const sanitized = url.trim().slice(0, MAX_URL_LENGTH);

  // Basic validation - must be a GitHub URL
  if (!sanitized.includes("github.com")) {
    throw new Error("Invalid GitHub URL");
  }

  return sanitized;
}

/**
 * Validates GitHub owner and repository names
 *
 * @param name - Owner or repository name to validate
 * @returns True if name matches valid pattern
 *
 * @remarks
 * Valid names contain only alphanumeric characters, underscores,
 * hyphens, and periods.
 */
function isValidGitHubName(name: string): boolean {
  const validNamePattern = /^[a-zA-Z0-9_.-]+$/;
  return validNamePattern.test(name);
}

// ============================================================================
// PROMPT BUILDING
// ============================================================================

/**
 * Builds the AI prompt for repository analysis
 *
 * @param metadata - Repository metadata from GitHub API
 * @param fileStats - Calculated file statistics
 * @param compactTree - Compact string representation of file tree
 * @param filesContent - Formatted content of important files
 * @returns Complete prompt string for AI model
 *
 * @remarks
 * The prompt instructs the AI to return a specific JSON structure.
 * See {@link AIAnalysisResponse} for the expected output format.
 */
function buildPrompt(
  metadata: RepoMetadata,
  fileStats: FileStats,
  compactTree: string,
  filesContent: string
): string {
  const languagesInfo =
    Object.entries(fileStats.languages)
      .slice(0, 5)
      .map(([lang, count]) => `${lang}(${count})`)
      .join(", ") || "Unknown";

  return `# Repository: ${metadata.fullName}

## Info
- Description: ${metadata.description || "None"}
- Language: ${metadata.language || "Unknown"}
- Stars: ${metadata.stars} | Forks: ${metadata.forks} | Issues: ${
    metadata.openIssues
  }
- Files: ${fileStats.totalFiles} | Dirs: ${fileStats.totalDirectories}
- Languages detected: ${languagesInfo}

## Structure
\`\`\`
${compactTree}
\`\`\`

## Key Files
${filesContent}

---

Analyze this repository and return a comprehensive JSON response. Be specific, actionable, and thorough.

\`\`\`json
{
  "summary": "2-3 sentence technical summary of the repository",
  "whatItDoes": "A plain English explanation (2-3 sentences) of what this project does and its main purpose - written for someone unfamiliar with the codebase",
  "targetAudience": "Who should use this project (be specific, e.g., 'Frontend developers building React applications who need a component library')",
  "techStack": ["Technology1", "Technology2", "Framework1"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    {"name": "folder-name/", "description": "What this folder contains and its purpose"}
  ],
  "scores": {
    "overall": 75,
    "codeQuality": 80,
    "documentation": 70,
    "security": 75,
    "maintainability": 80,
    "testCoverage": 60,
    "dependencies": 75
  },
  "insights": [
    {
      "type": "strength|weakness|suggestion|warning",
      "category": "Category Name",
      "title": "Brief Title",
      "description": "Detailed explanation of the insight",
      "priority": "low|medium|high|critical",
      "affectedFiles": ["path/to/file.ts"]
    }
  ],
  "refactors": [
    {
      "id": "ref-1",
      "title": "Refactor Title",
      "description": "What should be refactored and why",
      "impact": "low|medium|high",
      "effort": "low|medium|high",
      "category": "Category",
      "files": ["path/to/file.ts"],
      "suggestedCode": "// Optional code example"
    }
  ],
  "automations": [
    {
      "id": "auto-1",
      "type": "issue|pull-request|workflow",
      "title": "Issue/PR Title",
      "description": "Brief description",
      "body": "Full markdown body for the issue or PR",
      "labels": ["enhancement", "good-first-issue"],
      "priority": "low|medium|high"
    }
  ],
  "architecture": [
    {
      "id": "arch-1",
      "name": "Component Name",
      "type": "frontend|backend|database|service|external|middleware",
      "description": "What this component does",
      "technologies": ["React", "TypeScript"],
      "connections": ["arch-2"]
    }
  ],
  "dataFlow": {
    "nodes": [
      {"id": "df-1", "name": "Node Name", "type": "source|process|store|output", "description": "Description"}
    ],
    "edges": [
      {"from": "df-1", "to": "df-2", "label": "Data flow label", "dataType": "JSON"}
    ]
  }
}
\`\`\`

## Requirements:
- **whatItDoes**: Explain like you're telling a friend what this project is about
- **targetAudience**: Be specific about who would benefit from this project
- **techStack**: List all detected technologies, frameworks, and tools (${
    metadata.language
      ? `primary language is ${metadata.language}`
      : "detect the primary language"
  })
- **howToRun**: Provide actual working commands based on the detected package manager and framework
- **keyFolders**: Explain 4-8 key directories from the file structure shown above
- **scores**: Rate 0-100 based on actual code quality visible in the files
- **insights**: Provide 4-6 insights (mix of strengths, weaknesses, suggestions, warnings)
- **refactors**: Suggest 2-3 specific refactoring improvements
- **automations**: Suggest 2-3 GitHub issues or PRs that could improve the project
- **architecture**: Identify 2-4 main architectural components
- **dataFlow**: Map 3-5 data flow nodes showing how data moves through the system

Be specific to THIS repository based on the actual files and structure shown.`;
}

// ============================================================================
// SSE HELPERS
// ============================================================================

/**
 * Creates an SSE-formatted message
 *
 * @param event - Event object to serialize
 * @returns SSE-formatted string
 *
 * @example
 * const message = createSSEMessage({ type: "content", data: "Hello" });
 * // Returns: 'data: {"type":"content","data":"Hello"}\n\n'
 */
function createSSEMessage(event: SSEEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}

// ============================================================================
// API HANDLERS
// ============================================================================

/**
 * POST /api/analyze
 *
 * Analyzes a GitHub repository using AI and streams the results.
 *
 * @param request - Incoming HTTP request
 * @returns Server-Sent Events stream with analysis results
 *
 * @description
 * This endpoint performs the following steps:
 * 1. Validates the request and checks rate limits
 * 2. Fetches repository data from GitHub API
 * 3. Builds an AI prompt with repository context
 * 4. Streams AI analysis results back to the client
 *
 * @example
 * // Request
 * fetch('/api/analyze', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ url: 'https://github.com/owner/repo' })
 * })
 *
 * @example
 * // Response stream events
 * // 1. Metadata (sent first)
 * { type: "metadata", data: { metadata, fileTree, fileStats } }
 *
 * // 2. Content chunks (streamed)
 * { type: "content", data: "..." }
 *
 * // 3. Done (sent last)
 * { type: "done" }
 *
 * // Or on error:
 * { type: "error", data: "Error message" }
 *
 * @throws
 * - 400 Bad Request - Invalid URL or request body
 * - 429 Too Many Requests - Rate limit exceeded
 * - 500 Internal Server Error - Unexpected error
 * - 503 Service Unavailable - AI service not configured
 */
export async function POST(request: Request): Promise<Response> {
  // ----------------------------------------
  // Step 1: Rate Limiting
  // ----------------------------------------
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    // ----------------------------------------
    // Step 2: Parse Request Body
    // ----------------------------------------
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    // Validate body structure
    if (!body || typeof body !== "object" || !("url" in body)) {
      return Response.json(
        { error: "Missing 'url' field in request body" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 3: Validate URL
    // ----------------------------------------
    let sanitizedUrl: string;
    try {
      sanitizedUrl = sanitizeUrl((body as AnalyzeRequestBody).url);
    } catch (error) {
      return Response.json(
        { error: error instanceof Error ? error.message : "Invalid URL" },
        { status: 400 }
      );
    }

    const validation = validateGitHubUrl(sanitizedUrl);
    if (!validation.valid || !validation.parsed) {
      return Response.json(
        { error: validation.error || "Invalid GitHub URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = validation.parsed;

    // Validate owner and repo names
    if (!isValidGitHubName(owner) || !isValidGitHubName(repo)) {
      return Response.json(
        { error: "Invalid repository owner or name" },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Step 4: Initialize AI Client
    // ----------------------------------------
    let openrouter;
    try {
      openrouter = getOpenRouterClient();
    } catch (error) {
      console.error("OpenRouter configuration error:", error);
      return Response.json(
        { error: "AI service is not properly configured" },
        { status: 503 }
      );
    }

    const model = openrouter.chat(MODEL_ID);

    // ----------------------------------------
    // Step 5: Fetch Repository Data
    // ----------------------------------------
    let metadata: RepoMetadata;
    let tree: FileNode[];
    let importantFiles: Record<string, string>;

    try {
      [metadata, tree, importantFiles] = await Promise.all([
        fetchRepoMetadata(owner, repo),
        fetchRepoTree(owner, repo),
        fetchImportantFiles(owner, repo),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch repository";
      console.error("GitHub fetch error:", error);
      return Response.json({ error: message }, { status: 400 });
    }

    // ----------------------------------------
    // Step 6: Prepare Analysis Context
    // ----------------------------------------
    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, MAX_TREE_LINES);

    const filesContent = Object.entries(importantFiles)
      .slice(0, MAX_IMPORTANT_FILES)
      .map(
        ([file, content]) =>
          `### ${file}\n\`\`\`\n${content.slice(
            0,
            MAX_FILE_CONTENT_LENGTH
          )}\n\`\`\``
      )
      .join("\n\n");

    const prompt = buildPrompt(metadata, fileStats, compactTree, filesContent);

    // ----------------------------------------
    // Step 7: Stream AI Response
    // ----------------------------------------
    const result = await streamText({
      model,
      prompt,
      temperature: MODEL_TEMPERATURE,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    });

    const encoder = new TextEncoder();

    const customStream = new ReadableStream({
      async start(controller) {
        // Send metadata event first
        const metadataEvent: SSEEvent = {
          type: "metadata",
          data: { metadata, fileTree: tree, fileStats },
        };
        controller.enqueue(encoder.encode(createSSEMessage(metadataEvent)));

        // Stream AI content chunks
        try {
          for await (const chunk of result.textStream) {
            const contentEvent: SSEEvent = { type: "content", data: chunk };
            controller.enqueue(encoder.encode(createSSEMessage(contentEvent)));
          }
        } catch (error) {
          console.error("Stream error:", error);
          const errorEvent: SSEEvent = {
            type: "error",
            data: "Stream interrupted",
          };
          controller.enqueue(encoder.encode(createSSEMessage(errorEvent)));
        }

        // Send done event
        const doneEvent: SSEEvent = { type: "done" };
        controller.enqueue(encoder.encode(createSSEMessage(doneEvent)));
        controller.close();
      },
    });

    // ----------------------------------------
    // Step 8: Return Response
    // ----------------------------------------
    return new Response(customStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Connection: "keep-alive",
        "X-Content-Type-Options": "nosniff",
        "X-RateLimit-Remaining": String(rateLimit.remaining),
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 *
 * Health check endpoint for monitoring service status.
 *
 * @returns JSON object with service configuration status
 *
 * @example
 * // Response
 * {
 *   "status": "ok",
 *   "services": {
 *     "openrouter": "configured",
 *     "github": "optional"
 *   }
 * }
 *
 * @remarks
 * This endpoint is useful for:
 * - Health checks in container orchestration
 * - Monitoring dashboards
 * - Debugging configuration issues
 */
export async function GET(): Promise<Response> {
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
  const hasGitHubToken = !!process.env.GITHUB_TOKEN;

  return Response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      openrouter: hasOpenRouterKey ? "configured" : "missing",
      github: hasGitHubToken ? "configured" : "optional",
    },
    rateLimit: {
      windowMs: RATE_LIMIT_WINDOW_MS,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
    },
  });
}
