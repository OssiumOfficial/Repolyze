// api/analyze/route.ts
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
  AI_CONFIG,
} from "./config";
import { checkRateLimit, getClientIP } from "./rate-limit";
import { parseRequestBody, validateAndParseUrl } from "./validators";
import { buildPrompt, prepareFilesContent } from "./prompt-builder";
import { createAnalysisStream, getStreamHeaders } from "./stream-handler";
import { analyzeCodeMetrics, calculateScores } from "./code-analyzer";
import { generateAutomations } from "./automation-generator";
import { generateRefactors } from "./refactor-generator";
import { generatePRSuggestions } from "./pr-generator";
import { HealthCheckResponse, ErrorResponse } from "./types";

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json(
      { error: "Server is not properly configured." } satisfies ErrorResponse,
      { status: 503 },
    );
  }

  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please try again later.",
      } satisfies ErrorResponse,
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return Response.json(
        { error: "Invalid JSON in request body" } satisfies ErrorResponse,
        { status: 400 },
      );
    }

    const parsedBody = parseRequestBody(body);
    const { owner, repo } = validateAndParseUrl(parsedBody.url);
    const openrouter = getOpenRouterClient();
    const model = openrouter.chat(MODEL_ID);

    // Fetch all data in parallel
    const metadata = await fetchRepoMetadata(owner, repo);
    const targetBranch = parsedBody.branch || metadata.defaultBranch;

    const [tree, importantFiles, branches] = await Promise.all([
      fetchRepoTree(owner, repo, targetBranch),
      fetchImportantFiles(owner, repo, targetBranch),
      fetchRepoBranches(owner, repo, metadata.defaultBranch),
    ]);

    // Compute metrics and scores BEFORE calling AI
    const codeMetrics = analyzeCodeMetrics(tree, importantFiles);
    const calculatedScores = calculateScores(codeMetrics);

    // Generate automations based on actual metrics (not AI)
    const generatedAutomations = generateAutomations(
      codeMetrics,
      metadata.name,
      metadata.language,
    );

    // Generate refactors based on actual metrics (not AI)
    const generatedRefactors = generateRefactors(
      codeMetrics,
      metadata.name,
      metadata.language,
    );

    const generatedPRs = generatePRSuggestions(
      codeMetrics,
      metadata.name,
      metadata.language,
      metadata.defaultBranch,
    );

    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 50);
    const filesContent = prepareFilesContent(importantFiles);

    // Build prompt with metrics context
    const prompt = buildPrompt(
      { metadata, fileStats, compactTree, filesContent, branch: targetBranch },
      codeMetrics,
      calculatedScores,
    );

    const result = await streamText({
      model,
      prompt,
      temperature: 0.5,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
    });

    // Pass pre-computed data to stream handler
    const stream = createAnalysisStream(
      metadata,
      tree,
      fileStats,
      targetBranch,
      branches,
      result.textStream,
      {
        scores: calculatedScores,
        automations: generatedAutomations,
        refactors: generatedRefactors,
        pullRequests: generatedPRs,
        metrics: codeMetrics,
      },
    );

    return new Response(stream, {
      headers: getStreamHeaders(rateLimit.remaining),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
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
