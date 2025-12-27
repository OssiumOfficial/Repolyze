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

export function validateRepoIdentifiers(owner: string, repo: string): boolean {
  const validNamePattern = /^[a-zA-Z0-9_.-]+$/;
  return validNamePattern.test(owner) && validNamePattern.test(repo);
}

export function parseRequestBody(body: unknown): { url: string } {
  if (!body || typeof body !== "object" || !("url" in body)) {
    throw new Error("Missing 'url' field in request body");
  }

  return { url: (body as { url: unknown }).url as string };
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
