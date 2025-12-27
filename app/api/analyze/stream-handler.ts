import { FileNode } from "@/lib/types";
import { RepoMetadata, FileStats, StreamEvent } from "./types";

const encoder = new TextEncoder();

export function encodeStreamEvent(event: StreamEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function createMetadataEvent(
  metadata: RepoMetadata,
  fileTree: FileNode[],
  fileStats: FileStats
): Uint8Array {
  return encodeStreamEvent({
    type: "metadata",
    data: { metadata, fileTree, fileStats },
  });
}

export function createContentEvent(chunk: string): Uint8Array {
  return encodeStreamEvent({
    type: "content",
    data: chunk,
  });
}

export function createErrorEvent(message: string): Uint8Array {
  return encodeStreamEvent({
    type: "error",
    data: message,
  });
}

export function createDoneEvent(): Uint8Array {
  return encodeStreamEvent({
    type: "done",
  });
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

export function createAnalysisStream(
  metadata: RepoMetadata,
  fileTree: FileNode[],
  fileStats: FileStats,
  textStream: AsyncIterable<string>
): ReadableStream {
  return new ReadableStream({
    async start(controller) {
      controller.enqueue(createMetadataEvent(metadata, fileTree, fileStats));

      try {
        for await (const chunk of textStream) {
          controller.enqueue(createContentEvent(chunk));
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(createErrorEvent("Stream interrupted"));
      }

      controller.enqueue(createDoneEvent());
      controller.close();
    },
  });
}
