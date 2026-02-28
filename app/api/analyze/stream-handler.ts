import { FileNode, BranchInfo } from "@/lib/types";
import { RepoMetadata, FileStats, StreamEvent } from "./types";
import { CodeMetrics } from "./code-analyzer";
import { GeneratedAutomation } from "./automation-generator";
import { GeneratedRefactor } from "./refactor-generator";
import { UserTier } from "@/lib/tiers";

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
  tier: UserTier = "anonymous",
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      // Send user tier info first so client knows what to gate
      controller.enqueue(
        encodeStreamEvent({
          type: "tier",
          data: tier,
        }),
      );

      // Send metadata
      controller.enqueue(
        encodeStreamEvent({
          type: "metadata",
          data: { metadata, fileTree, fileStats, branch, availableBranches },
        }),
      );

      // Send pre-computed scores
      controller.enqueue(
        encodeStreamEvent({
          type: "scores",
          data: preComputed.scores,
        }),
      );

      // Send automations
      controller.enqueue(
        encodeStreamEvent({
          type: "automations",
          data: preComputed.automations,
        }),
      );

      // Send refactors
      controller.enqueue(
        encodeStreamEvent({
          type: "refactors",
          data: preComputed.refactors,
        }),
      );

      // Stream AI content
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
