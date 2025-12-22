"use client";

import { useCallback } from "react";
import { useAnalysisContext } from "@/context/analysis-context";
import { RepoMetadata, FileNode } from "@/lib/types";

export function useAnalysis() {
  const {
    status,
    result,
    setStatus,
    setResult,
    updateResult,
    reset,
    isLoading,
    isComplete,
    hasError,
    isIdle,
  } = useAnalysisContext();

  const analyze = useCallback(
    async (url: string) => {
      setStatus({
        stage: "fetching",
        progress: 5,
        currentStep: "Connecting to GitHub...",
      });
      setResult(null);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Analysis failed");
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let aiContent = "";

        setStatus({
          stage: "fetching",
          progress: 15,
          currentStep: "Fetching repository data...",
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "metadata") {
                const { metadata, fileTree, fileStats } = data.data as {
                  metadata: RepoMetadata;
                  fileTree: FileNode[];
                  fileStats: {
                    totalFiles: number;
                    totalDirectories: number;
                    languages: Record<string, number>;
                  };
                };

                updateResult({ metadata, fileTree, fileStats });
                setStatus({
                  stage: "analyzing",
                  progress: 40,
                  currentStep: "AI is analyzing the codebase...",
                });
              } else if (data.type === "content") {
                aiContent += data.data;
                const progress = Math.min(
                  40 + (aiContent.length / 6000) * 50,
                  90
                );
                setStatus({
                  stage: "analyzing",
                  progress,
                  currentStep: "AI is analyzing the codebase...",
                });
              } else if (data.type === "error") {
                throw new Error(data.data);
              } else if (data.type === "done") {
                try {
                  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const analysisData = JSON.parse(jsonMatch[0]);
                    updateResult({
                      ...analysisData,
                      insights: analysisData.insights || [],
                      refactors: analysisData.refactors || [],
                      automations: analysisData.automations || [],
                      architecture: analysisData.architecture || [],
                      dataFlow: analysisData.dataFlow || {
                        nodes: [],
                        edges: [],
                      },
                      techStack: analysisData.techStack || [],
                      whatItDoes: analysisData.whatItDoes || "",
                      targetAudience: analysisData.targetAudience || "",
                      howToRun: analysisData.howToRun || [],
                      keyFolders: analysisData.keyFolders || [],
                    });
                  }
                } catch (parseError) {
                  console.error("Parse error:", parseError);
                  updateResult({
                    summary: "Analysis completed with parsing issues.",
                    insights: [],
                    refactors: [],
                    automations: [],
                    architecture: [],
                    dataFlow: { nodes: [], edges: [] },
                  });
                }

                setStatus({
                  stage: "complete",
                  progress: 100,
                  currentStep: "Analysis complete!",
                });
              }
            } catch (e) {
              console.error("SSE parse error:", e);
            }
          }
        }
      } catch (error) {
        setStatus({
          stage: "error",
          progress: 0,
          currentStep: "",
          error: error instanceof Error ? error.message : "Analysis failed",
        });
      }
    },
    [setStatus, setResult, updateResult]
  );

  return {
    analyze,
    status,
    result,
    reset,
    isLoading,
    isComplete,
    hasError,
    isIdle,
  };
}
