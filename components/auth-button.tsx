"use client";

import { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, Zap, Sparkles, Crown, Brain, GitGraph, Bug, Download, Check } from "lucide-react";
import { UserTier } from "@/lib/tiers";

const PRO_PERKS = [
  { icon: Brain, label: "AI insights & priority analysis" },
  { icon: GitGraph, label: "Interactive data flow diagrams" },
  { icon: Bug, label: "One-click GitHub issue creation" },
  { icon: Download, label: "PDF, text & Markdown export" },
  { icon: Zap, label: "44 repo analyses per day" },
];

interface UsageData {
  authenticated: boolean;
  tier: UserTier;
  limit: number | null;
  remaining: number | null;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
}

export function AuthButton() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch((error) => console.error("Failed to fetch usage data:", error));
  }, []);

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/polar/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setUpgrading(false);
    }
  }, []);

  // Loading state
  if (!usage) {
    return (
      <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
    );
  }

  // Not authenticated — show sign-in button with remaining count
  if (!usage.authenticated) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/login" className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          <span className="hidden sm:inline">Sign in</span>
          {usage.remaining !== null && (
            <span className="text-[10px] text-muted-foreground font-normal tabular-nums">
              {usage.remaining}/{usage.limit}
            </span>
          )}
        </Link>
      </Button>
    );
  }

  // Authenticated — show avatar dropdown
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full cursor-pointer"
        >
          {usage.user?.image ? (
            <Image
              src={usage.user.image}
              alt={usage.user.name || "User"}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <User className="h-4 w-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{usage.user?.name}</p>
          <p className="text-xs text-muted-foreground">{usage.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        {usage.tier === "pro" ? (
          <DropdownMenuItem className="gap-2 text-xs text-amber-500" disabled>
            <Crown className="w-3.5 h-3.5" />
            Pro · {usage.remaining}/{usage.limit} analyses today
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem className="gap-2 text-xs text-muted-foreground" disabled>
              <Zap className="w-3.5 h-3.5" />
              Free · {usage.remaining}/{usage.limit} analyses today
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* Pro upgrade card */}
            <div className="px-0 py-2">
              <div className="rounded-lg border border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-orange-500/5 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-semibold text-foreground">Unlock Pro</span>
                </div>
                <div className="space-y-1.5 mb-3">
                  {PRO_PERKS.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded flex items-center justify-center bg-amber-500/10 shrink-0">
                        <Icon className="w-2.5 h-2.5 text-amber-500" />
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
                      <Check className="w-2.5 h-2.5 text-amber-500 ml-auto shrink-0" />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleUpgrade}
                  disabled={upgrading}
                  className="w-full h-7 rounded-md text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3 h-3" />
                  {upgrading ? "Loading..." : "Upgrade to Pro"}
                </button>
              </div>
            </div>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="gap-2 cursor-pointer">
          <Link href="/account">
            <User className="w-3.5 h-3.5" />
            Account
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="gap-2 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
