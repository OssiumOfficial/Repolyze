import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserTier, TIER_CONFIG } from "@/lib/tiers";
import { z } from "zod";

const nameSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name is too long").trim(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      plan: true,
      polarCustomerId: true,
      polarSubscriptionId: true,
      planExpiresAt: true,
      accounts: {
        select: {
          provider: true,
          providerAccountId: true,
        },
      },
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  let tier: UserTier = "free";
  if (user.plan === "pro") {
    if (!user.planExpiresAt || user.planExpiresAt > new Date()) {
      tier = "pro";
    }
  }

  const limits = TIER_CONFIG[tier];

  // Count today's analyses
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  const todayCount = await prisma.analysisRequest.count({
    where: {
      userId: user.id,
      createdAt: { gte: startOfDay },
    },
  });

  // Count total analyses
  const totalAnalyses = await prisma.analysisRequest.count({
    where: { userId: user.id },
  });

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      createdAt: user.createdAt,
      providers: user.accounts.map((a) => a.provider),
    },
    subscription: {
      tier,
      plan: user.plan,
      polarCustomerId: user.polarCustomerId,
      polarSubscriptionId: user.polarSubscriptionId,
      expiresAt: user.planExpiresAt,
    },
    usage: {
      todayCount,
      dailyLimit: limits.dailyAnalyses,
      remaining: Math.max(0, limits.dailyAnalyses - todayCount),
      totalAnalyses,
    },
    features: limits.features,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = nameSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid name." },
        { status: 400 },
      );
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: parsed.data.name },
      select: { name: true },
    });

    return Response.json({ name: updated.name });
  } catch {
    return Response.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
