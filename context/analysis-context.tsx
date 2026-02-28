// context/analysis-context.tsx
"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { AnalysisResult, StreamingAnalysis, AnalysisStage } from "@/lib/types";
import { UserTier } from "@/lib/tiers";

interface AnalysisContextType {
  status: StreamingAnalysis;
  result: Partial<AnalysisResult> | null;
  tier: UserTier;
  setStatus: (status: StreamingAnalysis) => void;
  setResult: (result: Partial<AnalysisResult> | null) => void;
  updateResult: (updates: Partial<AnalysisResult>) => void;
  setTier: (tier: UserTier) => void;
  reset: () => void;
  isLoading: boolean;
  isComplete: boolean;
  hasError: boolean;
  isIdle: boolean;
}

const initialStatus: StreamingAnalysis = {
  stage: "idle" as AnalysisStage,
  progress: 0,
  currentStep: "",
};

const AnalysisContext = createContext<AnalysisContextType | undefined>(
  undefined
);

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<StreamingAnalysis>(initialStatus);
  const [result, setResult] = useState<Partial<AnalysisResult> | null>(null);
  const [tier, setTier] = useState<UserTier>("anonymous");

  // Fetch the user's actual tier on mount so feature gates are correct
  // even before an analysis stream sets it
  useEffect(() => {
    fetch("/api/auth/usage")
      .then((r) => r.json())
      .then((data) => {
        if (data.tier) setTier(data.tier as UserTier);
      })
      .catch(() => {
        // Silently default to anonymous
      });
  }, []);

  const updateResult = useCallback((updates: Partial<AnalysisResult>) => {
    setResult((prev) => ({ ...prev, ...updates }));
  }, []);

  const reset = useCallback(() => {
    setStatus(initialStatus);
    setResult(null);
  }, []);

  const isLoading = ["fetching", "parsing", "analyzing"].includes(status.stage);
  const isComplete = status.stage === "complete";
  const hasError = status.stage === "error";
  const isIdle = status.stage === "idle";

  return (
    <AnalysisContext.Provider
      value={{
        status,
        result,
        tier,
        setStatus,
        setResult,
        updateResult,
        setTier,
        reset,
        isLoading,
        isComplete,
        hasError,
        isIdle,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error("useAnalysisContext must be used within AnalysisProvider");
  }
  return context;
}
