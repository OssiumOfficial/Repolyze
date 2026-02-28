import { auth } from "@/lib/auth";
import { getPolarClient, getPolarProductId } from "@/lib/polar";
import { headers } from "next/headers";

function getAppUrl(requestHeaders: Headers): string {
  // 1. Explicit env var
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  // 2. Detect from request headers (works for localhost and production)
  const host = requestHeaders.get("host");
  const proto = requestHeaders.get("x-forwarded-proto") || "http";
  if (host) return `${proto}://${host}`;

  // 3. Fallback
  return "https://repolyze.ossium.live";
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return Response.json(
      { error: "You must be signed in to subscribe." },
      { status: 401 },
    );
  }

  try {
    const polar = getPolarClient();
    const productId = getPolarProductId();
    const appUrl = getAppUrl(request.headers);

    const checkout = await polar.checkouts.create({
      products: [productId],
      successUrl: `${appUrl}?upgrade=success`,
      customerEmail: session.user.email,
      metadata: {
        userId: session.user.id,
      },
    });

    return Response.json({ url: checkout.url });
  } catch (error) {
    console.error("Polar checkout error:", error);
    return Response.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
