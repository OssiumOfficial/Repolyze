import { streamText } from "ai";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchImportantFiles,
  fetchRepoBranches,
  calculateFileStats,
  createCompactTreeString,
} from "@/lib/github";
import {
  getOpenRouterClient,
  isConfigured,
  hasGitHubToken,
  MODEL_ID,
} from "./config";
import { checkRateLimit, getClientIP } from "./rate-limit";
import { parseRequestBody, validateAndParseUrl } from "./validators";
import { buildPrompt, prepareFilesContent } from "./prompt-builder";
import {
  createAnalysisStream,
  createCachedAnalysisStream,
  getStreamHeaders,
} from "./stream-handler";
import { analyzeCodeMetrics, calculateScores } from "./code-analyzer";
import { generateAutomations } from "./automation-generator";
import { generateRefactors } from "./refactor-generator";
import { HealthCheckResponse, ErrorResponse } from "./types";
import {
  checkAnalysisRateLimit,
  recordAnalysisRequest,
  cleanupOldRequests,
} from "@/lib/analysis-rate-limit";
import {
  analysisResultCache,
} from "@/lib/server-cache";

const MAX_BODY_SIZE = 10 * 1024;

// In-flight request deduplication: if repo X is already being analyzed,
// subsequent requests wait for the first to finish and then get the cached result.
const inFlightRequests = new Map<string, Promise<void>>();

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json(
      { error: "Server is not properly configured." } satisfies ErrorResponse,
      { status: 503 },
    );
  }

  const clientIP = getClientIP(request);

  // Per-minute burst rate limit (existing, in-memory)
  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please try again later.",
      } satisfies ErrorResponse,
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  // Daily tiered rate limit (DB-backed) — anon: 1/day, free: 3/day, pro: 44/day
  let dailyLimit: Awaited<ReturnType<typeof checkAnalysisRateLimit>>;
  try {
    dailyLimit = await checkAnalysisRateLimit(request, clientIP);
  } catch (err) {
    console.error("Rate limit DB check failed, allowing request:", err);
    dailyLimit = {
      allowed: true,
      remaining: 1,
      limit: 1,
      isAuthenticated: false,
      userId: null,
      tier: "anonymous",
    };
  }

  if (!dailyLimit.allowed) {
    const upgradeMsg = dailyLimit.tier === "anonymous"
      ? "Daily limit reached. Sign in to get more analyses."
      : dailyLimit.tier === "free"
        ? "Daily limit reached. Upgrade to Pro for 44 analyses per day."
        : "Daily analysis limit reached.";
    return Response.json(
      {
        error: upgradeMsg,
        code: "DAILY_LIMIT_REACHED",
        limit: dailyLimit.limit,
        remaining: 0,
        tier: dailyLimit.tier,
      },
      { status: 429 },
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return Response.json(
        { error: "Request body too large" } satisfies ErrorResponse,
        { status: 413 },
      );
    }

    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_SIZE) {
      return Response.json(
        { error: "Request body too large" } satisfies ErrorResponse,
        { status: 413 },
      );
    }

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    const parsedBody = parseRequestBody(body);
    const { owner, repo } = validateAndParseUrl(parsedBody.url);

    // ─── Check analysis result cache (serves repeat requests instantly) ───
    const metadata = await fetchRepoMetadata(owner, repo);
    const targetBranch = parsedBody.branch || metadata.defaultBranch;
    const analysisCacheKey = `${owner}/${repo}:${targetBranch}`;

    const cachedResult = analysisResultCache.get(analysisCacheKey);
    if (cachedResult) {
      // Serve cached result as a stream (instant, no AI call)
      const cachedStream = createCachedAnalysisStream(cachedResult, dailyLimit.tier);
      return new Response(cachedStream, {
        headers: getStreamHeaders(rateLimit.remaining),
      });
    }

    // ─── In-flight deduplication: wait if same repo is already being analyzed ───
    const inFlight = inFlightRequests.get(analysisCacheKey);
    if (inFlight) {
      try {
        await inFlight;
        // Now the result should be cached
        const afterWait = analysisResultCache.get(analysisCacheKey);
        if (afterWait) {
          const cachedStream = createCachedAnalysisStream(afterWait, dailyLimit.tier);
          return new Response(cachedStream, {
            headers: getStreamHeaders(rateLimit.remaining),
          });
        }
      } catch {
        // First request failed, proceed with our own analysis
      }
    }

    const openrouter = getOpenRouterClient();
    const model = openrouter.chat(MODEL_ID);

    // Parallel fetch (all cached individually too)
    const [tree, importantFiles, branches] = await Promise.all([
      fetchRepoTree(owner, repo, targetBranch),
      fetchImportantFiles(owner, repo, targetBranch),
      fetchRepoBranches(owner, repo, metadata.defaultBranch),
    ]);

    // Fast metrics computation
    const codeMetrics = analyzeCodeMetrics(tree, importantFiles);
    const calculatedScores = calculateScores(codeMetrics);

    // Generate only essential suggestions (no PR generation)
    const generatedAutomations = generateAutomations(
      codeMetrics,
      metadata.name,
      metadata.language,
    );
    const generatedRefactors = generateRefactors(
      codeMetrics,
      metadata.name,
      metadata.language,
    );

    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 40); // Reduced from 50
    const filesContent = prepareFilesContent(importantFiles, 6, 2500); // Reduced limits

    const prompt = buildPrompt(
      { metadata, fileStats, compactTree, filesContent, branch: targetBranch },
      codeMetrics,
      calculatedScores,
    );

    const result = await streamText({
      model,
      prompt,
      temperature: 0.4, // Lower for faster, more consistent output
      maxOutputTokens: 3000, // Reduced from 4000
    });

    // Collect AI content for caching while streaming
    const aiContentChunks: string[] = [];
    let resolveInFlight: () => void;
    let rejectInFlight: (err: Error) => void;
    const inFlightPromise = new Promise<void>((resolve, reject) => {
      resolveInFlight = resolve;
      rejectInFlight = reject;
    });
    inFlightRequests.set(analysisCacheKey, inFlightPromise);

    const cachingTextStream = (async function* () {
      try {
        for await (const chunk of result.textStream) {
          aiContentChunks.push(chunk);
          yield chunk;
        }
      } catch (err) {
        rejectInFlight!(err instanceof Error ? err : new Error(String(err)));
        inFlightRequests.delete(analysisCacheKey);
        throw err;
      }
    })();

    const stream = createAnalysisStream(
      metadata,
      tree,
      fileStats,
      targetBranch,
      branches,
      cachingTextStream,
      {
        scores: calculatedScores,
        automations: generatedAutomations,
        refactors: generatedRefactors,
        metrics: codeMetrics,
      },
      dailyLimit.tier,
      // onComplete: cache the full result and resolve in-flight
      () => {
        analysisResultCache.set(analysisCacheKey, {
          metadata,
          fileTree: tree,
          fileStats,
          branch: targetBranch,
          availableBranches: branches,
          scores: calculatedScores,
          automations: generatedAutomations,
          refactors: generatedRefactors,
          aiContent: aiContentChunks.join(""),
          tier: dailyLimit.tier,
        });
        resolveInFlight!();
        inFlightRequests.delete(analysisCacheKey);
      },
    );

    // Record the analysis in DB for rate-limiting (fire-and-forget)
    const repoUrl = `https://github.com/${owner}/${repo}`;
    recordAnalysisRequest(clientIP, repoUrl, dailyLimit.userId).catch((err) =>
      console.error("Failed to record analysis request:", err),
    );

    // Periodically cleanup old records (~1% of requests)
    if (Math.random() < 0.01) {
      cleanupOldRequests().catch((err) => console.error("Failed to cleanup old requests:", err));
    }

    return new Response(stream, {
      headers: getStreamHeaders(rateLimit.remaining),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const isOperational =
      error instanceof Error &&
      (error.message.includes("not found") ||
        error.message.includes("rate limit") ||
        error.message.includes("Invalid"));

    const message =
      isOperational && error instanceof Error
        ? error.message
        : "Analysis failed. Please try again.";

    return Response.json({ error: message } satisfies ErrorResponse, {
      status: 500,
    });
  }
}

export async function GET() {
  const response: HealthCheckResponse = {
    status: isConfigured() ? "ok" : "misconfigured",
    timestamp: new Date().toISOString(),
    services: {
      openrouter: isConfigured() ? "configured" : "missing",
      github: hasGitHubToken() ? "configured" : "optional",
    },
  };
  return Response.json(response);
}
