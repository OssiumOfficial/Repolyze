/**
 * In-memory LRU cache with TTL for server-side data.
 * Dramatically speeds up repeated analyses of the same repo by avoiding
 * redundant GitHub API calls and AI inference.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  createdAt: number;
}

class LRUCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private readonly maxSize: number;
  private readonly defaultTTL: number;

  constructor(maxSize: number, defaultTTLMs: number) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTLMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.data;
  }

  set(key: string, data: T, ttlMs?: number): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiresAt: Date.now() + (ttlMs ?? this.defaultTTL),
      createdAt: Date.now(),
    });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }

  /**
   * Cleanup expired entries (call periodically)
   */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// ─── GitHub API Caches ───────────────────────────────────────────────
// Short TTL since repo data can change, but saves redundant calls within a window

/** Repo metadata cache - 5 min TTL, max 200 repos */
export const metadataCache = new LRUCache<{
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  openIssues: number;
  license: string | null;
  isPrivate: boolean;
  owner: { login: string; avatarUrl: string; type: string };
}>(200, 5 * 60 * 1000);

/** Repo tree cache - 5 min TTL, max 100 repos */
export const treeCache = new LRUCache<unknown>(100, 5 * 60 * 1000);

/** Branches cache - 10 min TTL, max 200 repos */
export const branchesCache = new LRUCache<unknown>(200, 10 * 60 * 1000);

/** Important files cache - 5 min TTL, max 100 repos */
export const filesCache = new LRUCache<Record<string, string>>(100, 5 * 60 * 1000);

// ─── Analysis Result Cache ───────────────────────────────────────────
// Caches the full streamed analysis result so repeat requests are instant

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CachedAnalysisResult {
  metadata: any;
  fileTree: any;
  fileStats: any;
  branch: string;
  availableBranches: any;
  scores: any;
  automations: any;
  refactors: any;
  aiContent: string;
  tier: string;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** Full analysis result cache - 30 min TTL, max 50 repos */
export const analysisResultCache = new LRUCache<CachedAnalysisResult>(
  50,
  30 * 60 * 1000,
);

// ─── Periodic Cleanup ────────────────────────────────────────────────

function pruneAll() {
  metadataCache.prune();
  treeCache.prune();
  branchesCache.prune();
  filesCache.prune();
  analysisResultCache.prune();
}

// Prune every 5 minutes
if (typeof globalThis !== "undefined") {
  const PRUNE_INTERVAL = 5 * 60 * 1000;
  // Use globalThis to avoid duplicate intervals in dev mode (HMR)
  const g = globalThis as unknown as { __repoCachePruner?: ReturnType<typeof setInterval> };
  if (!g.__repoCachePruner) {
    g.__repoCachePruner = setInterval(pruneAll, PRUNE_INTERVAL);
    // Unref so it doesn't keep the process alive
    if (typeof g.__repoCachePruner === "object" && "unref" in g.__repoCachePruner) {
      (g.__repoCachePruner as NodeJS.Timeout).unref();
    }
  }
}
