import { prisma } from "@/lib/prisma";

/**
 * POST /api/admin/set-plan
 *
 * Manually set a user's plan. Protected by ADMIN_SECRET env var.
 *
 * Body: { email: string, plan: "free" | "pro", secret: string }
 *
 * Usage:
 *   curl -X POST https://repolyze.ossium.live/api/admin/set-plan \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"user@example.com","plan":"pro","secret":"YOUR_ADMIN_SECRET"}'
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, plan, secret } = body;

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!email || !["free", "pro"].includes(plan)) {
      return Response.json(
        { error: "Invalid request. Provide email and plan ('free' | 'pro')." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findFirst({ where: { email } });
    if (!user) {
      return Response.json({ error: `No user found with email: ${email}` }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { plan },
    });

    console.log(`[Admin] Set plan for ${email} to ${plan}`);

    return Response.json({
      success: true,
      user: { id: updated.id, email: updated.email, plan: updated.plan },
    });
  } catch (error) {
    console.error("[Admin] set-plan error:", error);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
