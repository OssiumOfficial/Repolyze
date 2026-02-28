import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIP } from "@/app/api/analyze/rate-limit";
import { UserTier, TIER_CONFIG } from "@/lib/tiers";

export async function GET(request: Request) {
  const session = await auth();
  const ip = getClientIP(request);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  if (session?.user?.id) {
    // Fetch the user's plan from the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    });

    let tier: UserTier = "free";
    if (user?.plan === "pro") {
      // Check if plan is still active
      if (!user.planExpiresAt || user.planExpiresAt > new Date()) {
        tier = "pro";
      }
    }

    const limits = TIER_CONFIG[tier];

    const todayCount = await prisma.analysisRequest.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: startOfDay },
      },
    });

    return Response.json({
      authenticated: true,
      tier,
      limit: limits.dailyAnalyses,
      remaining: Math.max(0, limits.dailyAnalyses - todayCount),
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  }

  const anonLimits = TIER_CONFIG.anonymous;

  const todayCount = await prisma.analysisRequest.count({
    where: {
      ip,
      userId: null,
      createdAt: { gte: startOfDay },
    },
  });

  return Response.json({
    authenticated: false,
    tier: "anonymous" as UserTier,
    limit: anonLimits.dailyAnalyses,
    remaining: Math.max(0, anonLimits.dailyAnalyses - todayCount),
    user: null,
  });
}
