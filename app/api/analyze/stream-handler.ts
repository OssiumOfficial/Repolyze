// api/analyze/stream-handler.ts
import { FileNode, BranchInfo } from "@/lib/types";
import { RepoMetadata, FileStats, StreamEvent } from "./types";
import { CodeMetrics } from "./code-analyzer";
import { GeneratedAutomation } from "./automation-generator";
import { GeneratedRefactor } from "./refactor-generator";
import { GeneratedPR } from "./pr-generator";

const encoder = new TextEncoder();

export function encodeStreamEvent(event: StreamEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function getStreamHeaders(rateLimitRemaining: number): HeadersInit {
  return {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Connection: "keep-alive",
    "X-Content-Type-Options": "nosniff",
    "X-RateLimit-Remaining": String(rateLimitRemaining),
  };
}

interface PreComputedData {
  scores: {
    overall: number;
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
    breakdown: Record<string, { score: number; factors: string[] }>;
  };
  automations: GeneratedAutomation[];
  refactors: GeneratedRefactor[];
  pullRequests: GeneratedPR[];
  metrics: CodeMetrics;
}

export function createAnalysisStream(
  metadata: RepoMetadata,
  fileTree: FileNode[],
  fileStats: FileStats,
  branch: string,
  availableBranches: BranchInfo[],
  textStream: AsyncIterable<string>,
  preComputed: PreComputedData,
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      // Send metadata first
      controller.enqueue(
        encodeStreamEvent({
          type: "metadata",
          data: { metadata, fileTree, fileStats, branch, availableBranches },
        }),
      );

      // Send pre-computed scores immediately
      controller.enqueue(
        encodeStreamEvent({
          type: "scores",
          data: preComputed.scores,
        }),
      );

      // Send pre-computed automations
      controller.enqueue(
        encodeStreamEvent({
          type: "automations",
          data: preComputed.automations,
        }),
      );

      // Send pre-computed refactors
      controller.enqueue(
        encodeStreamEvent({
          type: "refactors",
          data: preComputed.refactors,
        }),
      );

      controller.enqueue(
        encodeStreamEvent({
          type: "pullRequests",
          data: preComputed.pullRequests,
        }),
      );

      // Stream AI content for insights, architecture, etc.
      try {
        for await (const chunk of textStream) {
          controller.enqueue(
            encodeStreamEvent({
              type: "content",
              data: chunk,
            }),
          );
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encodeStreamEvent({
            type: "error",
            data: "Stream interrupted",
          }),
        );
      }

      controller.enqueue(encodeStreamEvent({ type: "done" }));
      controller.close();
    },
  });
}
