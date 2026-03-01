import { NextRequest } from "next/server";
import { fetchRepoMetadata, fetchRepoBranches } from "@/lib/github";
import { validateAndParseUrl } from "../analyze/validators";
import { checkRateLimit, getClientIP } from "../analyze/rate-limit";

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const rateLimit = checkRateLimit(clientIP);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return Response.json({ error: "URL is required" }, { status: 400 });
    }

    const { owner, repo } = validateAndParseUrl(url);

    // Both use server-side cache
    const metadata = await fetchRepoMetadata(owner, repo);
    const branches = await fetchRepoBranches(
      owner,
      repo,
      metadata.defaultBranch
    );

    return Response.json(
      {
        branches,
        defaultBranch: metadata.defaultBranch,
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching branches:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch branches",
      },
      { status: 400 }
    );
  }
}
