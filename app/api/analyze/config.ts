import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { EnvConfig } from "./types";

export const MODEL_ID = "mistralai/devstral-2512:free";

export const AI_CONFIG = {
  temperature: 0.7,
  maxOutputTokens: 4000,
} as const;

export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000, // 1 minute
  MAX_REQUESTS: 10, // 10 requests per minute
} as const;

function validateEnvVariables(): EnvConfig {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const githubToken = process.env.GITHUB_TOKEN;

  const errors: string[] = [];

  if (!openRouterApiKey) {
    errors.push("OPENROUTER_API_KEY is required but not configured");
  } else if (openRouterApiKey.length < 20) {
    errors.push("OPENROUTER_API_KEY appears to be invalid (too short)");
  }

  if (!githubToken) {
    console.warn(
      "⚠️  GITHUB_TOKEN is not configured. API rate limits will be restricted."
    );
  }

  if (errors.length > 0) {
    const errorMessage = `Environment validation failed:\n${errors
      .map((e) => `  - ${e}`)
      .join("\n")}`;
    console.error(`❌ ${errorMessage}`);
    throw new Error(errorMessage);
  }

  console.log("✅ Environment variables validated successfully");

  return {
    OPENROUTER_API_KEY: openRouterApiKey!,
    GITHUB_TOKEN: githubToken,
  };
}

let envConfig: EnvConfig;

try {
  envConfig = validateEnvVariables();
} catch (error) {
  // In development, log the error but don't crash
  // In production, this will prevent the server from starting with invalid config
  if (process.env.NODE_ENV === "production") {
    throw error;
  }
  console.error("Environment validation failed:", error);
  envConfig = {
    OPENROUTER_API_KEY: "",
    GITHUB_TOKEN: undefined,
  };
}

export { envConfig };

export function getOpenRouterClient() {
  if (!envConfig.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY environment variable is not configured"
    );
  }

  return createOpenRouter({ apiKey: envConfig.OPENROUTER_API_KEY });
}

export function isConfigured(): boolean {
  return !!envConfig.OPENROUTER_API_KEY;
}

export function hasGitHubToken(): boolean {
  return !!envConfig.GITHUB_TOKEN;
}
