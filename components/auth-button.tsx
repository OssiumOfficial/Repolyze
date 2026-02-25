"use client";

import { useEffect, useState } from "react";
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
import { LogOut, User, Zap } from "lucide-react";

interface UsageData {
  authenticated: boolean;
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

  useEffect(() => {
    fetch("/api/auth/usage")
      .then((r) => r.json())
      .then(setUsage)
      .catch(() => {});
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
    <DropdownMenu>
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
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{usage.user?.name}</p>
          <p className="text-xs text-muted-foreground">{usage.user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 text-xs text-primary" disabled>
          <Zap className="w-3.5 h-3.5" />
          Unlimited analyses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
