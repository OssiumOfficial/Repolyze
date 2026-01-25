// hooks/use-analysis.ts
"use client";

import { useCallback, useState } from "react";
import { useAnalysisContext } from "@/context/analysis-context";
import {
  RepoMetadata,
  FileNode,
  AnalysisResult,
  BranchInfo,
} from "@/lib/types";
import { analysisStorage } from "@/lib/storage";

function extractRepoFullName(url: string): string | null {
  try {
    const githubRegex =
      /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+\/[^\/\s?#]+)/;
    const match = url.match(githubRegex);
    if (match) return match[1].replace(/\.git$/, "");

    const simpleRegex = /^([^\/\s]+\/[^\/\s]+)$/;
    const simpleMatch = url.trim().match(simpleRegex);
    if (simpleMatch) return simpleMatch[1];

    return null;
  } catch {
    return null;
  }
}

function getLoadingMessage(contentLength: number): string {
  const messages = [
    "Scanning repository structure...",
    "Analyzing code patterns...",
    "Evaluating architecture decisions...",
    "Checking best practices...",
    "Identifying improvement opportunities...",
    "Generating insights...",
    "Mapping data flow...",
    "Building architecture diagram...",
    "Preparing recommendations...",
    "Almost there...",
  ];
  const index = Math.min(Math.floor(contentLength / 600), messages.length - 1);
  return messages[index];
}

export function useAnalysis() {
  const {
    status,
    result,
    setStatus,
    setResult,
    updateResult,
    reset: contextReset,
    isLoading,
    isComplete,
    hasError,
    isIdle,
  } = useAnalysisContext();

  const [isCached, setIsCached] = useState(false);
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | undefined>(
    undefined,
  );

  const analyze = useCallback(
    async (url: string, branch?: string, skipCache = false) => {
      const repoFullName = extractRepoFullName(url);

      if (!repoFullName) {
        setStatus({
          stage: "error",
          progress: 0,
          currentStep: "",
          error:
            "Invalid GitHub repository URL. Please use format: owner/repo or https://github.com/owner/repo",
        });
        return;
      }

      setCurrentRepoUrl(url);
      setCurrentBranch(branch);

      if (!skipCache) {
        const cached = analysisStorage.get(repoFullName, branch);
        if (cached) {
          setResult(cached);
          setIsCached(true);
          setStatus({
            stage: "complete",
            progress: 100,
            currentStep: "Loaded from cache",
          });
          return;
        }
      }

      // Fresh analysis
      setIsCached(false);
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
          body: JSON.stringify({ url, branch }),
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
        let currentResult: Partial<AnalysisResult> = {};

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
                const {
                  metadata,
                  fileTree,
                  fileStats,
                  branch: analyzedBranch,
                  availableBranches,
                } = data.data as {
                  metadata: RepoMetadata;
                  fileTree: FileNode[];
                  fileStats: {
                    totalFiles: number;
                    totalDirectories: number;
                    languages: Record<string, number>;
                  };
                  branch: string;
                  availableBranches: BranchInfo[];
                };

                currentResult = {
                  metadata,
                  fileTree,
                  fileStats,
                  branch: analyzedBranch,
                  availableBranches,
                };
                setCurrentBranch(analyzedBranch);
                updateResult(currentResult);
                setStatus({
                  stage: "analyzing",
                  progress: 20,
                  currentStep: `Analyzing ${analyzedBranch} branch...`,
                });
              } else if (data.type === "scores") {
                // Immediately apply pre-computed scores
                currentResult = {
                  ...currentResult,
                  scores: data.data,
                };
                updateResult(currentResult);
                setStatus({
                  stage: "analyzing",
                  progress: 25,
                  currentStep: "Quality scores calculated...",
                });
              } else if (data.type === "automations") {
                // Immediately apply pre-computed automations
                currentResult = {
                  ...currentResult,
                  automations: data.data,
                };
                updateResult(currentResult);
                setStatus({
                  stage: "analyzing",
                  progress: 30,
                  currentStep: "Automation suggestions ready...",
                });
              } else if (data.type === "refactors") {
                // Immediately apply pre-computed refactors
                currentResult = {
                  ...currentResult,
                  refactors: data.data,
                };
                updateResult(currentResult);
                setStatus({
                  stage: "analyzing",
                  progress: 35,
                  currentStep: "Refactoring opportunities identified...",
                });
              } else if (data.type === "pullRequests") {
                currentResult = {
                  ...currentResult,
                  pullRequests: data.data,
                };
                updateResult(currentResult);
                setStatus({
                  stage: "analyzing",
                  progress: 38,
                  currentStep: "PR suggestions generated...",
                });
              } else if (data.type === "content") {
                aiContent += data.data;
                const progress = Math.min(
                  35 + (aiContent.length / 5000) * 55,
                  90,
                );
                setStatus({
                  stage: "analyzing",
                  progress,
                  currentStep: getLoadingMessage(aiContent.length),
                });
              } else if (data.type === "error") {
                throw new Error(data.data);
              } else if (data.type === "done") {
                try {
                  const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
                  if (jsonMatch) {
                    const analysisData = JSON.parse(jsonMatch[0]);
                    // Merge AI insights with pre-computed scores/automations/refactors
                    const finalResult: Partial<AnalysisResult> = {
                      ...currentResult,
                      summary: analysisData.summary || "",
                      whatItDoes: analysisData.whatItDoes || "",
                      targetAudience: analysisData.targetAudience || "",
                      techStack: analysisData.techStack || [],
                      howToRun: analysisData.howToRun || [],
                      keyFolders: analysisData.keyFolders || [],
                      insights: analysisData.insights || [],
                      architecture: analysisData.architecture || [],
                      dataFlow: analysisData.dataFlow || {
                        nodes: [],
                        edges: [],
                      },
                      diagrams: analysisData.diagrams || undefined,
                      // Keep pre-computed values (don't override from AI)
                      scores: currentResult.scores,
                      automations: currentResult.automations,
                      refactors: currentResult.refactors,
                      pullRequests: currentResult.pullRequests,
                    };

                    updateResult(finalResult);

                    // Save to cache with branch
                    if (currentResult.metadata?.fullName) {
                      analysisStorage.set(
                        currentResult.metadata.fullName,
                        finalResult as AnalysisResult,
                        currentResult.branch,
                      );
                    }
                  }
                } catch (parseError) {
                  console.error("Parse error:", parseError);
                  const fallbackResult: Partial<AnalysisResult> = {
                    ...currentResult,
                    summary: "Analysis completed with parsing issues.",
                    insights: [],
                    architecture: [],
                    dataFlow: { nodes: [], edges: [] },
                    // Keep pre-computed values
                    scores: currentResult.scores,
                    automations: currentResult.automations,
                    refactors: currentResult.refactors,
                  };
                  updateResult(fallbackResult);

                  // Still save to cache even with parsing issues
                  if (currentResult.metadata?.fullName) {
                    analysisStorage.set(
                      currentResult.metadata.fullName,
                      fallbackResult as AnalysisResult,
                      currentResult.branch,
                    );
                  }
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
    [setStatus, setResult, updateResult],
  );

  // Analyze a different branch of the current repo
  const analyzeBranch = useCallback(
    async (branch: string) => {
      if (!currentRepoUrl) return;
      await analyze(currentRepoUrl, branch, true);
    },
    [currentRepoUrl, analyze],
  );

  // Refresh: clear cache and re-analyze current branch
  const refresh = useCallback(async () => {
    if (!currentRepoUrl) return;

    const repoFullName = extractRepoFullName(currentRepoUrl);
    if (repoFullName) {
      analysisStorage.remove(repoFullName, currentBranch);
    }

    setIsCached(false);
    await analyze(currentRepoUrl, currentBranch, true);
  }, [currentRepoUrl, currentBranch, analyze]);

  // Reset everything
  const reset = useCallback(() => {
    contextReset();
    setIsCached(false);
    setCurrentRepoUrl(null);
    setCurrentBranch(undefined);
  }, [contextReset]);

  // Clear cache for current repo and branch
  const clearCache = useCallback(() => {
    if (!currentRepoUrl) return;

    const repoFullName = extractRepoFullName(currentRepoUrl);
    if (repoFullName) {
      analysisStorage.remove(repoFullName, currentBranch);
      setIsCached(false);
    }
  }, [currentRepoUrl, currentBranch]);

  // Clear all cached analyses for current repo (all branches)
  const clearAllBranchCaches = useCallback(() => {
    if (!currentRepoUrl) return;

    const repoFullName = extractRepoFullName(currentRepoUrl);
    if (repoFullName) {
      const allCached = analysisStorage.getForRepo(repoFullName);
      for (const cached of allCached) {
        analysisStorage.remove(repoFullName, cached.branch);
      }
      setIsCached(false);
    }
  }, [currentRepoUrl]);

  return {
    analyze,
    analyzeBranch,
    refresh,
    reset,
    clearCache,
    clearAllBranchCaches,
    status,
    result,
    isLoading,
    isComplete,
    hasError,
    isIdle,
    isCached,
    currentRepoUrl,
    currentBranch,
  };
}
