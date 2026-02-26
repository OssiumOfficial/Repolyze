import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const ANON_DAILY_LIMIT = 3;

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  isAuthenticated: boolean;
  userId: string | null;
}

/**
 * Check if the request is allowed based on IP + auth.
 * - Authenticated users: unlimited
 * - Anonymous users: 3 unique repos per day per IP
 */
export async function checkAnalysisRateLimit(
  request: Request,
  ip: string,
): Promise<RateLimitCheck> {
  // Check if user is authenticated
  const session = await auth();
  const userId = session?.user?.id ?? null;

  // Authenticated users get unlimited access
  if (userId) {
    return {
      allowed: true,
      remaining: Infinity,
      limit: Infinity,
      isAuthenticated: true,
      userId,
    };
  }

  // Anonymous: count unique analysis requests from this IP today
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.analysisRequest.count({
    where: {
      ip,
      userId: null,
      createdAt: { gte: startOfDay },
    },
  });

  const remaining = Math.max(0, ANON_DAILY_LIMIT - todayCount);

  return {
    allowed: todayCount < ANON_DAILY_LIMIT,
    remaining,
    limit: ANON_DAILY_LIMIT,
    isAuthenticated: false,
    userId: null,
  };
}

/**
 * Record a successful analysis request in the DB
 */
export async function recordAnalysisRequest(
  ip: string,
  repoUrl: string,
  userId: string | null,
): Promise<void> {
  await prisma.analysisRequest.create({
    data: { ip, repoUrl, userId },
  });
}

/**
 * Cleanup old records (older than 2 days) to keep the table small.
 * Call this periodically (e.g., from a cron or on every Nth request).
 */
export async function cleanupOldRequests(): Promise<void> {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  await prisma.analysisRequest.deleteMany({
    where: { createdAt: { lt: twoDaysAgo } },
  });
}
