// api/analyze/pr-generator.ts
import { CodeMetrics } from "./code-analyzer";

export interface GeneratedPR {
  id: string;
  title: string;
  description: string;
  body: string;
  branch: string;
  baseBranch: string;
  labels: string[];
  priority: "low" | "medium" | "high";
  category: string;
  estimatedEffort: string;
  files: PRFileChange[];
  reviewers?: string[];
}

export interface PRFileChange {
  path: string;
  action: "create" | "modify" | "delete";
  content?: string;
  description: string;
}

export function generatePRSuggestions(
  metrics: CodeMetrics,
  repoName: string,
  primaryLanguage: string | null,
  defaultBranch: string = "main",
): GeneratedPR[] {
  const prs: GeneratedPR[] = [];
  let id = 1;

  // PR: Add CI/CD Pipeline
  if (!metrics.hasCI) {
    const isTS = metrics.hasTypeScript;
    const workflowContent = generateCIWorkflowContent(primaryLanguage, metrics);

    prs.push({
      id: `pr-${id++}`,
      title: "ci: Add GitHub Actions CI pipeline",
      description:
        "Set up continuous integration with automated testing, linting, and type checking.",
      branch: "feat/add-ci-pipeline",
      baseBranch: defaultBranch,
      labels: ["ci", "automation", "enhancement"],
      priority: "high",
      category: "DevOps",
      estimatedEffort: "30 minutes",
      files: [
        {
          path: ".github/workflows/ci.yml",
          action: "create",
          content: workflowContent,
          description: "GitHub Actions workflow for CI",
        },
      ],
      body: `## Summary
This PR adds a GitHub Actions CI pipeline to automate testing and code quality checks.

## Changes
- Add \`.github/workflows/ci.yml\` with:
  - Automated testing on push and PR
  - ${isTS ? "TypeScript type checking" : "Linting"}
  - ${metrics.hasLinting ? "ESLint validation" : "Code quality checks"}
  - Multi-version Node.js testing (18.x, 20.x)

## Why
- Catch bugs before they reach production
- Ensure consistent code quality
- Automate repetitive checks
- Build confidence in code changes

## Testing
- [ ] Workflow runs successfully on push
- [ ] Workflow runs on pull requests
- [ ] All checks pass

## Checklist
- [ ] CI workflow file added
- [ ] Tested locally with \`act\` (optional)
- [ ] Documentation updated if needed`,
    });
  }

  // PR: Add ESLint & Prettier
  if (!metrics.hasLinting || !metrics.hasPrettier) {
    const files: PRFileChange[] = [];

    if (!metrics.hasLinting) {
      files.push({
        path: "eslint.config.js",
        action: "create",
        content: generateESLintConfig(metrics.hasTypeScript),
        description: "ESLint configuration with recommended rules",
      });
    }

    if (!metrics.hasPrettier) {
      files.push({
        path: ".prettierrc",
        action: "create",
        content: `{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}`,
        description: "Prettier configuration for consistent formatting",
      });

      files.push({
        path: ".prettierignore",
        action: "create",
        content: `node_modules
dist
build
.next
coverage
*.min.js
*.min.css
pnpm-lock.yaml
package-lock.json
yarn.lock`,
        description: "Files to ignore for Prettier",
      });
    }

    const missingTools = [
      !metrics.hasLinting && "ESLint",
      !metrics.hasPrettier && "Prettier",
    ].filter(Boolean);

    prs.push({
      id: `pr-${id++}`,
      title: `chore: Add ${missingTools.join(" and ")} configuration`,
      description: `Set up ${missingTools.join(" and ")} for consistent code style and quality.`,
      branch: "chore/add-linting-formatting",
      baseBranch: defaultBranch,
      labels: ["code-quality", "tooling", "enhancement"],
      priority: "medium",
      category: "Code Quality",
      estimatedEffort: "20 minutes",
      files,
      body: `## Summary
This PR adds ${missingTools.join(" and ")} to enforce consistent code style and catch potential issues.

## Changes
${files.map((f) => `- Add \`${f.path}\`: ${f.description}`).join("\n")}

## Package Updates
Add to \`package.json\` devDependencies:
\`\`\`json
{
  "devDependencies": {
    ${
      !metrics.hasLinting
        ? `"eslint": "^9.0.0",
    "@eslint/js": "^9.0.0",
    ${metrics.hasTypeScript ? `"typescript-eslint": "^8.0.0",` : ""}
    "globals": "^15.0.0",`
        : ""
    }
    ${!metrics.hasPrettier ? `"prettier": "^3.3.0"` : ""}
  }
}
\`\`\`

## Scripts to Add
\`\`\`json
{
  "scripts": {
    ${
      !metrics.hasLinting
        ? `"lint": "eslint .",
    "lint:fix": "eslint . --fix",`
        : ""
    }
    ${
      !metrics.hasPrettier
        ? `"format": "prettier --write .",
    "format:check": "prettier --check ."`
        : ""
    }
  }
}
\`\`\`

## Why
- Maintain consistent code style across the team
- Catch potential bugs early
- Reduce code review friction
- Automate formatting decisions

## Checklist
- [ ] Configuration files added
- [ ] Dependencies installed
- [ ] Scripts added to package.json
- [ ] Existing code formatted/linted`,
    });
  }

  // PR: Add TypeScript strict mode
  if (metrics.hasTypeScript && !metrics.strictMode) {
    prs.push({
      id: `pr-${id++}`,
      title: "chore: Enable TypeScript strict mode",
      description:
        "Enable strict type checking for better type safety and fewer runtime errors.",
      branch: "chore/typescript-strict-mode",
      baseBranch: defaultBranch,
      labels: ["typescript", "code-quality", "enhancement"],
      priority: "medium",
      category: "Type Safety",
      estimatedEffort: "1-3 hours",
      files: [
        {
          path: "tsconfig.json",
          action: "modify",
          content: `{
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
    "noUnusedParameters": true,
    // ... rest of your config
  }
}`,
          description: "Enable strict compiler options",
        },
      ],
      body: `## Summary
Enable TypeScript strict mode for improved type safety and catch more bugs at compile time.

## Changes
- Update \`tsconfig.json\` with strict compiler options

## Strict Options Enabled
| Option | Description |
|--------|-------------|
| \`strict\` | Enable all strict type checking options |
| \`noImplicitAny\` | Error on expressions with implied \`any\` type |
| \`strictNullChecks\` | Enable strict null checking |
| \`strictFunctionTypes\` | Enable strict function type checking |
| \`noUncheckedIndexedAccess\` | Add \`undefined\` to index signatures |
| \`noImplicitReturns\` | Error when not all paths return a value |

## Migration Strategy
1. Enable one option at a time if needed
2. Fix type errors incrementally
3. Use \`// @ts-expect-error\` sparingly for complex cases

## Why
- Catch more bugs at compile time
- Better IDE autocomplete and refactoring
- Self-documenting code through types
- Easier maintenance long-term

## Breaking Changes
This may surface existing type issues that need to be fixed.

## Checklist
- [ ] tsconfig.json updated
- [ ] All type errors resolved
- [ ] Tests passing
- [ ] No \`any\` types added to fix errors`,
    });
  }

  // PR: Add Testing Infrastructure
  if (!metrics.hasTests) {
    const isTS = metrics.hasTypeScript;
    const testConfig = generateTestConfig(isTS);
    const exampleTest = generateExampleTest(isTS);

    prs.push({
      id: `pr-${id++}`,
      title: "test: Add Vitest testing infrastructure",
      description: "Set up Vitest for unit testing with coverage reporting.",
      branch: "feat/add-testing",
      baseBranch: defaultBranch,
      labels: ["testing", "enhancement", "infrastructure"],
      priority: "high",
      category: "Testing",
      estimatedEffort: "1-2 hours",
      files: [
        {
          path: isTS ? "vitest.config.ts" : "vitest.config.js",
          action: "create",
          content: testConfig,
          description: "Vitest configuration with coverage",
        },
        {
          path: isTS
            ? "src/__tests__/example.test.ts"
            : "src/__tests__/example.test.js",
          action: "create",
          content: exampleTest,
          description: "Example test file to get started",
        },
      ],
      body: `## Summary
Add Vitest testing framework with coverage reporting to enable automated testing.

## Changes
- Add \`${isTS ? "vitest.config.ts" : "vitest.config.js"}\` with coverage configuration
- Add example test file in \`src/__tests__/\`

## Package Updates
\`\`\`bash
npm install -D vitest @vitest/coverage-v8
\`\`\`

## Scripts to Add
\`\`\`json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
\`\`\`

## Directory Structure
\`\`\`
src/
├── __tests__/
│   ├── example.test.${isTS ? "ts" : "js"}
│   └── ... more tests
├── components/
│   └── Button/
│       ├── Button.tsx
│       └── Button.test.tsx
\`\`\`

## Why
- Prevent regressions with automated tests
- Document expected behavior
- Enable safe refactoring
- Build confidence in deployments

## Next Steps
1. Write tests for critical business logic
2. Add tests for utility functions
3. Consider integration tests for API routes
4. Set up CI to run tests automatically

## Checklist
- [ ] Vitest configured
- [ ] Example test passing
- [ ] Coverage reporting works
- [ ] Scripts added to package.json`,
    });
  }

  // PR: Add .env.example
  if (!metrics.hasEnvExample) {
    prs.push({
      id: `pr-${id++}`,
      title: "docs: Add .env.example for environment setup",
      description:
        "Document required environment variables with an example file.",
      branch: "docs/add-env-example",
      baseBranch: defaultBranch,
      labels: ["documentation", "dx", "enhancement"],
      priority: "medium",
      category: "Documentation",
      estimatedEffort: "15 minutes",
      files: [
        {
          path: ".env.example",
          action: "create",
          content: generateEnvExample(repoName),
          description: "Example environment variables file",
        },
      ],
      body: `## Summary
Add a \`.env.example\` file to document required environment variables and help new contributors set up the project quickly.

## Changes
- Add \`.env.example\` with documented environment variables

## Why
- New contributors can set up quickly
- Documents all required configuration
- Prevents "it works on my machine" issues
- Security best practice (no real secrets in repo)

## Usage
\`\`\`bash
# Copy the example file
cp .env.example .env

# Edit with your values
nano .env
\`\`\`

## Checklist
- [ ] All required variables documented
- [ ] Sensitive values use placeholder text
- [ ] Added to README setup instructions`,
    });
  }

  // PR: Add Dependabot
  if (!metrics.hasSecurityConfig) {
    prs.push({
      id: `pr-${id++}`,
      title: "ci: Add Dependabot for automated dependency updates",
      description:
        "Configure Dependabot to automatically create PRs for dependency updates.",
      branch: "chore/add-dependabot",
      baseBranch: defaultBranch,
      labels: ["dependencies", "security", "automation"],
      priority: "medium",
      category: "Security",
      estimatedEffort: "10 minutes",
      files: [
        {
          path: ".github/dependabot.yml",
          action: "create",
          content: generateDependabotConfig(primaryLanguage),
          description: "Dependabot configuration for automated updates",
        },
      ],
      body: `## Summary
Add Dependabot configuration to automatically keep dependencies up-to-date with security patches and updates.

## Changes
- Add \`.github/dependabot.yml\` with weekly update schedule

## Features
- 📅 Weekly dependency checks
- 🔒 Automatic security updates
- 📦 Grouped minor/patch updates
- 🏷️ Auto-labeled PRs

## Why
- Stay current with security patches
- Reduce manual maintenance burden
- Get notified of breaking changes early
- Maintain a healthy dependency tree

## Configuration
- **Schedule**: Weekly (Mondays)
- **Open PR Limit**: 5 at a time
- **Grouping**: Minor and patch updates together
- **Labels**: \`dependencies\`, \`automated\`

## Checklist
- [ ] Dependabot config added
- [ ] Verified ecosystem matches project
- [ ] Team notified about incoming PRs`,
    });
  }

  // PR: Add Pre-commit Hooks
  if (
    !metrics.existingAutomations.includes("Husky hooks") &&
    (metrics.hasLinting || metrics.hasPrettier)
  ) {
    prs.push({
      id: `pr-${id++}`,
      title: "chore: Add pre-commit hooks with Husky and lint-staged",
      description:
        "Enforce code quality checks before commits with automated hooks.",
      branch: "chore/add-precommit-hooks",
      baseBranch: defaultBranch,
      labels: ["dx", "code-quality", "automation"],
      priority: "low",
      category: "Developer Experience",
      estimatedEffort: "20 minutes",
      files: [
        {
          path: ".husky/pre-commit",
          action: "create",
          content: `#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx lint-staged`,
          description: "Pre-commit hook to run lint-staged",
        },
        {
          path: ".lintstagedrc",
          action: "create",
          content: JSON.stringify(
            {
              "*.{js,jsx,ts,tsx}": [
                metrics.hasLinting ? "eslint --fix" : null,
                metrics.hasPrettier ? "prettier --write" : null,
              ].filter(Boolean),
              "*.{json,md,yml,yaml}": metrics.hasPrettier
                ? ["prettier --write"]
                : [],
            },
            null,
            2,
          ),
          description: "lint-staged configuration",
        },
      ],
      body: `## Summary
Add pre-commit hooks using Husky and lint-staged to automatically format and lint code before commits.

## Changes
- Add \`.husky/pre-commit\` hook
- Add \`.lintstagedrc\` configuration

## Installation
\`\`\`bash
npm install -D husky lint-staged
npx husky init
\`\`\`

## How It Works
1. Developer stages files with \`git add\`
2. On \`git commit\`, Husky triggers the pre-commit hook
3. lint-staged runs linters only on staged files
4. If checks pass, commit proceeds
5. If checks fail, commit is blocked

## Why
- ✅ Consistent code style in every commit
- ✅ Fast (only checks staged files)
- ✅ Prevents broken commits
- ✅ Works automatically

## Checklist
- [ ] Husky installed
- [ ] lint-staged configured
- [ ] Pre-commit hook working
- [ ] Team notified of new workflow`,
    });
  }

  // PR: Add CONTRIBUTING.md
  if (!metrics.hasContributing) {
    prs.push({
      id: `pr-${id++}`,
      title: "docs: Add CONTRIBUTING.md guide",
      description:
        "Add a contributing guide to help new contributors get started.",
      branch: "docs/add-contributing",
      baseBranch: defaultBranch,
      labels: ["documentation", "good-first-issue", "community"],
      priority: "low",
      category: "Documentation",
      estimatedEffort: "30 minutes",
      files: [
        {
          path: "CONTRIBUTING.md",
          action: "create",
          content: generateContributingGuide(repoName, metrics),
          description: "Contributing guidelines for the project",
        },
      ],
      body: `## Summary
Add a CONTRIBUTING.md file to help new contributors understand how to contribute to the project.

## Changes
- Add \`CONTRIBUTING.md\` with:
  - Getting started guide
  - Development setup
  - Code style guidelines
  - PR process
  - Issue reporting

## Why
- Lower barrier for new contributors
- Document project conventions
- Reduce maintainer burden
- Build community

## Checklist
- [ ] Contributing guide added
- [ ] Linked from README
- [ ] Code of conduct referenced (if exists)`,
    });
  }

  // Sort by priority
  return prs
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 8);
}

// Helper functions
function generateCIWorkflowContent(
  language: string | null,
  metrics: CodeMetrics,
): string {
  const isTS = metrics.hasTypeScript;
  const hasTests = metrics.hasTests;

  return `name: CI

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      ${
        metrics.hasLinting
          ? `
      - name: Run linter
        run: npm run lint`
          : ""
      }
      ${
        isTS
          ? `
      - name: Type check
        run: npx tsc --noEmit`
          : ""
      }
      ${
        hasTests
          ? `
      - name: Run tests
        run: npm test`
          : `
      - name: Build
        run: npm run build --if-present`
      }`;
}

function generateESLintConfig(isTS: boolean): string {
  if (isTS) {
    return `import js from "@eslint/js";
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
  },
  {
    ignores: ["node_modules", "dist", "build", ".next", "coverage"],
  }
);`;
  }

  return `import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: ["node_modules", "dist", "build", "coverage"],
  },
];`;
}

function generateTestConfig(isTS: boolean): string {
  return `import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}', '__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/*',
      ],
    },
  },
});`;
}

function generateExampleTest(isTS: boolean): string {
  return `import { describe, it, expect } from 'vitest';

describe('Example Test Suite', () => {
  it('should pass a basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should handle strings', () => {
    const greeting = 'Hello, World!';
    expect(greeting).toContain('Hello');
    expect(greeting).toHaveLength(13);
  });

  it('should handle async operations', async () => {
    const fetchData = () => Promise.resolve({ id: 1, name: 'Test' });
    const data = await fetchData();
    
    expect(data).toEqual({ id: 1, name: 'Test' });
    expect(data.id).toBe(1);
  });

  it('should handle arrays', () => {
    const items = [1, 2, 3, 4, 5];
    
    expect(items).toHaveLength(5);
    expect(items).toContain(3);
    expect(items.filter(n => n > 2)).toEqual([3, 4, 5]);
  });
});

// TODO: Add tests for your actual code
// Example:
// import { myFunction } from '../lib/utils';
// 
// describe('myFunction', () => {
//   it('should do something', () => {
//     expect(myFunction(input)).toBe(expectedOutput);
//   });
// });`;
}

function generateEnvExample(repoName: string): string {
  return `# ${repoName} Environment Variables
# Copy this file to .env and update the values

# ===================
# Application
# ===================
NODE_ENV=development
PORT=3000

# ===================
# Database (if applicable)
# ===================
# DATABASE_URL=postgresql://user:password@localhost:5432/${repoName}
# REDIS_URL=redis://localhost:6379

# ===================
# Authentication (if applicable)
# ===================
# JWT_SECRET=your-super-secret-jwt-key-change-in-production
# SESSION_SECRET=your-session-secret

# ===================
# External APIs
# ===================
# API_KEY=your_api_key_here
# GITHUB_TOKEN=your_github_token

# ===================
# Third-party Services
# ===================
# STRIPE_SECRET_KEY=sk_test_...
# SENDGRID_API_KEY=SG....

# ===================
# Feature Flags
# ===================
# ENABLE_ANALYTICS=true
# DEBUG_MODE=false`;
}

function generateDependabotConfig(language: string | null): string {
  const ecosystem = getPackageEcosystem(language);

  return `version: 2
updates:
  # Maintain dependencies for the primary package manager
  - package-ecosystem: "${ecosystem}"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
      timezone: "UTC"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore(deps):"
    groups:
      # Group minor and patch updates together
      minor-and-patch:
        patterns:
          - "*"
        update-types:
          - "minor"
          - "patch"

  # Keep GitHub Actions up to date
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "github-actions"
    commit-message:
      prefix: "ci(deps):"`;
}

function generateContributingGuide(
  repoName: string,
  metrics: CodeMetrics,
): string {
  return `# Contributing to ${repoName}

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

Please be respectful and constructive in all interactions. We're all here to learn and build something great together.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/${repoName}.git
   cd ${repoName}
   \`\`\`
3. **Add the upstream remote**:
   \`\`\`bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/${repoName}.git
   \`\`\`

## Development Setup

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables**:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your values
   \`\`\`

3. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## Making Changes

1. **Create a new branch**:
   \`\`\`bash
   git checkout -b feat/your-feature-name
   \`\`\`

2. **Make your changes** following our style guidelines

3. **Test your changes**:
   \`\`\`bash
   ${metrics.hasTests ? "npm test" : "npm run build"}
   ${metrics.hasLinting ? "npm run lint" : ""}
   \`\`\`

4. **Commit your changes**:
   \`\`\`bash
   git commit -m "feat: add new feature"
   \`\`\`

### Commit Message Format

We follow [Conventional Commits](https://conventionalcommits.org/):

- \`feat:\` New feature
- \`fix:\` Bug fix
- \`docs:\` Documentation changes
- \`style:\` Code style changes (formatting, etc.)
- \`refactor:\` Code refactoring
- \`test:\` Adding or updating tests
- \`chore:\` Maintenance tasks

## Pull Request Process

1. **Update your branch** with the latest upstream changes:
   \`\`\`bash
   git fetch upstream
   git rebase upstream/main
   \`\`\`

2. **Push your branch**:
   \`\`\`bash
   git push origin feat/your-feature-name
   \`\`\`

3. **Create a Pull Request** on GitHub

4. **Fill out the PR template** with:
   - Description of changes
   - Related issue (if any)
   - Screenshots (if applicable)
   - Testing notes

5. **Wait for review** and address any feedback

## Style Guidelines

${metrics.hasLinting ? "- Run `npm run lint` before committing" : "- Follow existing code patterns"}
${metrics.hasPrettier ? "- Run `npm run format` to format code" : "- Use consistent indentation (2 spaces)"}
${metrics.hasTypeScript ? "- Ensure TypeScript types are correct" : ""}
- Write meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Questions?

Feel free to open an issue if you have questions or need help!`;
}

function getPackageEcosystem(language: string | null): string {
  const ecosystems: Record<string, string> = {
    JavaScript: "npm",
    TypeScript: "npm",
    Python: "pip",
    Go: "gomod",
    Rust: "cargo",
    Java: "maven",
    Ruby: "bundler",
  };
  return ecosystems[language || ""] || "npm";
}
