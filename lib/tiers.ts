/**
 * User tier system for feature gating and rate limiting.
 *
 * Tiers:
 * - anonymous: Not logged in
 * - free: Logged in, no subscription
 * - pro: Logged in with active Polar.sh subscription
 */

export type UserTier = "anonymous" | "free" | "pro";

export interface TierLimits {
  dailyAnalyses: number;
  features: {
    aiInsights: boolean;
    dataFlow: boolean;
    issues: boolean;
    downloadText: boolean;
    downloadMarkdown: boolean;
    downloadPdf: boolean;
    share: boolean;
  };
}

export const TIER_CONFIG: Record<UserTier, TierLimits> = {
  anonymous: {
    dailyAnalyses: 1,
    features: {
      aiInsights: false,
      dataFlow: false,
      issues: false,
      downloadText: false,
      downloadMarkdown: false,
      downloadPdf: false,
      share: true,
    },
  },
  free: {
    dailyAnalyses: 3,
    features: {
      aiInsights: false, // Pro only
      dataFlow: false, // Pro only
      issues: true,
      downloadText: true,
      downloadMarkdown: true,
      downloadPdf: true,
      share: true,
    },
  },
  pro: {
    dailyAnalyses: 44,
    features: {
      aiInsights: true,
      dataFlow: true,
      issues: true,
      downloadText: true,
      downloadMarkdown: true,
      downloadPdf: true,
      share: true,
    },
  },
};

export function getTierLimits(tier: UserTier): TierLimits {
  return TIER_CONFIG[tier];
}

export function canAccessFeature(
  tier: UserTier,
  feature: keyof TierLimits["features"],
): boolean {
  return TIER_CONFIG[tier].features[feature];
}

/**
 * Determine what message to show for a locked feature
 */
export function getGateMessage(
  tier: UserTier,
  feature: keyof TierLimits["features"],
): { title: string; description: string; action: "login" | "upgrade" } | null {
  if (canAccessFeature(tier, feature)) return null;

  if (tier === "anonymous") {
    return {
      title: "Sign in to unlock",
      description: "Create a free account to get 3 daily analyses, issue creation, and full exports.",
      action: "login",
    };
  }

  // Free user trying to access pro feature
  return {
    title: "Upgrade to Pro",
    description: "Get AI-powered insights, data flow diagrams, and 44 daily analyses.",
    action: "upgrade",
  };
}
