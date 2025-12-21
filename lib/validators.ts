import { z } from "zod";

const githubUrlPattern =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?.*$/;

export const githubUrlSchema = z
  .string()
  .min(1, "GitHub URL is required")
  .regex(githubUrlPattern, "Please enter a valid GitHub repository URL")
  .transform((url) => {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
    }
    return url.replace(/\/$/, "");
  });

export function parseGitHubUrl(
  url: string
): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1].replace(/\.git$/, ""),
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function validateGitHubUrl(url: string): {
  valid: boolean;
  error?: string;
  parsed?: { owner: string; repo: string };
} {
  const result = githubUrlSchema.safeParse(url);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Invalid URL",
    };
  }

  const parsed = parseGitHubUrl(result.data);

  if (!parsed) {
    return {
      valid: false,
      error: "Could not parse repository owner and name",
    };
  }

  return { valid: true, parsed };
}
