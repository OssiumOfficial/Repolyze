import { cn } from "@/lib/utils";
import { GithubIcon, TwitterIcon } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import RepolyzeLogo from "./icons/Repolyze-logo";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="relative z-10 bg-background w-full overflow-hidden">
      <div className="h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />

      <div className="bg-background/40 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 py-10 md:py-12">
            <div className="space-y-4 max-w-xs">
              <Link href="/" className="flex items-center gap-2.5 group w-fit">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full group-hover:bg-primary/30 transition-colors" />
                  <RepolyzeLogo className="relative size-8 text-primary" />
                </div>
                <h2 className="instrument-serif text-2xl text-foreground">
                  Repolyze
                </h2>
              </Link>
              <p className="text-sm text-muted-foreground jetbrains-mono leading-relaxed">
                See what matters in your repositories,
                <br />
                with clear, actionable insights.
              </p>
            </div>

            {/* Navigation Columns Container */}
            <div className="flex flex-wrap gap-10 sm:gap-16">
              {/* Connect Column */}
              <div className="space-y-4">
                {/* <h3 className="text-sm font-medium text-foreground jetbrains-mono">
                  Connect
                </h3> */}
                <div className="flex items-center gap-2">
                  <SocialLink
                    href="https://github.com/OssiumOfficial"
                    label="GitHub"
                  >
                    <GithubIcon className="size-5" />
                  </SocialLink>
                  <SocialLink href="https://x.com/ossium_inc" label="Twitter">
                    <TwitterIcon className="size-5" />
                  </SocialLink>
                   <span className="text-xs text-muted-foreground jetbrains-mono">
                    Built With 💞 by <Link href="https://ossium.live" className="hover:underline">Ossium Inc.</Link>
                  </span>
                </div>

                <div className="flex items-end">
                  <Image
                    src="/repolyze-banner.gif"
                    alt="repolyze banner"
                    width={280}
                    height={100}
                  />
                 
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-primary/10 py-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-muted-foreground jetbrains-mono text-center sm:text-left">
                © {new Date().getFullYear()} <Link href="https://ossium.live" className="hover:underline">Ossium Inc.</Link> All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors jetbrains-mono">
                  Terms
                </Link>
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors jetbrains-mono">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  children,
  label,
}: {
  href: string;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        buttonVariants({
          variant: "ghost",
          size: "icon",
        })
      )}
      aria-label={label}
    >
      {children}
    </Link>
  );
}
