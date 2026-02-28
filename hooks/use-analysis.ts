"use client";

import { useCallback, useState, useRef } from "react";
import { useAnalysisContext } from "@/context/analysis-context";
import {
  RepoMetadata,
  FileNode,
  AnalysisResult,
  BranchInfo,
} from "@/lib/types";
import { analysisStorage } from "@/lib/storage";
import { UserTier, canAccessFeature } from "@/lib/tiers";

const GITHUB_URL_REGEX =
  /(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+\/[^\/\s?#]+)/;
const SIMPLE_REPO_REGEX = /^([^\/\s]+\/[^\/\s]+)$/;

function extractRepoFullName(url: string): string | null {
  const match = url.match(GITHUB_URL_REGEX);
  if (match) return match[1].replace(/\.git$/, "");
  const simple = url.trim().match(SIMPLE_REPO_REGEX);
  return simple ? simple[1] : null;
}

const LOADING_MESSAGES = [
  "Scanning repository...",
  "Analyzing patterns...",
  "Checking architecture...",
  "Generating insights...",
  "Almost done...",
];

/**
 * Strip gated data from the result based on user tier.
 * This ensures gated content is never stored in React state or localStorage.
 */
function stripGatedData(
  data: Partial<AnalysisResult>,
  tier: UserTier,
): Partial<AnalysisResult> {
  const stripped = { ...data };

  // AI Insights: pro only
  if (!canAccessFeature(tier, "aiInsights")) {
    stripped.insights = undefined;
  }

  // Data Flow: pro only
  if (!canAccessFeature(tier, "dataFlow")) {
    stripped.dataFlow = undefined;
  }

  return stripped;
}

export function useAnalysis() {
  const {
    status,
    result,
    tier,
    setStatus,
    setResult,
    updateResult,
    setTier,
    reset: contextReset,
    isLoading,
    isComplete,
    hasError,
    isIdle,
  } = useAnalysisContext();

  const [isCached, setIsCached] = useState(false);
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string | null>(null);
  const [currentBranch, setCurrentBranch] = useState<string | undefined>();
  const abortRef = useRef<AbortController | null>(null);
  const tierRef = useRef<UserTier>("anonymous");

  const analyze = useCallback(
    async (url: string, branch?: string, skipCache = false) => {
      const repoFullName = extractRepoFullName(url);
      if (!repoFullName) {
        setStatus({
          stage: "error",
          progress: 0,
          currentStep: "",
          error: "Invalid GitHub URL",
        });
        return;
      }

      abortRef.current?.abort();
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

      setIsCached(false);
      setStatus({
        stage: "fetching",
        progress: 5,
        currentStep: "Connecting...",
      });
      setResult(null);
      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, branch }),
          signal: abortRef.current.signal,
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
        let streamTier: UserTier = "anonymous";

        setStatus({
          stage: "fetching",
          progress: 15,
          currentStep: "Fetching data...",
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

              switch (data.type) {
                case "tier":
                  streamTier = data.data as UserTier;
                  tierRef.current = streamTier;
                  setTier(streamTier);
                  break;
                case "metadata": {
                  const {
                    metadata,
                    fileTree,
                    fileStats,
                    branch: b,
                    availableBranches,
                  } = data.data;
                  currentResult = {
                    metadata,
                    fileTree,
                    fileStats,
                    branch: b,
                    availableBranches,
                  };
                  setCurrentBranch(b);
                  updateResult(currentResult);
                  setStatus({
                    stage: "analyzing",
                    progress: 20,
                    currentStep: `Analyzing ${b}...`,
                  });
                  break;
                }
                case "scores":
                  currentResult = { ...currentResult, scores: data.data };
                  updateResult(currentResult);
                  setStatus({
                    stage: "analyzing",
                    progress: 30,
                    currentStep: "Scores ready...",
                  });
                  break;
                case "automations":
                  currentResult = { ...currentResult, automations: data.data };
                  updateResult(currentResult);
                  setStatus({
                    stage: "analyzing",
                    progress: 40,
                    currentStep: "Automations ready...",
                  });
                  break;
                case "refactors":
                  currentResult = { ...currentResult, refactors: data.data };
                  updateResult(currentResult);
                  setStatus({
                    stage: "analyzing",
                    progress: 50,
                    currentStep: "Refactors ready...",
                  });
                  break;
                case "content":
                  aiContent += data.data;
                  const idx = Math.min(Math.floor(aiContent.length / 800), 4);
                  setStatus({
                    stage: "analyzing",
                    progress: Math.min(50 + (aiContent.length / 3000) * 40, 90),
                    currentStep: LOADING_MESSAGES[idx],
                  });
                  break;
                case "error":
                  throw new Error(data.data);
                case "done": {
                  const final = processFinalResult(aiContent, currentResult);
                  // Strip gated data based on tier BEFORE storing
                  const gated = stripGatedData(final, streamTier);
                  updateResult(gated);
                  if (currentResult.metadata?.fullName) {
                    analysisStorage.set(
                      currentResult.metadata.fullName,
                      gated as AnalysisResult,
                      currentResult.branch,
                    );
                  }
                  setStatus({
                    stage: "complete",
                    progress: 100,
                    currentStep: "Complete!",
                  });
                  break;
                }
              }
            } catch (e) {
              if (e instanceof Error && e.message !== "done")
                console.error("Parse error:", e);
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;
        setStatus({
          stage: "error",
          progress: 0,
          currentStep: "",
          error: error instanceof Error ? error.message : "Analysis failed",
        });
      } finally {
        abortRef.current = null;
      }
    },
    [setStatus, setResult, updateResult, setTier],
  );

  const analyzeBranch = useCallback(
    async (branch: string) => {
      if (currentRepoUrl) await analyze(currentRepoUrl, branch, true);
    },
    [currentRepoUrl, analyze],
  );

  const refresh = useCallback(async () => {
    if (!currentRepoUrl) return;
    const name = extractRepoFullName(currentRepoUrl);
    if (name) analysisStorage.remove(name, currentBranch);
    setIsCached(false);
    await analyze(currentRepoUrl, currentBranch, true);
  }, [currentRepoUrl, currentBranch, analyze]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    contextReset();
    setIsCached(false);
    setCurrentRepoUrl(null);
    setCurrentBranch(undefined);
  }, [contextReset]);

  const clearCache = useCallback(() => {
    if (!currentRepoUrl) return;
    const name = extractRepoFullName(currentRepoUrl);
    if (name) {
      analysisStorage.remove(name, currentBranch);
      setIsCached(false);
    }
  }, [currentRepoUrl, currentBranch]);

  return {
    analyze,
    analyzeBranch,
    refresh,
    reset,
    clearCache,
    status,
    result,
    tier,
    isLoading,
    isComplete,
    hasError,
    isIdle,
    isCached,
    currentRepoUrl,
    currentBranch,
  };
}

function processFinalResult(
  aiContent: string,
  current: Partial<AnalysisResult>,
): Partial<AnalysisResult> {
  try {
    const match = aiContent.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      return {
        ...current,
        summary: data.summary || "",
        whatItDoes: data.whatItDoes || "",
        targetAudience: data.targetAudience || "",
        techStack: data.techStack || [],
        howToRun: data.howToRun || [],
        keyFolders: data.keyFolders || [],
        insights: data.insights || [],
        architecture: data.architecture || [],
        dataFlow: data.dataFlow || { nodes: [], edges: [] },
        diagrams: data.diagrams,
        scores: current.scores,
        automations: current.automations,
        refactors: current.refactors,
      };
    }
  } catch (e) {
    console.error("Parse error:", e);
  }

  return {
    ...current,
    summary: "Analysis completed.",
    insights: [],
    architecture: [],
    dataFlow: { nodes: [], edges: [] },
    scores: current.scores,
    automations: current.automations,
    refactors: current.refactors,
  };
}
