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

// Validate environment variables at startup
function getOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not configured"
    );
  }

  if (apiKey.length < 20) {
    throw new Error("OPENROUTER_API_KEY appears to be invalid");
  }

  return createOpenRouter({ apiKey });
}

const MODEL_ID = "mistralai/devstral-2512:free";

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    throw new Error("URL must be a string");
  }

  // Remove any potential script injection or special characters
  const sanitized = url.trim().slice(0, 500);

  // Basic URL validation
  if (!sanitized.includes("github.com")) {
    throw new Error("Invalid GitHub URL");
  }

  return sanitized;
}

function buildPrompt(
  metadata: Awaited<ReturnType<typeof fetchRepoMetadata>>,
  fileStats: ReturnType<typeof calculateFileStats>,
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

export async function POST(request: Request) {
  // Get client IP for rate limiting
  const clientIP = getClientIP(request);

  // Check rate limit
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
    // Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !("url" in body)) {
      return Response.json(
        { error: "Missing 'url' field in request body" },
        { status: 400 }
      );
    }

    // Sanitize and validate URL
    let sanitizedUrl: string;
    try {
      sanitizedUrl = sanitizeUrl((body as { url: unknown }).url);
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
    const validNamePattern = /^[a-zA-Z0-9_.-]+$/;
    if (!validNamePattern.test(owner) || !validNamePattern.test(repo)) {
      return Response.json(
        { error: "Invalid repository owner or name" },
        { status: 400 }
      );
    }

    // Initialize OpenRouter client (validates API key)
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

    // Fetch repository data
    let metadata, tree, importantFiles;
    try {
      [metadata, tree, importantFiles] = await Promise.all([
        fetchRepoMetadata(owner, repo),
        fetchRepoTree(owner, repo),
        fetchImportantFiles(owner, repo),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch repository";

      // Log the error for debugging (but don't expose internal details)
      console.error("GitHub fetch error:", error);

      return Response.json({ error: message }, { status: 400 });
    }

    // Calculate stats and prepare content
    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 50);

    const filesContent = Object.entries(importantFiles)
      .slice(0, 6)
      .map(
        ([file, content]) =>
          `### ${file}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``
      )
      .join("\n\n");

    // Build the prompt
    const prompt = buildPrompt(metadata, fileStats, compactTree, filesContent);

    // Stream AI response
    const result = await streamText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "metadata",
              data: { metadata, fileTree: tree, fileStats },
            })}\n\n`
          )
        );

        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "content", data: chunk })}\n\n`
              )
            );
          }
        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                data: "Stream interrupted",
              })}\n\n`
            )
          );
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      },
    });

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
    // Log the full error for debugging
    console.error("Analysis error:", error);

    // Return a generic error message to the client
    return Response.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Health check endpoint (optional - for monitoring)
export async function GET() {
  const hasOpenRouterKey = !!process.env.OPENROUTER_API_KEY;
  const hasGitHubToken = !!process.env.GITHUB_TOKEN;

  return Response.json({
    status: "ok",
    services: {
      openrouter: hasOpenRouterKey ? "configured" : "missing",
      github: hasGitHubToken ? "configured" : "optional",
    },
  });
}
