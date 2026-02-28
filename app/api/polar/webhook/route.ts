import { prisma } from "@/lib/prisma";
import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { getPolarWebhookSecret } from "@/lib/polar";

export async function POST(request: Request) {
  const body = await request.text();
  const webhookSecret = getPolarWebhookSecret();

  let event: ReturnType<typeof validateEvent>;

  try {
    event = validateEvent(body, Object.fromEntries(request.headers.entries()), webhookSecret);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      return Response.json({ error: "Invalid webhook signature" }, { status: 403 });
    }
    return Response.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "subscription.created":
      case "subscription.updated": {
        const subscription = event.data;
        const userId = subscription.metadata?.userId as string | undefined;
        const customerEmail = subscription.customer?.email;

        if (!userId && !customerEmail) {
          console.warn("Polar webhook: no userId or email in subscription", subscription.id);
          break;
        }

        // Find the user by metadata userId or by email
        let user = userId
          ? await prisma.user.findUnique({ where: { id: userId } })
          : null;

        if (!user && customerEmail) {
          user = await prisma.user.findUnique({ where: { email: customerEmail } });
        }

        if (!user) {
          console.warn("Polar webhook: user not found for subscription", subscription.id);
          break;
        }

        const isActive = subscription.status === "active";

        await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: isActive ? "pro" : "free",
            polarCustomerId: subscription.customerId,
            polarSubscriptionId: subscription.id,
            planExpiresAt: subscription.currentPeriodEnd ?? null,
          },
        });

        console.log(
          `Polar: Updated user ${user.id} to plan=${isActive ? "pro" : "free"} (sub=${subscription.id})`,
        );
        break;
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        const subscription = event.data;
        const userId = subscription.metadata?.userId as string | undefined;
        const customerEmail = subscription.customer?.email;

        let user = userId
          ? await prisma.user.findUnique({ where: { id: userId } })
          : null;

        if (!user && customerEmail) {
          user = await prisma.user.findUnique({ where: { email: customerEmail } });
        }

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: "free",
              polarSubscriptionId: null,
              planExpiresAt: null,
            },
          });

          console.log(`Polar: Canceled subscription for user ${user.id}`);
        }
        break;
      }

      default:
        // Ignore other event types
        break;
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("Polar webhook processing error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
