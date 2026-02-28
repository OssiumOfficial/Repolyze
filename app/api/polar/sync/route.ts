import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPolarClient } from "@/lib/polar";

/**
 * POST /api/polar/sync
 *
 * Manually sync the user's subscription status from Polar.
 * Called after a successful checkout redirect as a fallback
 * in case the webhook hasn't fired yet (e.g. localhost, slow webhook).
 */
export async function POST() {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const polar = getPolarClient();

    // Find the Polar customer by email
    const customers = await polar.customers.list({
      email: session.user.email,
    });

    const customer = customers.result?.items?.[0];
    if (!customer) {
      return Response.json({ synced: true, plan: "free" });
    }

    // Find active subscriptions for this customer
    const subscriptions = await polar.subscriptions.list({
      customerId: customer.id,
      active: true,
    });

    const activeSub = subscriptions.result?.items?.[0];

    if (activeSub && activeSub.status === "active") {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: "pro",
          polarCustomerId: activeSub.customerId,
          polarSubscriptionId: activeSub.id,
          planExpiresAt: activeSub.currentPeriodEnd ?? null,
        },
      });

      return Response.json({ synced: true, plan: "pro" });
    }

    return Response.json({ synced: true, plan: "free" });
  } catch (error) {
    console.error("Polar sync error:", error);
    return Response.json(
      { error: "Failed to sync subscription status." },
      { status: 500 },
    );
  }
}
