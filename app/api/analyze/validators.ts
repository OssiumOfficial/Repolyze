// api/analyze/validators.ts
import { validateGitHubUrl } from "@/lib/validators";

export function sanitizeUrl(url: unknown): string {
  if (typeof url !== "string") {
    throw new Error("URL must be a string");
  }

  const sanitized = url.trim().slice(0, 500);

  if (!sanitized.includes("github.com")) {
    throw new Error("Invalid GitHub URL");
  }

  return sanitized;
}

export function sanitizeBranch(branch: unknown): string | undefined {
  if (branch === undefined || branch === null || branch === "") {
    return undefined;
  }

  if (typeof branch !== "string") {
    throw new Error("Branch must be a string");
  }

  const sanitized = branch.trim().slice(0, 256);
  const validBranchPattern = /^[\w./-]+$/;

  if (!validBranchPattern.test(sanitized)) {
    throw new Error("Invalid branch name");
  }

  return sanitized;
}

export function validateRepoIdentifiers(owner: string, repo: string): boolean {
  const validNamePattern = /^[a-zA-Z0-9_.-]+$/;
  return validNamePattern.test(owner) && validNamePattern.test(repo);
}

export function parseRequestBody(body: unknown): {
  url: string;
  branch?: string;
} {
  if (!body || typeof body !== "object" || !("url" in body)) {
    throw new Error("Missing 'url' field in request body");
  }

  const result: { url: string; branch?: string } = {
    url: (body as { url: unknown }).url as string,
  };

  if ("branch" in body) {
    result.branch = sanitizeBranch((body as { branch: unknown }).branch);
  }

  return result;
}

export function validateAndParseUrl(url: unknown): {
  owner: string;
  repo: string;
} {
  const sanitizedUrl = sanitizeUrl(url);
  const validation = validateGitHubUrl(sanitizedUrl);

  if (!validation.valid || !validation.parsed) {
    throw new Error(validation.error || "Invalid GitHub URL");
  }

  const { owner, repo } = validation.parsed;

  if (!validateRepoIdentifiers(owner, repo)) {
    throw new Error("Invalid repository owner or name");
  }

  return { owner, repo };
}
