import { AnalysisResult } from "@/lib/types";

const STORAGE_KEY = "repo-analyses";
const MAX_ENTRIES = 50;
const EXPIRY_DAYS = 7;

interface StoredAnalysis {
  data: AnalysisResult;
  timestamp: number;
  expiresAt: number;
  branch?: string;
}

interface AnalysisCache {
  [key: string]: StoredAnalysis; // key format: "owner/repo" or "owner/repo:branch"
}

function normalizeRepoName(repoFullName: string): string {
  return repoFullName.toLowerCase();
}

/**
 * Generate cache key from repo name and optional branch
 */
function getCacheKey(repoFullName: string, branch?: string): string {
  if (branch) {
    return `${repoFullName}:${branch}`;
  }
  return repoFullName;
}

/**
 * Parse cache key to extract repo and branch
 */
function parseCacheKey(key: string): { repoFullName: string; branch?: string } {
  const parts = key.split(":");
  if (parts.length > 1) {
    return {
      repoFullName: parts[0],
      branch: parts.slice(1).join(":"), // Handle branch names with colons
    };
  }
  return { repoFullName: key };
}

export const analysisStorage = {
  /**
   * Get analysis from cache
   */
  get(repoFullName: string, branch?: string): AnalysisResult | null {
    if (typeof window === "undefined") return null;

    try {
      const cache = localStorage.getItem(STORAGE_KEY);
      if (!cache) return null;

      const parsed: AnalysisCache = JSON.parse(cache);
      const key = getCacheKey(repoFullName, branch);
      const entry = parsed[key];

      if (!entry) {
        // Fallback: try without branch if branch was specified
        if (branch) {
          const fallbackEntry = parsed[repoFullName];
          if (fallbackEntry && Date.now() <= fallbackEntry.expiresAt) {
            return fallbackEntry.data;
          }
        }

        // Fallback: case-insensitive match and most recent repo entry
        if (!branch) {
          const target = normalizeRepoName(repoFullName);
          const now = Date.now();
          const candidates = Object.entries(parsed)
            .map(([cacheKey, cachedEntry]) => ({
              cacheKey,
              cachedEntry,
              parsedKey: parseCacheKey(cacheKey),
            }))
            .filter(({ cachedEntry, parsedKey }) => {
              return (
                cachedEntry.expiresAt > now &&
                normalizeRepoName(parsedKey.repoFullName) === target
              );
            })
            .sort((a, b) => b.cachedEntry.timestamp - a.cachedEntry.timestamp);

          if (candidates.length > 0) {
            return candidates[0].cachedEntry.data;
          }
        }

        return null;
      }

      if (Date.now() > entry.expiresAt) {
        this.remove(repoFullName, branch);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error("Error reading from localStorage:", error);
      return null;
    }
  },

  /**
   * Save analysis to cache
   */
  set(repoFullName: string, data: AnalysisResult, branch?: string): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getAll();
      const now = Date.now();
      const key = getCacheKey(repoFullName, branch);

      cache[key] = {
        data,
        timestamp: now,
        expiresAt: now + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
        branch,
      };

      // Enforce max entries limit
      const entries = Object.entries(cache);
      if (entries.length > MAX_ENTRIES) {
        const sorted = entries.sort(
          ([, a], [, b]) => a.timestamp - b.timestamp
        );
        sorted.slice(0, entries.length - MAX_ENTRIES).forEach(([k]) => {
          delete cache[k];
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
          const key = getCacheKey(repoFullName, branch);
          cache[key] = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            branch,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
        } catch {
          console.error("Failed to save after clearing cache");
        }
      }
    }
  },

  /**
   * Remove analysis from cache
   */
  remove(repoFullName: string, branch?: string): void {
    if (typeof window === "undefined") return;

    try {
      const cache = this.getAll();
      const key = getCacheKey(repoFullName, branch);
      delete cache[key];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error("Error removing from localStorage:", error);
    }
  },

  /**
   * Get all cached analyses
   */
  getAll(): AnalysisCache {
    if (typeof window === "undefined") return {};

    try {
      const cache = localStorage.getItem(STORAGE_KEY);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  },

  /**
   * Get recent analyses
   */
  getRecent(
    limit: number = 10
  ): {
    repoFullName: string;
    branch?: string;
    data: AnalysisResult;
    timestamp: number;
  }[] {
    const cache = this.getAll();
    const now = Date.now();

    return Object.entries(cache)
      .filter(([, entry]) => entry.expiresAt > now)
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .slice(0, limit)
      .map(([key, entry]) => {
        const { repoFullName, branch } = parseCacheKey(key);
        return {
          repoFullName,
          branch: branch || entry.branch,
          data: entry.data,
          timestamp: entry.timestamp,
        };
      });
  },

  /**
   * Get all analyses for a specific repo (all branches)
   */
  getForRepo(
    repoFullName: string
  ): { branch?: string; data: AnalysisResult; timestamp: number }[] {
    const cache = this.getAll();
    const now = Date.now();

    return Object.entries(cache)
      .filter(([key, entry]) => {
        const { repoFullName: keyRepo } = parseCacheKey(key);
        return keyRepo === repoFullName && entry.expiresAt > now;
      })
      .sort(([, a], [, b]) => b.timestamp - a.timestamp)
      .map(([key, entry]) => {
        const { branch } = parseCacheKey(key);
        return {
          branch: branch || entry.branch,
          data: entry.data,
          timestamp: entry.timestamp,
        };
      });
  },

  /**
   * Clear oldest entries
   */
  clearOldest(count: number): void {
    const cache = this.getAll();
    const entries = Object.entries(cache).sort(
      ([, a], [, b]) => a.timestamp - b.timestamp
    );

    entries.slice(0, count).forEach(([key]) => delete cache[key]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  },

  /**
   * Clear all cached analyses
   */
  clearAll(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Check if analysis exists in cache
   */
  has(repoFullName: string, branch?: string): boolean {
    return this.get(repoFullName, branch) !== null;
  },

  /**
   * Get cache statistics
   */
  getStats(): {
    totalEntries: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  } {
    const cache = this.getAll();
    const entries = Object.values(cache);

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        totalSize: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    const timestamps = entries.map((e) => e.timestamp);
    const cacheString = localStorage.getItem(STORAGE_KEY) || "";

    return {
      totalEntries: entries.length,
      totalSize: new Blob([cacheString]).size,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
    };
  },
};
