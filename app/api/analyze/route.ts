import { streamText } from "ai";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchImportantFiles,
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
import { HealthCheckResponse, ErrorResponse } from "./types";

export async function POST(request: Request) {
  if (!isConfigured()) {
    return Response.json(
      {
        error: "Server is not properly configured. Please contact support.",
      } satisfies ErrorResponse,
      { status: 503 }
    );
  }

  const clientIP = getClientIP(request);

  const rateLimit = checkRateLimit(clientIP);
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "Too many requests. Please try again later.",
      } satisfies ErrorResponse,
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
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON in request body" } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    let parsedBody;
    try {
      parsedBody = parseRequestBody(body);
    } catch (error) {
      return Response.json(
        {
          error:
            error instanceof Error ? error.message : "Invalid request body",
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    let owner: string, repo: string;
    try {
      const parsed = validateAndParseUrl(parsedBody.url);
      owner = parsed.owner;
      repo = parsed.repo;
    } catch (error) {
      return Response.json(
        {
          error: error instanceof Error ? error.message : "Invalid URL",
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    let openrouter;
    try {
      openrouter = getOpenRouterClient();
    } catch (error) {
      console.error("OpenRouter configuration error:", error);
      return Response.json(
        {
          error: "AI service is not properly configured",
        } satisfies ErrorResponse,
        { status: 503 }
      );
    }

    const model = openrouter.chat(MODEL_ID);

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
      console.error("GitHub fetch error:", error);
      return Response.json({ error: message } satisfies ErrorResponse, {
        status: 400,
      });
    }

    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 50);
    const filesContent = prepareFilesContent(importantFiles);

    const prompt = buildPrompt({
      metadata,
      fileStats,
      compactTree,
      filesContent,
    });

    const result = await streamText({
      model,
      prompt,
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
    });

    // Create and return the stream
    const stream = createAnalysisStream(
      metadata,
      tree,
      fileStats,
      result.textStream
    );

    return new Response(stream, {
      headers: getStreamHeaders(rateLimit.remaining),
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      {
        error: "An unexpected error occurred. Please try again.",
      } satisfies ErrorResponse,
      { status: 500 }
    );
  }
}

export async function GET() {
  const configured = isConfigured();
  const githubConfigured = hasGitHubToken();

  const response: HealthCheckResponse = {
    status: configured ? "ok" : "misconfigured",
    timestamp: new Date().toISOString(),
    services: {
      openrouter: configured ? "configured" : "missing",
      github: githubConfigured ? "configured" : "optional (rate-limited)",
    },
  };

  return Response.json(response);
}
