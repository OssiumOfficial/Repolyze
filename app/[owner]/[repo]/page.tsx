import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface AnalyzePageProps {
  params: Promise<{
    owner: string;
    repo: string;
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://repolyze.ossium.live";

async function getGitHubData(owner: string, repo: string) {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      description: data.description || "",
      stars: data.stargazers_count,
      language: data.language || "Unknown",
    };
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
    return null;
  }
}

function formatStars(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

export async function generateMetadata({
  params,
}: AnalyzePageProps): Promise<Metadata> {
  const { owner, repo } = await params;

  if (!owner || !repo) {
    return {
      title: "Not Found | Repolyze",
      description: "Repository not found on Repolyze.",
    };
  }

  const repoFullName = `${owner}/${repo}`;
  const github = await getGitHubData(owner, repo);

  const title = `${repoFullName} - Repository Analysis | Repolyze`;

  const description =
    github?.description && github.description.length >= 100
      ? github.description
      : `Analyze ${repoFullName} with AI. Get instant insights on code quality, architecture, security vulnerabilities, and actionable improvement suggestions on Repolyze.`;

  const ogImageUrl = `${BASE_URL}/api/og?repo=${encodeURIComponent(
    repo
  )}&owner=${encodeURIComponent(owner)}&stars=${
    github ? formatStars(github.stars) : "0"
  }&language=${encodeURIComponent(github?.language || "Unknown")}`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${repoFullName}`,
      siteName: "Repolyze",
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${repoFullName} Analysis`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function AnalyzePage({ params }: AnalyzePageProps) {
  const { owner, repo } = await params;

  if (!owner || !repo) {
    notFound();
  }

  // Validate that the repository exists
  const github = await getGitHubData(owner, repo);
  
  if (!github) {
    notFound();
  }

  const repoFullName = `${owner}/${repo}`;
  const repoUrl = `https://github.com/${repoFullName}`;

  // Redirect to home page with repo parameter to start analysis
  redirect(`/?repo=${encodeURIComponent(repoUrl)}`);
}
