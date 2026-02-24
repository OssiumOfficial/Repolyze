import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/OssiumOfficial/repolyze",
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
          "User-Agent": "Repolyze-App",
          // Don't use auth for public repo stars to avoid token issues
        },
        // Revalidate every hour (3600 seconds)
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`GitHub API error (${response.status}):`, errorText);
      console.error("Rate limit remaining:", response.headers.get("x-ratelimit-remaining"));
      
      // Return a fallback value instead of erroring
      return NextResponse.json(
        { stars: null },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          },
        }
      );
    }

    const data = await response.json();

    return NextResponse.json(
      { stars: data.stargazers_count },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return NextResponse.json(
      { stars: null },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  }
}
