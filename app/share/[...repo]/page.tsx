import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharePageClient } from "../../../components/share-page-client";

interface SharePageProps {
  params: Promise<{
    repo: string[];
  }>;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL!;

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
  } catch {
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
}: SharePageProps): Promise<Metadata> {
  const { repo } = await params;

  if (!repo || repo.length < 2) {
    return {
      title: "Not Found | Repolyze",
      description: "Repository not found on Repolyze.",
    };
  }

  const owner = repo[0];
  const repoName = repo[1];
  const repoFullName = `${owner}/${repoName}`;

  const github = await getGitHubData(owner, repoName);

  const title = `${repoFullName} - Repository Analysis | Repolyze`;

  const description =
    github?.description && github.description.length >= 100
      ? github.description
      : `Code analysis for ${repoFullName}. Get insights on code quality, architecture, security vulnerabilities, and actionable improvement suggestions on Repolyze.`;

  const ogImageUrl = `${BASE_URL}/api/og?repo=${encodeURIComponent(
    repoName
  )}&owner=${encodeURIComponent(owner)}&stars=${
    github ? formatStars(github.stars) : "0"
  }&language=${encodeURIComponent(github?.language || "Unknown")}&score=85`;

  return {
    metadataBase: new URL(BASE_URL),
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/share/${repoFullName}`,
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

export default async function SharePage({ params }: SharePageProps) {
  const { repo } = await params;

  if (!repo || repo.length < 2) {
    notFound();
  }

  return <SharePageClient repoFullName={repo.join("/")} />;
}
