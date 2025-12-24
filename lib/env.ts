/**
 * @fileoverview Environment variable validation and access
 *
 * @security
 * All environment variables are validated at runtime.
 * Server-only variables do NOT use NEXT_PUBLIC_ prefix.
 */

/**
 * Server-side environment variables (not exposed to client)
 */
interface ServerEnv {
  /** OpenRouter API key for AI analysis */
  OPENROUTER_API_KEY: string;
  /** GitHub token for increased API rate limits (optional) */
  GITHUB_TOKEN?: string;
}

/**
 * Validates and returns server environment variables
 *
 * @throws {Error} If required environment variables are missing
 * @returns Validated server environment variables
 *
 * @security
 * This function should only be called in server-side code:
 * - API routes (app/api/*)
 * - Server Components
 * - Server Actions
 *
 * @example
 * // In API route
 * const env = getServerEnv();
 * const client = createOpenRouter({ apiKey: env.OPENROUTER_API_KEY });
 */
export function getServerEnv(): ServerEnv {
  // Ensure we're on the server
  if (typeof window !== "undefined") {
    throw new Error(
      "getServerEnv() was called on the client side. " +
        "This function should only be used in server-side code."
    );
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterKey) {
    throw new Error(
      "Missing required environment variable: OPENROUTER_API_KEY. " +
        "Please add it to your .env.local file."
    );
  }

  if (openRouterKey.length < 20) {
    throw new Error(
      "OPENROUTER_API_KEY appears to be invalid. " +
        "Please check your API key."
    );
  }

  // Warn if GitHub token is missing (optional but recommended)
  if (!process.env.GITHUB_TOKEN) {
    console.warn(
      "GITHUB_TOKEN is not set. GitHub API rate limits will be restricted to 60 requests/hour. " +
        "Consider adding a GitHub token for increased limits (5000 requests/hour)."
    );
  }

  return {
    OPENROUTER_API_KEY: openRouterKey,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  };
}

/**
 * Checks if the server environment is properly configured
 *
 * @returns Object with configuration status for each service
 *
 * @example
 * const status = checkServerEnv();
 * // { openrouter: true, github: false }
 */
export function checkServerEnv(): { openrouter: boolean; github: boolean } {
  return {
    openrouter: !!process.env.OPENROUTER_API_KEY,
    github: !!process.env.GITHUB_TOKEN,
  };
}
