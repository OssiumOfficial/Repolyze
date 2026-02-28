"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  Crown,
  Sparkles,
  Shield,
  Mail,
  Calendar,
  BarChart3,
  Zap,
  Brain,
  GitGraph,
  Bug,
  Download,
  Share2,
  Check,
  X,
  LogOut,
  CreditCard,
  ExternalLink,
  Github,
  Pencil,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface AccountData {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    createdAt: string;
    providers: string[];
  };
  subscription: {
    tier: "free" | "pro";
    plan: string;
    polarCustomerId: string | null;
    polarSubscriptionId: string | null;
    expiresAt: string | null;
  };
  usage: {
    todayCount: number;
    dailyLimit: number;
    remaining: number;
    totalAnalyses: number;
  };
  features: Record<string, boolean>;
}

const FEATURE_DETAILS = [
  { key: "aiInsights", icon: Brain, label: "AI Insights", description: "AI-powered strengths, weaknesses & priority analysis" },
  { key: "dataFlow", icon: GitGraph, label: "Data Flow Diagrams", description: "Interactive architecture & data flow visualizations" },
  { key: "issues", icon: Bug, label: "GitHub Issues", description: "One-click GitHub issue creation from analysis" },
  { key: "downloadText", icon: Download, label: "Text Export", description: "Export analysis as plain text" },
  { key: "downloadMarkdown", icon: Download, label: "Markdown Export", description: "Export analysis as Markdown" },
  { key: "downloadPdf", icon: Download, label: "PDF Export", description: "Export analysis as PDF document" },
  { key: "share", icon: Share2, label: "Share Analysis", description: "Generate shareable analysis links" },
] as const;

const PROVIDER_ICONS: Record<string, { icon: typeof Github; label: string }> = {
  github: { icon: Github, label: "GitHub" },
  google: { icon: Mail, label: "Google" },
};

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  // Nickname editing
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    fetch("/api/auth/account")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d) {
          setData(d);
          setNameValue(d.user.name || "");
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const handleUpgrade = useCallback(async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/polar/checkout", { method: "POST" });
      const result = await res.json();
      if (result.url) window.location.href = result.url;
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setUpgrading(false);
    }
  }, []);

  const handleSaveName = useCallback(async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) {
      setNameError("Name can't be empty");
      return;
    }
    if (trimmed.length > 50) {
      setNameError("Name is too long (max 50 characters)");
      return;
    }

    setSavingName(true);
    setNameError("");
    try {
      const res = await fetch("/api/auth/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      const result = await res.json();
      if (!res.ok) {
        setNameError(result.error || "Failed to update");
        return;
      }
      setData((prev) => prev ? { ...prev, user: { ...prev.user, name: result.name } } : prev);
      setNameValue(result.name);
      setEditingName(false);
    } catch {
      setNameError("Failed to update name");
    } finally {
      setSavingName(false);
    }
  }, [nameValue]);

  const CardSkeleton = () => (
    <Card>
      <CardContent className="pt-6 space-y-3">
        <div className="h-4 w-1/3 bg-muted animate-pulse rounded" />
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  );

  const user = data?.user;
  const subscription = data?.subscription;
  const usage = data?.usage;
  const features = data?.features;
  const isPro = subscription?.tier === "pro";
  const usagePercent = usage && usage.dailyLimit > 0 ? (usage.todayCount / usage.dailyLimit) * 100 : 0;
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="size-4" />
          Back to home
        </Link>

        {/* Page header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Account</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your profile, subscription, and usage</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ─── Profile Card ─── */}
          {loading ? <CardSkeleton /> : user && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    width={56}
                    height={56}
                    className="rounded-full ring-2 ring-border"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center ring-2 ring-border">
                    <span className="text-lg font-medium text-muted-foreground">
                      {user.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {editingName ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={nameValue}
                          onChange={(e) => {
                            setNameValue(e.target.value);
                            setNameError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveName();
                            if (e.key === "Escape") {
                              setEditingName(false);
                              setNameValue(user.name || "");
                              setNameError("");
                            }
                          }}
                          placeholder="Your name"
                          className="h-8 text-sm max-w-[200px]"
                          maxLength={50}
                          autoFocus
                          disabled={savingName}
                        />
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs"
                          onClick={handleSaveName}
                          disabled={savingName}
                        >
                          {savingName ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-xs"
                          onClick={() => {
                            setEditingName(false);
                            setNameValue(user.name || "");
                            setNameError("");
                          }}
                          disabled={savingName}
                        >
                          Cancel
                        </Button>
                      </div>
                      {nameError && (
                        <p className="text-xs text-destructive">{nameError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold truncate">{user.name || "Unnamed"}</h2>
                      {isPro && (
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          PRO
                        </Badge>
                      )}
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        title="Edit name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>Member since {memberSince}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
                {user.providers.length > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                    {user.providers.map((provider) => {
                      const p = PROVIDER_ICONS[provider];
                      if (!p) return null;
                      const ProvIcon = p.icon;
                      return (
                        <Badge key={provider} variant="secondary" className="gap-1 text-xs font-normal">
                          <ProvIcon className="w-3 h-3" />
                          {p.label}
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          )}

          {/* ─── Subscription Card ─── */}
          {loading ? <CardSkeleton /> : subscription && usage && (
          <Card className={isPro ? "border-amber-500/30" : ""}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  Subscription
                </CardTitle>
                <Badge
                  className={
                    isPro
                      ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {isPro ? "Pro" : "Free"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isPro ? (
                <>
                  <div className="rounded-lg bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5 border border-amber-500/20 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-amber-500" />
                      <span className="font-semibold">Pro Plan</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Full access to all features including AI insights, data flow diagrams, and {usage.dailyLimit} daily analyses.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    {subscription.expiresAt && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Renews{" "}
                          {new Date(subscription.expiresAt).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                    {subscription.polarSubscriptionId && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CreditCard className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-mono text-xs truncate">
                          {subscription.polarSubscriptionId.slice(0, 8)}...
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href="https://polar.sh/settings/subscriptions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Manage on Polar
                      </a>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
                    <p className="text-sm text-muted-foreground">
                      You&apos;re on the <span className="font-medium text-foreground">Free plan</span> with {usage.dailyLimit} analyses per day.
                      Upgrade to unlock AI insights, data flow diagrams, and more.
                    </p>
                  </div>
                  <Button
                    onClick={handleUpgrade}
                    disabled={upgrading}
                    className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    {upgrading ? "Loading..." : "Upgrade to Pro"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          )}

          {/* ─── Usage Card ─── */}
          {loading ? <CardSkeleton /> : usage && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Today&apos;s analyses</span>
                  <span className="font-medium tabular-nums">
                    {usage.todayCount} / {usage.dailyLimit}
                  </span>
                </div>
                <Progress
                  value={usagePercent}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  {usage.remaining} remaining today · Resets at midnight UTC
                </p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tabular-nums">{usage.totalAnalyses}</p>
                  <p className="text-xs text-muted-foreground">Total analyses</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tabular-nums">{usage.dailyLimit}</p>
                  <p className="text-xs text-muted-foreground">Daily limit</p>
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {/* ─── Features Card ─── */}
          {loading ? <CardSkeleton /> : features && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {FEATURE_DETAILS.map(({ key, icon: Icon, label, description }) => {
                  const hasAccess = features[key] ?? false;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          hasAccess
                            ? "bg-emerald-500/10 text-emerald-500"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{label}</span>
                          {hasAccess ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-muted-foreground px-1.5 py-0">
                              Pro
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      </div>
                      {!hasAccess && (
                        <X className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                    </div>
                  );
                })}
              </div>
              {!isPro && (
                <>
                  <Separator className="my-4" />
                  <div className="flex items-center gap-3 text-sm">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-muted-foreground">
                      Upgrade to Pro to unlock all features
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUpgrade}
                      disabled={upgrading}
                      className="ml-auto gap-1 text-xs"
                    >
                      <Crown className="w-3 h-3" />
                      Upgrade
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          )}

          {/* ─── Sign Out ─── */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Sign out</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account on this device</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
