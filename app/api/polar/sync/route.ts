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

  const email = session.user.email;
  console.log(`[Polar Sync] Starting sync for user=${session.user.id} email=${email}`);

  try {
    const polar = getPolarClient();

    // Find the Polar customer by email
    const customersPage = await polar.customers.list({ email });
    const customer = customersPage.result?.items?.[0];

    console.log(
      `[Polar Sync] Customer lookup: found=${!!customer}, id=${customer?.id ?? "none"}, total=${customersPage.result?.items?.length ?? 0}`,
    );

    if (!customer) {
      return Response.json({
        synced: true,
        plan: "free",
        debug: { reason: "no_customer_found", email },
      });
    }

    // Get ALL subscriptions for this customer (don't filter by active — it may be incomplete right after checkout)
    const subsPage = await polar.subscriptions.list({
      customerId: customer.id,
    });

    const allSubs = subsPage.result?.items ?? [];
    console.log(
      `[Polar Sync] Subscriptions: count=${allSubs.length}, statuses=${JSON.stringify(allSubs.map((s) => ({ id: s.id, status: s.status })))}`,
    );

    // Accept any status that means the user has paid / is paying
    const VALID_STATUSES = new Set(["active", "trialing", "incomplete", "past_due"]);
    const validSub = allSubs.find((s) => VALID_STATUSES.has(s.status));

    if (validSub) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          plan: "pro",
          polarCustomerId: validSub.customerId,
          polarSubscriptionId: validSub.id,
          planExpiresAt: validSub.currentPeriodEnd ?? null,
        },
      });

      console.log(
        `[Polar Sync] Updated user ${session.user.id} to pro (sub=${validSub.id}, status=${validSub.status})`,
      );
      return Response.json({ synced: true, plan: "pro" });
    }

    console.log(`[Polar Sync] No valid subscription found for customer ${customer.id}`);
    return Response.json({
      synced: true,
      plan: "free",
      debug: {
        reason: "no_valid_subscription",
        customerId: customer.id,
        subscriptions: allSubs.map((s) => ({ id: s.id, status: s.status })),
      },
    });
  } catch (error) {
    console.error("[Polar Sync] Error:", error);
    return Response.json(
      {
        error: "Failed to sync subscription status.",
        debug: { message: String(error) },
      },
      { status: 500 },
    );
  }
}
