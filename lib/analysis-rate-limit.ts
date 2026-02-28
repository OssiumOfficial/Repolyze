import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { UserTier, getTierLimits } from "@/lib/tiers";

interface RateLimitCheck {
  allowed: boolean;
  remaining: number;
  limit: number;
  isAuthenticated: boolean;
  userId: string | null;
  tier: UserTier;
}

/**
 * Check if the request is allowed based on user tier.
 * - Anonymous users: 1 unique repo per day per IP
 * - Free users: 3 per day
 * - Pro users: 44 per day
 */
export async function checkAnalysisRateLimit(
  request: Request,
  ip: string,
): Promise<RateLimitCheck> {
  // Check if user is authenticated
  const session = await auth();
  const userId = session?.user?.id ?? null;

  let tier: UserTier = "anonymous";

  if (userId) {
    // Fetch user plan from DB
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    });

    if (user?.plan === "pro") {
      // Check if plan hasn't expired
      if (!user.planExpiresAt || user.planExpiresAt > new Date()) {
        tier = "pro";
      } else {
        tier = "free";
      }
    } else {
      tier = "free";
    }
  }

  const limits = getTierLimits(tier);
  const dailyLimit = limits.dailyAnalyses;

  // Count today's usage
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.analysisRequest.count({
    where: {
      ...(userId ? { userId } : { ip, userId: null }),
      createdAt: { gte: startOfDay },
    },
  });

  const remaining = Math.max(0, dailyLimit - todayCount);

  return {
    allowed: todayCount < dailyLimit,
    remaining,
    limit: dailyLimit,
    isAuthenticated: !!userId,
    userId,
    tier,
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
