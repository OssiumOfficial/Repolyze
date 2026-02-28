"use client";

import { Lock, LogIn, Sparkles, Check, Brain, GitGraph, Bug, Download, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { UserTier, canAccessFeature, getGateMessage, TierLimits } from "@/lib/tiers";
import { signIn } from "next-auth/react";
import { useCallback, useState } from "react";

const PRO_FEATURES = [
  { icon: Brain, label: "AI insights — strengths, weaknesses & priorities" },
  { icon: GitGraph, label: "Interactive data flow diagrams" },
  { icon: Bug, label: "One-click GitHub issue creation" },
  { icon: Download, label: "Export as PDF, plain text & Markdown" },
  { icon: Zap, label: "44 repo analyses per day" },
];

const FREE_FEATURES = [
  { icon: Bug, label: "One-click GitHub issue creation" },
  { icon: Download, label: "Export as PDF, plain text & Markdown" },
  { icon: Zap, label: "3 repo analyses per day" },
];

interface FeatureGateProps {
  tier: UserTier;
  feature: keyof TierLimits["features"];
  /**
   * The title to show in the gate card (e.g. "AI Insights", "Data Flow")
   */
  featureLabel: string;
  /**
   * Optional icon to show
   */
  icon?: React.ReactNode;
  /**
   * Optional className for the outer wrapper
   */
  className?: string;
  /**
   * The child content to render when the feature is unlocked.
   * When locked, the children are NOT rendered at all (not just hidden).
   */
  children: React.ReactNode;
}

/**
 * Feature gate component that conditionally renders children based on user tier.
 * When locked:
 * - Does NOT render children at all (prevents data from being in DOM)
 * - Shows a visually appealing blurred placeholder with action prompt
 */
export function FeatureGate({
  tier,
  feature,
  featureLabel,
  icon,
  className,
  children,
}: FeatureGateProps) {
  const hasAccess = canAccessFeature(tier, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const gate = getGateMessage(tier, feature);
  if (!gate) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <FeatureLockedCard
        title={gate.title}
        description={gate.description}
        action={gate.action}
        featureLabel={featureLabel}
        icon={icon}
      />
    </div>
  );
}

interface FeatureLockedCardProps {
  title: string;
  description: string;
  action: "login" | "upgrade";
  featureLabel: string;
  icon?: React.ReactNode;
}

function FeatureLockedCard({
  title,
  description,
  action,
  featureLabel,
  icon,
}: FeatureLockedCardProps) {
  const [loading, setLoading] = useState(false);

  const handleAction = useCallback(async () => {
    if (action === "login") {
      signIn();
    } else {
      setLoading(true);
      try {
        const res = await fetch("/api/polar/checkout", { method: "POST" });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          console.error("Failed to create checkout:", data.error);
        }
      } catch (err) {
        console.error("Checkout error:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [action]);

  const features = action === "upgrade" ? PRO_FEATURES : FREE_FEATURES;

  return (
    <Card className="border-border/60 overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/80" />
        <div className="absolute inset-0 backdrop-blur-[2px]" />

        {/* Fake content bars */}
        <div className="p-4 sm:p-6 space-y-3 opacity-20 pointer-events-none select-none" aria-hidden="true">
          <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
          <div className="h-3 w-full bg-muted-foreground/10 rounded" />
          <div className="h-3 w-4/5 bg-muted-foreground/10 rounded" />
          <div className="h-3 w-3/5 bg-muted-foreground/10 rounded" />
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="h-20 bg-muted-foreground/10 rounded-lg" />
            <div className="h-20 bg-muted-foreground/10 rounded-lg" />
          </div>
          <div className="h-3 w-full bg-muted-foreground/10 rounded" />
          <div className="h-3 w-2/3 bg-muted-foreground/10 rounded" />
        </div>

        {/* Centered lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CardContent className="flex flex-col items-center text-center max-w-sm p-6">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-3",
              action === "login"
                ? "bg-primary/10 border border-primary/20"
                : "bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30",
            )}>
              {action === "login" ? (
                <Lock className="w-5 h-5 text-primary" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-500" />
              )}
            </div>

            <h3 className="text-base font-semibold text-foreground mb-0.5">
              {title}
            </h3>

            <p className="text-xs text-muted-foreground/80 mb-3">
              {description}
            </p>

            {/* Feature list */}
            <div className="w-full mb-4 space-y-1.5">
              {features.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-left">
                  <div className={cn(
                    "w-5 h-5 rounded-md flex items-center justify-center shrink-0",
                    action === "upgrade"
                      ? "bg-amber-500/10"
                      : "bg-primary/10",
                  )}>
                    <Icon className={cn(
                      "w-3 h-3",
                      action === "upgrade" ? "text-amber-500" : "text-primary",
                    )} />
                  </div>
                  <span className="text-xs text-muted-foreground">{label}</span>
                  <Check className={cn(
                    "w-3 h-3 ml-auto shrink-0",
                    action === "upgrade" ? "text-amber-500" : "text-primary",
                  )} />
                </div>
              ))}
            </div>

            <Button
              onClick={handleAction}
              disabled={loading}
              size="sm"
              className={cn(
                "gap-2 w-full",
                action === "upgrade" &&
                  "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0",
              )}
            >
              {action === "login" ? (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In Free
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {loading ? "Loading..." : "Upgrade to Pro"}
                </>
              )}
            </Button>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
