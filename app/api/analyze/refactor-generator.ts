// api/analyze/refactor-generator.ts
import { CodeMetrics } from "./code-analyzer";

export interface GeneratedRefactor {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  category: string;
  files: string[];
  suggestedCode?: string;
}

export function generateRefactors(
  metrics: CodeMetrics,
  repoName: string,
  primaryLanguage: string | null,
): GeneratedRefactor[] {
  const refactors: GeneratedRefactor[] = [];
  let id = 1;

  // TypeScript strict mode
  if (metrics.hasTypeScript && !metrics.strictMode) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Enable TypeScript strict mode",
      description:
        "Enable strict type checking in tsconfig.json to catch more bugs at compile time and improve code quality.",
      impact: "high",
      effort: "medium",
      category: "Type Safety",
      files: ["tsconfig.json"],
      suggestedCode: `// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}`,
    });
  }

  // Missing ESLint
  if (
    !metrics.hasLinting &&
    (metrics.hasTypeScript || primaryLanguage === "JavaScript")
  ) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add ESLint for code linting",
      description:
        "Set up ESLint to enforce consistent code style and catch potential errors early in development.",
      impact: "medium",
      effort: "low",
      category: "Code Quality",
      files: ["package.json", "eslint.config.js"],
      suggestedCode: `// Install dependencies
npm install -D eslint @eslint/js typescript-eslint globals

// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  }
);

// Add to package.json scripts:
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}`,
    });
  }

  // Missing Prettier
  if (
    !metrics.hasPrettier &&
    (metrics.hasTypeScript || primaryLanguage === "JavaScript")
  ) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add Prettier for code formatting",
      description:
        "Set up Prettier to automatically format code and maintain consistent style across the codebase.",
      impact: "low",
      effort: "low",
      category: "Code Quality",
      files: ["package.json", ".prettierrc"],
      suggestedCode: `// Install Prettier
npm install -D prettier

// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}

// .prettierignore
node_modules
dist
build
.next
coverage
*.min.js

// Add to package.json scripts:
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}`,
    });
  }

  // Missing .env.example
  if (!metrics.hasEnvExample) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add .env.example file",
      description:
        "Create a .env.example file to document required environment variables and help new contributors set up the project.",
      impact: "medium",
      effort: "low",
      category: "Documentation",
      files: [".env.example"],
      suggestedCode: `# .env.example
# Copy this file to .env and fill in the values

# Application
NODE_ENV=development
PORT=3000

# Database (if applicable)
DATABASE_URL=postgresql://user:password@localhost:5432/database

# API Keys (replace with your own)
API_KEY=your_api_key_here

# Authentication (if applicable)
JWT_SECRET=your_jwt_secret_here

# External Services
# GITHUB_TOKEN=your_github_token
# OPENAI_API_KEY=your_openai_key`,
    });
  }

  // Missing tests
  if (!metrics.hasTests) {
    const isTS = metrics.hasTypeScript;
    refactors.push({
      id: `ref-${id++}`,
      title: "Add testing infrastructure",
      description:
        "Set up a testing framework to ensure code quality and prevent regressions. Tests are essential for maintainable software.",
      impact: "high",
      effort: "medium",
      category: "Testing",
      files: [
        "package.json",
        isTS ? "vitest.config.ts" : "vitest.config.js",
        "src/__tests__/example.test.ts",
      ],
      suggestedCode: isTS
        ? `// Install Vitest
npm install -D vitest @vitest/coverage-v8

// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules', 'dist', '**/*.d.ts'],
    },
  },
});

// src/__tests__/example.test.ts
import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('hello');
    expect(result).toBe('hello');
  });
});

// Add to package.json scripts:
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}`
        : `// Install Jest
npm install -D jest

// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/*.test.js'],
  collectCoverageFrom: ['src/**/*.js'],
};

// src/__tests__/example.test.js
describe('Example Test Suite', () => {
  test('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });
});

// Add to package.json scripts:
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}`,
    });
  }

  // Large files detected
  if (metrics.largeFiles.length > 0) {
    const topLargeFiles = metrics.largeFiles.slice(0, 3);
    refactors.push({
      id: `ref-${id++}`,
      title: "Split large files into smaller modules",
      description: `Large files (${topLargeFiles.join(", ")}) should be broken down into smaller, focused modules for better maintainability and testability.`,
      impact: "medium",
      effort: "high",
      category: "Code Organization",
      files: topLargeFiles.map((f) => f.split(" ")[0]),
      suggestedCode: `// Strategies for splitting large files:

// 1. Extract related functions into separate utility files
// Before: utils.ts with 50+ functions
// After:
//   - utils/string.ts
//   - utils/date.ts
//   - utils/validation.ts
//   - utils/index.ts (re-exports)

// 2. Split components by responsibility
// Before: Dashboard.tsx (500+ lines)
// After:
//   - Dashboard/index.tsx (main component)
//   - Dashboard/DashboardHeader.tsx
//   - Dashboard/DashboardSidebar.tsx
//   - Dashboard/DashboardContent.tsx
//   - Dashboard/hooks/useDashboardData.ts

// 3. Use barrel exports for clean imports
// utils/index.ts
export * from './string';
export * from './date';
export * from './validation';

// Usage remains clean:
import { formatDate, validateEmail } from '@/utils';`,
    });
  }

  // Missing error handling patterns
  if (!metrics.codePatterns.hasErrorHandling) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add consistent error handling",
      description:
        "Implement proper error handling patterns to improve reliability and debugging experience.",
      impact: "high",
      effort: "medium",
      category: "Error Handling",
      files: ["src/lib/errors.ts", "src/lib/api-client.ts"],
      suggestedCode: `// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(\`\${resource} not found\`, 'NOT_FOUND', 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

// Usage in API routes:
export async function handleRequest(handler: () => Promise<Response>) {
  try {
    return await handler();
  } catch (error) {
    if (error instanceof AppError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    console.error('Unexpected error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`,
    });
  }

  // Missing input validation
  if (!metrics.codePatterns.hasValidation) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add input validation with Zod",
      description:
        "Use Zod for runtime type validation to ensure data integrity and provide better error messages.",
      impact: "high",
      effort: "low",
      category: "Validation",
      files: ["package.json", "src/lib/validations.ts"],
      suggestedCode: `// Install Zod
npm install zod

// src/lib/validations.ts
import { z } from 'zod';

// Define schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().int().positive().optional(),
});

export const createUserSchema = userSchema.omit({ id: true });

// Type inference
export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;

// Validation helper
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    throw new ValidationError(errors[0].message, errors[0].field);
  }
  return result.data;
}

// Usage in API route:
export async function POST(request: Request) {
  const body = await request.json();
  const data = validate(createUserSchema, body);
  // data is now typed as CreateUser
}`,
    });
  }

  // Missing logging
  if (!metrics.codePatterns.hasLogging) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Add structured logging",
      description:
        "Implement structured logging for better debugging, monitoring, and production troubleshooting.",
      impact: "medium",
      effort: "low",
      category: "Observability",
      files: ["package.json", "src/lib/logger.ts"],
      suggestedCode: `// Install pino (fast JSON logger)
npm install pino pino-pretty

// src/lib/logger.ts
import pino from 'pino';

const isDev = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
    service: '${repoName}',
  },
});

// Create child loggers for different modules
export const createLogger = (module: string) => 
  logger.child({ module });

// Usage:
const log = createLogger('api');

log.info({ userId: '123' }, 'User logged in');
log.error({ err, requestId }, 'Failed to process request');
log.debug({ data }, 'Processing data');`,
    });
  }

  // Vulnerable dependencies
  if (metrics.vulnerablePatterns.length > 0) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Update deprecated dependencies",
      description: `Replace deprecated packages with modern alternatives: ${metrics.vulnerablePatterns.slice(0, 2).join("; ")}`,
      impact: "medium",
      effort: "medium",
      category: "Dependencies",
      files: ["package.json"],
      suggestedCode: `// Common dependency migrations:

// moment.js → date-fns or dayjs
// Before: import moment from 'moment';
// After:
import { format, parseISO, differenceInDays } from 'date-fns';
format(new Date(), 'yyyy-MM-dd');

// request → node-fetch or axios
// Before: import request from 'request';
// After:
import axios from 'axios';
const response = await axios.get(url);

// node-sass → sass (dart-sass)
// Just update package.json:
// "sass": "^1.69.0" instead of "node-sass"

// tslint → eslint with typescript-eslint
// See ESLint migration guide above

// Run npm audit to check for vulnerabilities:
npm audit
npm audit fix

// For automated updates, consider:
npx npm-check-updates -u`,
    });
  }

  // Deep nesting
  if (metrics.deepNesting.length > 5) {
    refactors.push({
      id: `ref-${id++}`,
      title: "Flatten directory structure",
      description:
        "Reduce directory nesting depth to improve navigation and module imports. Deep nesting makes the codebase harder to maintain.",
      impact: "low",
      effort: "medium",
      category: "Code Organization",
      files: metrics.deepNesting.slice(0, 3),
      suggestedCode: `// Recommended directory structure (max 4 levels deep):

src/
├── components/          # Shared UI components
│   ├── ui/             # Primitives (Button, Input, etc.)
│   └── features/       # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and helpers
├── services/           # API clients and external services
├── types/              # TypeScript types/interfaces
└── app/                # Next.js app router pages

// Use barrel exports to simplify imports:
// components/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Card } from './card';

// Then import from the barrel:
import { Button, Input, Card } from '@/components/ui';

// Configure path aliases in tsconfig.json:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    }
  }
}`,
    });
  }

  // Sort by impact (high first) and effort (low first)
  return refactors
    .sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      const effortOrder = { low: 0, medium: 1, high: 2 };
      const impactDiff = impactOrder[a.impact] - impactOrder[b.impact];
      if (impactDiff !== 0) return impactDiff;
      return effortOrder[a.effort] - effortOrder[b.effort];
    })
    .slice(0, 6); // Return top 6 most relevant
}
