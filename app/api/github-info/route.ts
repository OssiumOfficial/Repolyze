import { NextRequest, NextResponse } from "next/server";
import { fetchRepoMetadata } from "@/lib/github";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing owner or repo" },
      { status: 400 }
    );
  }

  try {
    // Uses the server-side cache (5 min TTL)
    const data = await fetchRepoMetadata(owner, repo);

    return NextResponse.json(
      {
        name: data.name,
        fullName: data.fullName,
        description: data.description,
        stars: data.stars,
        forks: data.forks,
        language: data.language,
        owner: {
          login: data.owner.login,
          avatarUrl: data.owner.avatarUrl,
        },
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("GitHub API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository" },
      { status: 500 }
    );
  }
}
