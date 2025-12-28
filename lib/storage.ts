import { AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "repo-analyses";
const MAX_ENTRIES = 50;
const EXPIRY_DAYS = 7;

interface StoredAnalysis {
  data: AnalysisResult;
  timestamp: number;
  expiresAt: number;
}

interface AnalysisCache {
  [repoFullName: string]: StoredAnalysis;
}

export const analysisStorage = {
  get(repoFullName: string): AnalysisResult | null {
    if (typeof window === "undefined") return null;

    try {
      const cache = localStorage.getItem(STORAGE_KEY);
      if (!cache) return null;

      const parsed: AnalysisCache = JSON.parse(cache);
      const entry = parsed[repoFullName];

      if (!entry) return null;

      if (Date.now() > entry.expiresAt) {
        this.remove(repoFullName);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  set(repoFullName: string, data: AnalysisResult): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getAll();
      const now = Date.now();

      cache[repoFullName] = {
        data,
        timestamp: now,
        expiresAt: now + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      };

      const entries = Object.entries(cache);
      if (entries.length > MAX_ENTRIES) {
        const sorted = entries.sort(
          ([, a], [, b]) => a.timestamp - b.timestamp
        );
        sorted.slice(0, entries.length - MAX_ENTRIES).forEach(([key]) => {
          delete cache[key];
        });
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error writing to localStorage:", error);
      if (
        error instanceof DOMException &&
        error.name === "QuotaExceededError"
      ) {
        this.clearOldest(10);
        try {
          const cache = this.getAll();
          cache[repoFullName] = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch {
          console.error("Failed to save after clearing cache");
        }
      }
    }
  },

  remove(repoFullName: string): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getAll();
      delete cache[repoFullName];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  getAll(): AnalysisCache {
    if (typeof window === "undefined") return {};

    try {
      const cache = localStorage.getItem(STORAGE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  },

  getRecent(
    limit: number = 10
  ): { repoFullName: string; data: AnalysisResult; timestamp: number }[] {
    const cache = this.getAll();
    const now = Date.now();

    return Object.entries(cache)
      .filter(([, entry]) => entry.expiresAt > now)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(([repoFullName, entry]) => ({
        repoFullName,
        data: entry.data,
        timestamp: entry.timestamp,
      }));
  },

  clearOldest(count: number): void {
    const cache = this.getAll();
    const entries = Object.entries(cache).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    entries.slice(0, count).forEach(([key]) => delete cache[key]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  },

  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },

  has(repoFullName: string): boolean {
    return this.get(repoFullName) !== null;
  },
};
