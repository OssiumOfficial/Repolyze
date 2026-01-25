// api/analyze/automation-generator.ts
import { CodeMetrics } from "./code-analyzer";

export interface GeneratedAutomation {
  id: string;
  type: "issue" | "pull-request" | "workflow";
  title: string;
  description: string;
  body: string;
  labels: string[];
  priority: "low" | "medium" | "high";
  category: string;
  estimatedEffort: string;
  files?: string[];
}

export function generateAutomations(
  metrics: CodeMetrics,
  repoName: string,
  primaryLanguage: string | null,
): GeneratedAutomation[] {
  const automations: GeneratedAutomation[] = [];
  let id = 1;

  // High priority: Missing CI/CD
  if (!metrics.hasCI) {
    const workflow = generateCIWorkflow(primaryLanguage, metrics);
    automations.push({
      id: `auto-${id++}`,
      type: "workflow",
      title: `Add ${workflow.name} CI workflow`,
      description: `Set up automated testing and linting on push/PR`,
      body: `## Summary
This PR adds a GitHub Actions workflow for continuous integration.

## What it does
${workflow.features.map((f) => `- ${f}`).join("\n")}

## File to create
\`.github/workflows/ci.yml\`

\`\`\`yaml
${workflow.content}
\`\`\`

## Benefits
- Catch bugs before merging
- Enforce code quality standards
- Automated testing on every PR`,
      labels: ["automation", "ci", "enhancement"],
      priority: "high",
      category: "DevOps",
      estimatedEffort: "30 minutes",
      files: [".github/workflows/ci.yml"],
    });
  }

  // High priority: No tests detected
  if (!metrics.hasTests && metrics.hasCI) {
    const testSetup = generateTestSetup(primaryLanguage, metrics);
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: `Set up testing framework (${testSetup.framework})`,
      description: `Add unit testing infrastructure to improve code reliability`,
      body: `## Problem
No test files were detected in this repository. Tests are essential for:
- Preventing regressions
- Documenting expected behavior  
- Enabling safe refactoring

## Proposed Solution
Set up **${testSetup.framework}** testing framework.

### Installation
\`\`\`bash
${testSetup.install}
\`\`\`

### Configuration
${testSetup.config}

### Example Test
\`\`\`${testSetup.language}
${testSetup.example}
\`\`\`

### NPM Script
Add to \`package.json\`:
\`\`\`json
{
  "scripts": {
    "test": "${testSetup.script}",
    "test:watch": "${testSetup.watchScript}"
  }
}
\`\`\`

## Suggested First Tests
${testSetup.suggestions.map((s) => `- [ ] ${s}`).join("\n")}

## Acceptance Criteria
- [ ] Testing framework installed and configured
- [ ] At least 3 unit tests passing
- [ ] CI updated to run tests`,
      labels: ["testing", "enhancement", "good first issue"],
      priority: "high",
      category: "Testing",
      estimatedEffort: "2-4 hours",
    });
  }

  // Medium priority: Missing security scanning
  if (!metrics.hasSecurityConfig) {
    automations.push({
      id: `auto-${id++}`,
      type: "workflow",
      title: "Add Dependabot for automated dependency updates",
      description: "Keep dependencies up-to-date with automated PRs",
      body: `## Summary
Enable Dependabot to automatically create PRs for dependency updates.

## File to create
\`.github/dependabot.yml\`

\`\`\`yaml
version: 2
updates:
  - package-ecosystem: "${getPackageEcosystem(primaryLanguage)}"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
    labels:
      - "dependencies"
      - "automated"
    commit-message:
      prefix: "chore(deps):"
    groups:
      minor-and-patch:
        update-types:
          - "minor"
          - "patch"
\`\`\`

## Benefits
- 🔒 Automatic security updates
- 📦 Stay current with latest versions
- 🤖 Reduces manual maintenance burden

## Additional: Security workflow
Also consider adding:
\`\`\`yaml
# .github/workflows/security.yml
name: Security Scan
on:
  schedule:
    - cron: '0 0 * * 1'
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=moderate
\`\`\``,
      labels: ["security", "dependencies", "automation"],
      priority: "medium",
      category: "Security",
      estimatedEffort: "15 minutes",
      files: [".github/dependabot.yml"],
    });
  }

  // Medium priority: Exposed secrets
  if (metrics.exposedSecrets.length > 0) {
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: "🚨 Security: Potential secrets detected in codebase",
      description: "Investigate and remove hardcoded secrets",
      body: `## ⚠️ Security Alert
Potential hardcoded secrets were detected during analysis.

## Detected Locations
${metrics.exposedSecrets.map((s) => `- ${s}`).join("\n")}

## Required Actions
1. **Immediate**: Rotate any exposed credentials
2. **Remove** hardcoded values from source code
3. **Add** values to environment variables
4. **Create** \`.env.example\` with placeholder values

## Prevention
Add pre-commit hooks to prevent future leaks:

\`\`\`bash
npm install -D husky
npx husky init
\`\`\`

Add to \`.husky/pre-commit\`:
\`\`\`bash
#!/bin/sh
# Check for potential secrets
if git diff --cached --name-only | xargs grep -l -E "(API_KEY|SECRET|PASSWORD|TOKEN)\\s*=\\s*['\"][^'\"]+['\"]" 2>/dev/null; then
  echo "Error: Potential secret detected. Use environment variables instead."
  exit 1
fi
\`\`\`

## Resources
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [git-secrets by AWS](https://github.com/awslabs/git-secrets)`,
      labels: ["security", "critical", "bug"],
      priority: "high",
      category: "Security",
      estimatedEffort: "1-2 hours",
    });
  }

  // Medium priority: Missing .env.example
  if (
    !metrics.hasEnvExample &&
    metrics.missingEssentials.includes(".env.example")
  ) {
    automations.push({
      id: `auto-${id++}`,
      type: "pull-request",
      title: "Add .env.example for environment variable documentation",
      description: "Document required environment variables for easier setup",
      body: `## Summary
Add a \`.env.example\` file to document required environment variables.

## Why
- New contributors can set up the project faster
- Documents all required configuration
- Prevents "it works on my machine" issues

## Template
Create \`.env.example\`:
\`\`\`env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API Keys
API_KEY=your_api_key_here

# App Config
NODE_ENV=development
PORT=3000

# Add actual variables based on your .env file
\`\`\`

## Checklist
- [ ] Copy variables from \`.env\` (without values)
- [ ] Add descriptive comments
- [ ] Update README with setup instructions
- [ ] Add to \`.gitignore\` if not present: \`.env\` and \`.env.local\``,
      labels: ["documentation", "enhancement"],
      priority: "medium",
      category: "Documentation",
      estimatedEffort: "15 minutes",
      files: [".env.example"],
    });
  }

  // Medium priority: TypeScript without strict mode
  if (metrics.hasTypeScript && !metrics.strictMode) {
    automations.push({
      id: `auto-${id++}`,
      type: "pull-request",
      title: "Enable TypeScript strict mode for better type safety",
      description: "Incrementally enable strict type checking",
      body: `## Summary
Enable strict mode in TypeScript for better type safety and fewer runtime errors.

## Current State
TypeScript is configured but strict mode is disabled.

## Proposed Changes
Update \`tsconfig.json\`:
\`\`\`json
{
  "compilerOptions": {
    "strict": true,
    // Or enable incrementally:
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
\`\`\`

## Migration Strategy
1. Enable one strict option at a time
2. Fix type errors in each batch
3. Use \`// @ts-expect-error\` temporarily for complex cases
4. Aim for full strict mode within 2-3 iterations

## Benefits
- Catch more bugs at compile time
- Better IDE autocomplete
- Self-documenting code
- Easier refactoring`,
      labels: ["typescript", "code-quality", "enhancement"],
      priority: "medium",
      category: "Code Quality",
      estimatedEffort: "2-4 hours",
      files: ["tsconfig.json"],
    });
  }

  // Low priority: Missing pre-commit hooks
  if (
    !metrics.existingAutomations.includes("Husky hooks") &&
    metrics.hasLinting
  ) {
    automations.push({
      id: `auto-${id++}`,
      type: "pull-request",
      title: "Add pre-commit hooks with Husky and lint-staged",
      description: "Enforce code quality before commits",
      body: `## Summary
Add pre-commit hooks to run linting on staged files before each commit.

## Installation
\`\`\`bash
npm install -D husky lint-staged
npx husky init
\`\`\`

## Configuration
Add to \`package.json\`:
\`\`\`json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  }
}
\`\`\`

Update \`.husky/pre-commit\`:
\`\`\`bash
#!/bin/sh
npx lint-staged
\`\`\`

## Benefits
- ✅ Consistent code style
- ✅ No broken commits
- ✅ Fast (only checks staged files)
- ✅ Works locally before CI`,
      labels: ["dx", "automation", "enhancement"],
      priority: "low",
      category: "Developer Experience",
      estimatedEffort: "20 minutes",
      files: ["package.json", ".husky/pre-commit"],
    });
  }

  // Low priority: Vulnerable dependencies
  for (const vuln of metrics.vulnerablePatterns.slice(0, 2)) {
    automations.push({
      id: `auto-${id++}`,
      type: "issue",
      title: `Dependency: ${vuln.split(" ")[0]}`,
      description: vuln,
      body: `## Issue
${vuln}

## Impact
Deprecated packages:
- May have known security vulnerabilities
- Won't receive updates or patches
- Could break with newer Node.js versions

## Migration Guide
Research the recommended replacement and create a migration PR.

## Resources
- Check npm for alternatives
- Review the deprecation notice for migration paths`,
      labels: ["dependencies", "tech-debt"],
      priority: "low",
      category: "Dependencies",
      estimatedEffort: "1-3 hours",
    });
  }

  return automations.slice(0, 6); // Return top 6 most relevant
}

function generateCIWorkflow(
  language: string | null,
  metrics: CodeMetrics,
): { name: string; content: string; features: string[] } {
  const isTS = metrics.hasTypeScript;
  const hasTests = metrics.hasTests;

  if (language === "TypeScript" || language === "JavaScript" || isTS) {
    const features = [
      "Runs on push to main and pull requests",
      "Tests on Node.js 18.x and 20.x",
    ];
    if (metrics.hasLinting) features.push("Runs ESLint");
    if (isTS) features.push("Type checks with TypeScript");
    if (hasTests) features.push("Runs test suite");

    return {
      name: "Node.js",
      features,
      content: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Use Node.js \${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      ${
        metrics.hasLinting
          ? `
      - name: Lint
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
      - name: Test
        run: npm test`
          : `
      - name: Build
        run: npm run build --if-present`
      }`,
    };
  }

  if (language === "Python") {
    return {
      name: "Python",
      features: [
        "Runs on push to main and pull requests",
        "Tests on Python 3.9, 3.10, 3.11",
        "Installs dependencies",
        "Runs pytest",
      ],
      content: `name: Python CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.9', '3.10', '3.11']
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python \${{ matrix.python-version }}
        uses: actions/setup-python@v5
        with:
          python-version: \${{ matrix.python-version }}
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Test with pytest
        run: pytest --cov=./ --cov-report=xml`,
    };
  }

  // Generic fallback
  return {
    name: "Generic",
    features: ["Runs on push and PRs", "Basic build check"],
    content: `name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build check
        run: echo "Add your build commands here"`,
  };
}

function generateTestSetup(
  language: string | null,
  metrics: CodeMetrics,
): {
  framework: string;
  language: string;
  install: string;
  config: string;
  example: string;
  script: string;
  watchScript: string;
  suggestions: string[];
} {
  if (
    metrics.hasTypeScript ||
    language === "TypeScript" ||
    language === "JavaScript"
  ) {
    return {
      framework: "Vitest",
      language: "typescript",
      install: "npm install -D vitest @vitest/coverage-v8",
      config: `Create \`vitest.config.ts\`:
\`\`\`typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
})
\`\`\``,
      example: `import { describe, it, expect } from 'vitest'

describe('Example', () => {
  it('should work', () => {
    expect(1 + 1).toBe(2)
  })
})`,
      script: "vitest run",
      watchScript: "vitest",
      suggestions: [
        "Test utility functions first (pure functions are easiest)",
        "Add tests for API route handlers",
        "Test validation logic",
        "Add integration tests for critical paths",
      ],
    };
  }

  return {
    framework: "Jest",
    language: "javascript",
    install: "npm install -D jest",
    config: 'Add `"jest": {}` to package.json or create `jest.config.js`',
    example: `describe('Example', () => {
  test('should work', () => {
    expect(1 + 1).toBe(2);
  });
});`,
    script: "jest",
    watchScript: "jest --watch",
    suggestions: [
      "Start with unit tests for helper functions",
      "Test business logic in isolation",
      "Add integration tests for API endpoints",
    ],
  };
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
