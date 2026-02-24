import { z } from "zod";

const githubUrlPattern =
  /^https?:\/\/(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?.*$/;

const shorthandPattern = /^[\w.-]+\/[\w.-]+$/;

function isValidGitHubInput(input: string): boolean {
  const trimmed = input.trim();
  return githubUrlPattern.test(trimmed) || shorthandPattern.test(trimmed);
}

function normalizeToGitHubUrl(input: string): string {
  const trimmed = input.trim();

  if (githubUrlPattern.test(trimmed)) {
    const parsed = new URL(trimmed);
    const pathParts = parsed.pathname.split("/").filter(Boolean);
    if (pathParts.length >= 2) {
      return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
    }
    return trimmed.replace(/\/$/, "");
  }

  if (shorthandPattern.test(trimmed)) {
    const [owner, repo] = trimmed.split("/");
    return `https://github.com/${owner}/${repo.replace(/\.git$/, "")}`;
  }

  return trimmed;
}

export const githubUrlSchema = z
  .string()
  .min(1, "GitHub URL or owner/repo is required")
  .refine(isValidGitHubInput, {
    message:
      "Please enter a valid GitHub URL or owner/repo (e.g., ig-imanish/mx-icons)",
  })
  .transform(normalizeToGitHubUrl);

export function parseGitHubUrl(
  input: string
): { owner: string; repo: string } | null {
  const trimmed = input.trim();

  if (shorthandPattern.test(trimmed)) {
    const [owner, repo] = trimmed.split("/");
    return {
      owner,
      repo: repo.replace(/\.git$/, ""),
    };
  }

  try {
    const parsed = new URL(trimmed);
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

export function validateGitHubUrl(input: string): {
  valid: boolean;
  error?: string;
  parsed?: { owner: string; repo: string };
  normalizedUrl?: string;
} {
  const result = githubUrlSchema.safeParse(input);

  if (!result.success) {
    return {
      valid: false,
      error: result.error.issues[0]?.message || "Invalid input",
    };
  }

  const parsed = parseGitHubUrl(input);

  if (!parsed) {
    return {
      valid: false,
      error: "Could not parse repository owner and name",
    };
  }

  return {
    valid: true,
    parsed,
    normalizedUrl: result.data,
  };
}
