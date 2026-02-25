import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getClientIP } from "@/app/api/analyze/rate-limit";

const ANON_DAILY_LIMIT = 3;

export async function GET(request: Request) {
  const session = await auth();
  const ip = getClientIP(request);

  if (session?.user) {
    return Response.json({
      authenticated: true,
      limit: null,
      remaining: null,
      user: {
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
    });
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const todayCount = await prisma.analysisRequest.count({
    where: {
      ip,
      userId: null,
      createdAt: { gte: startOfDay },
    },
  });

  return Response.json({
    authenticated: false,
    limit: ANON_DAILY_LIMIT,
    remaining: Math.max(0, ANON_DAILY_LIMIT - todayCount),
    user: null,
  });
}
