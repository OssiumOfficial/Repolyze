import { Polar } from "@polar-sh/sdk";

/**
 * Polar.sh client for managing Pro subscriptions.
 *
 * Required env vars:
 * - POLAR_ACCESS_TOKEN: Server-side API access token
 * - POLAR_WEBHOOK_SECRET: Webhook signature verification secret
 * - NEXT_PUBLIC_POLAR_PRODUCT_ID: The Polar product/price ID for Pro plan
 */

let polarClient: Polar | null = null;

export function getPolarClient(): Polar {
  if (!polarClient) {
    const accessToken = process.env.POLAR_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error(
        "Missing POLAR_ACCESS_TOKEN environment variable. " +
          "Please configure your Polar.sh access token.",
      );
    }

    polarClient = new Polar({ accessToken });
  }

  return polarClient;
}

export function getPolarProductId(): string {
  const productId = process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID;
  if (!productId) {
    throw new Error(
      "Missing NEXT_PUBLIC_POLAR_PRODUCT_ID environment variable.",
    );
  }
  return productId;
}

export function getPolarWebhookSecret(): string {
  const secret = process.env.POLAR_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing POLAR_WEBHOOK_SECRET environment variable.");
  }
  return secret;
}

/**
 * Verify a Polar webhook signature.
 * Polar uses HMAC-SHA256 with the webhook secret.
 */
export async function verifyPolarWebhook(
  payload: string,
  signature: string,
): Promise<boolean> {
  const secret = getPolarWebhookSecret();

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computedSignature = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSignature === signature;
}
