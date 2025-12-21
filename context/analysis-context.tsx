"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { AnalysisResult, StreamingAnalysis, AnalysisStage } from "@/lib/types";

interface AnalysisContextType {
  status: StreamingAnalysis;
  result: Partial<AnalysisResult> | null;
  setStatus: (status: StreamingAnalysis) => void;
  setResult: (result: Partial<AnalysisResult> | null) => void;
  updateResult: (updates: Partial<AnalysisResult>) => void;
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
        setStatus,
        setResult,
        updateResult,
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
