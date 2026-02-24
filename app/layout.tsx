import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  JetBrains_Mono,
  Instrument_Serif,
} from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AnalysisProvider } from "@/context/analysis-context";
import "./fonts.css";
import { ThemeProvider } from "@/context/theme-provider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const siteUrl = "https://repolyze.vercel.app";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  // Basic Meta Tags
  title: {
    default: "Repolyze | Analyze any public GitHub repository with AI",
    template: "%s | Repolyze",
  },
  description:
    "Analyze GitHub repositories with AI to uncover code quality issues, architecture insights, dependencies, and security vulnerabilities in seconds.",
  applicationName: "Repolyze",
  authors: [{ name: "Ossium Inc.", url: "https://x.com/ossium_live" }],
  generator: "Next.js",
  keywords: [
    "GitHub",
    "repository analysis",
    "code quality",
    "AI analysis",
    "code review",
    "developer tools",
    "open source",
    "software architecture",
    "dependency analysis",
    "security scanning",
    "code metrics",
    "technical debt",
    "repository insights",
    "GitHub automation",
    "code health",
    "Repolyze",
    "github repo analyzer",
  ],
  referrer: "origin-when-cross-origin",
  creator: "ossium_live",
  publisher: "ossium_live",
  category: "Developer Tools",

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#5bbad5",
      },
    ],
  },

  // Manifest
  manifest: "/site.webmanifest",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Repolyze",
    title: "Repolyze - Analyze any public GitHub repository with AI",
    description:
      "Analyze any GitHub repository with AI. Get instant insights on code quality, architecture, dependencies, and security vulnerabilities.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Repolyze - Analyze any public GitHub repository with AI",
        type: "image/png",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    site: "@ossium_live",
    creator: "@ossium_live",
    title: "Repolyze - Analyze any public GitHub repository with AI",
    description:
      "Analyze any GitHub repository with AI. Get instant insights on code quality, architecture, and security.",
    images: {
      url: `${siteUrl}/og-image.png`,
      alt: "Repolyze - Analyze any public GitHub repository with AI",
    },
  },

  // Canonical URL
  alternates: {
    canonical: siteUrl,
  },

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Repolyze",
  },

  // Format Detection
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Other
  other: {
    "msapplication-TileColor": "#0a0a0a",
    "msapplication-config": "/browserconfig.xml",
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Repolyze",
  description:
    "AI-powered GitHub repository analysis tool for developers. Get instant insights on code quality, architecture, dependencies, and security vulnerabilities.",
  url: siteUrl,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Person",
    name: "ossium_live",
    url: "https://x.com/ossium_live",
    sameAs: ["https://x.com/ossium_live", "https://twitter.com/ossium_live"],
  },
  creator: {
    "@type": "Person",
    name: "ossium_live",
    url: "https://x.com/ossium_live",
  },
  screenshot: `${siteUrl}/screenshot.png`,
  featureList: [
    "AI-powered code analysis",
    "Repository structure visualization",
    "Dependency analysis",
    "Security vulnerability detection",
    "Code quality metrics",
    "Actionable improvement suggestions",
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <script defer src="https://cloud.umami.is/script.js" data-website-id="6e029032-21a0-4877-852d-b2bd209fd575"></script>
      <body
        className={cn(
          geistSans.variable,
          geistMono.variable,
          jetBrainsMono.variable,
          instrumentSerif.variable,
          "antialiased"
        )}
      >
        <Script
          id="json-ld"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AnalysisProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AnalysisProvider>
      </body>
    </html>
  );
}
