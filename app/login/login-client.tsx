"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import RepolyzeLogo from "@/components/icons/Repolyze-logo";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

export function LoginClient() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-200 h-200 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <Card className="border-border/50 shadow-xl shadow-primary/5">
          <CardHeader className="text-center space-y-4 pb-2">
            <Link href="/" className="inline-flex items-center justify-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
                <RepolyzeLogo className="relative size-15 text-primary" />
              </div>
            </Link>
            <div>
              <h1 className="text-2xl font-medium instrument-serif tracking-wider">
                Sign in to Repolyze
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Sign in to Get unlimited repository analyses
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 pt-0">
            <Button
              variant="outline"
              className="w-full h-11 gap-3 cursor-pointer"
              onClick={() => signIn("github", { callbackUrl: "/" })}
            >
              <HugeiconsIcon
                icon={GithubIcon}
                className="w-5 h-5"
                strokeWidth={1.5}
              />
              Continue with GitHub
            </Button>

            <Button
              variant="outline"
              className="w-full h-11 gap-3 cursor-pointer"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </Button>

            <div className="pt-3 border-t border-border/50">
              <p className="text-xs text-center text-muted-foreground">
                By continuing, you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy Policy</Link>.{" "}
               
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
