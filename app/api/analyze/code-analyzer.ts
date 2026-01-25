// api/analyze/code-analyzer.ts
import { FileNode } from "@/lib/types";

export interface CodeMetrics {
  // Quantifiable metrics for accurate scoring
  hasTests: boolean;
  testFileCount: number;
  testToCodeRatio: number;

  hasCI: boolean;
  ciProvider: string | null;
  ciConfigPath: string | null;

  hasLinting: boolean;
  lintConfig: string | null;

  hasTypeScript: boolean;
  strictMode: boolean;

  hasPrettier: boolean;
  hasEditorConfig: boolean;

  hasSecurityConfig: boolean;
  hasEnvExample: boolean;
  exposedSecrets: string[];

  hasDocs: boolean;
  hasChangelog: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  readmeQuality: "missing" | "minimal" | "basic" | "good" | "excellent";

  dependencyCount: number;
  devDependencyCount: number;
  outdatedPatterns: string[];
  vulnerablePatterns: string[];

  avgFileSize: number;
  largeFiles: string[];
  deepNesting: string[];

  codePatterns: {
    hasErrorHandling: boolean;
    hasLogging: boolean;
    hasValidation: boolean;
    hasAPIVersioning: boolean;
    hasCaching: boolean;
    hasRateLimiting: boolean;
  };

  missingEssentials: string[];
  existingAutomations: string[];
}

const TEST_PATTERNS = [
  /\.(test|spec)\.(js|ts|jsx|tsx)$/,
  /\/__tests__\//,
  /\/test\//,
  /\.test\./,
  /_test\.(go|py|rb)$/,
  /Test\.java$/,
];

const CI_CONFIGS: Record<string, string> = {
  ".github/workflows": "GitHub Actions",
  ".gitlab-ci.yml": "GitLab CI",
  ".circleci/config.yml": "CircleCI",
  Jenkinsfile: "Jenkins",
  ".travis.yml": "Travis CI",
  "azure-pipelines.yml": "Azure Pipelines",
  "bitbucket-pipelines.yml": "Bitbucket Pipelines",
};

const SECURITY_FILES = [
  ".snyk",
  "security.md",
  "SECURITY.md",
  ".github/SECURITY.md",
  "renovate.json",
  "dependabot.yml",
  ".github/dependabot.yml",
];

const VULNERABLE_PATTERNS = [
  {
    pattern: /"moment"/,
    suggestion:
      "Consider migrating from moment.js to date-fns or dayjs (moment is deprecated)",
  },
  {
    pattern: /"request"/,
    suggestion:
      'Replace deprecated "request" package with "node-fetch" or "axios"',
  },
  {
    pattern: /"node-sass"/,
    suggestion: "Migrate from node-sass to sass (dart-sass)",
  },
  {
    pattern: /"tslint"/,
    suggestion: "Migrate from TSLint to ESLint (TSLint is deprecated)",
  },
];

const SECRET_PATTERNS = [
  /API_KEY\s*=\s*['"][^'"]+['"]/,
  /SECRET\s*=\s*['"][^'"]+['"]/,
  /PASSWORD\s*=\s*['"][^'"]+['"]/,
  /TOKEN\s*=\s*['"][^'"]+['"]/,
  /PRIVATE_KEY\s*=\s*['"][^'"]+['"]/,
];

export function analyzeCodeMetrics(
  tree: FileNode[],
  fileContents: Record<string, string>,
): CodeMetrics {
  const allPaths = flattenPaths(tree);
  const allFiles = allPaths.filter((p) => !p.endsWith("/"));

  // Test analysis
  const testFiles = allFiles.filter((f) =>
    TEST_PATTERNS.some((p) => p.test(f)),
  );
  const sourceFiles = allFiles.filter(
    (f) =>
      /\.(js|ts|jsx|tsx|py|go|java|rb|rs)$/.test(f) &&
      !TEST_PATTERNS.some((p) => p.test(f)),
  );

  // CI detection
  let ciProvider: string | null = null;
  let ciConfigPath: string | null = null;
  for (const [path, provider] of Object.entries(CI_CONFIGS)) {
    if (allPaths.some((p) => p.includes(path))) {
      ciProvider = provider;
      ciConfigPath = path;
      break;
    }
  }

  // Package.json analysis
  const packageJson = fileContents["package.json"];
  let parsedPkg: Record<string, unknown> = {};
  let deps: Record<string, string> = {};
  let devDeps: Record<string, string> = {};

  if (packageJson) {
    try {
      parsedPkg = JSON.parse(packageJson);
      deps = (parsedPkg.dependencies as Record<string, string>) || {};
      devDeps = (parsedPkg.devDependencies as Record<string, string>) || {};
    } catch {}
  }

  // TypeScript analysis
  const tsConfig = fileContents["tsconfig.json"];
  let strictMode = false;
  if (tsConfig) {
    try {
      const parsed = JSON.parse(tsConfig);
      strictMode = parsed?.compilerOptions?.strict === true;
    } catch {}
  }

  // README quality assessment
  const readme = fileContents["README.md"] || fileContents["readme.md"] || "";
  const readmeQuality = assessReadmeQuality(readme);

  // Exposed secrets check
  const exposedSecrets: string[] = [];
  for (const [file, content] of Object.entries(fileContents)) {
    if (file.includes(".env") && !file.includes(".example")) continue;
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(content)) {
        exposedSecrets.push(`Potential secret in ${file}`);
      }
    }
  }

  // Vulnerable dependencies
  const outdatedPatterns: string[] = [];
  const vulnerablePatterns: string[] = [];
  if (packageJson) {
    for (const { pattern, suggestion } of VULNERABLE_PATTERNS) {
      if (pattern.test(packageJson)) {
        vulnerablePatterns.push(suggestion);
      }
    }
  }

  // Code pattern detection
  const allCode = Object.values(fileContents).join("\n");
  const codePatterns = {
    hasErrorHandling: /try\s*\{|\.catch\(|catch\s*\(/.test(allCode),
    hasLogging: /console\.(log|error|warn)|logger\.|winston|pino|bunyan/.test(
      allCode,
    ),
    hasValidation: /zod|yup|joi|validator|class-validator|ajv/.test(allCode),
    hasAPIVersioning: /\/v[0-9]+\/|\/api\/v[0-9]+/.test(allCode),
    hasCaching: /redis|memcached|cache|lru-cache/.test(allCode),
    hasRateLimiting: /rate-limit|ratelimit|throttle/.test(allCode),
  };

  // Large files detection
  const largeFiles: string[] = [];
  for (const [file, content] of Object.entries(fileContents)) {
    if (content.length > 10000) {
      largeFiles.push(`${file} (${Math.round(content.length / 1000)}KB)`);
    }
  }

  // Deep nesting detection
  const deepNesting = allFiles.filter((f) => f.split("/").length > 6);

  // Missing essentials
  const missingEssentials: string[] = [];
  if (!allPaths.some((p) => /readme\.md$/i.test(p)))
    missingEssentials.push("README.md");
  if (!allPaths.some((p) => /license/i.test(p)))
    missingEssentials.push("LICENSE");
  if (!allPaths.some((p) => /\.gitignore$/.test(p)))
    missingEssentials.push(".gitignore");
  if (
    !allPaths.some((p) => /\.env\.example$/.test(p)) &&
    allPaths.some((p) => /\.env$/.test(p))
  ) {
    missingEssentials.push(".env.example");
  }

  // Existing automations
  const existingAutomations: string[] = [];
  if (ciProvider) existingAutomations.push(`${ciProvider} CI/CD`);
  if (allPaths.some((p) => /dependabot\.yml/.test(p)))
    existingAutomations.push("Dependabot");
  if (allPaths.some((p) => /renovate\.json/.test(p)))
    existingAutomations.push("Renovate");
  if (allPaths.some((p) => /codecov\.yml/.test(p)))
    existingAutomations.push("Codecov");
  if (allPaths.some((p) => /\.husky\//.test(p)))
    existingAutomations.push("Husky hooks");
  if (devDeps["lint-staged"]) existingAutomations.push("lint-staged");

  return {
    hasTests: testFiles.length > 0,
    testFileCount: testFiles.length,
    testToCodeRatio:
      sourceFiles.length > 0 ? testFiles.length / sourceFiles.length : 0,

    hasCI: ciProvider !== null,
    ciProvider,
    ciConfigPath,

    hasLinting: !!(
      devDeps["eslint"] ||
      devDeps["biome"] ||
      allPaths.some((p) => /\.eslintrc/.test(p))
    ),
    lintConfig: allPaths.find((p) => /\.eslintrc|biome\.json/.test(p)) || null,

    hasTypeScript: allPaths.some((p) => /\.tsx?$/.test(p)),
    strictMode,

    hasPrettier: !!(
      devDeps["prettier"] || allPaths.some((p) => /\.prettierrc/.test(p))
    ),
    hasEditorConfig: allPaths.some((p) => /\.editorconfig$/.test(p)),

    hasSecurityConfig: SECURITY_FILES.some((f) =>
      allPaths.some((p) => p.includes(f)),
    ),
    hasEnvExample: allPaths.some((p) => /\.env\.example$/.test(p)),
    exposedSecrets,

    hasDocs: allPaths.some((p) => /^docs?\//i.test(p)),
    hasChangelog: allPaths.some((p) => /changelog\.md$/i.test(p)),
    hasContributing: allPaths.some((p) => /contributing\.md$/i.test(p)),
    hasLicense: allPaths.some((p) => /^license/i.test(p)),
    readmeQuality,

    dependencyCount: Object.keys(deps).length,
    devDependencyCount: Object.keys(devDeps).length,
    outdatedPatterns,
    vulnerablePatterns,

    avgFileSize: calculateAvgFileSize(fileContents),
    largeFiles,
    deepNesting,

    codePatterns,
    missingEssentials,
    existingAutomations,
  };
}

function flattenPaths(tree: FileNode[], prefix = ""): string[] {
  const paths: string[] = [];
  for (const node of tree) {
    const fullPath = prefix ? `${prefix}/${node.name}` : node.name;
    paths.push(fullPath);
    if (node.children) {
      paths.push(...flattenPaths(node.children, fullPath));
    }
  }
  return paths;
}

function assessReadmeQuality(
  readme: string,
): "missing" | "minimal" | "basic" | "good" | "excellent" {
  if (!readme || readme.length < 50) return "missing";
  if (readme.length < 200) return "minimal";

  const hasInstallation = /install|getting started|setup/i.test(readme);
  const hasUsage = /usage|example|how to/i.test(readme);
  const hasAPI = /api|reference|documentation/i.test(readme);
  const hasBadges = /\[!\[/.test(readme);
  const hasContributing = /contribut/i.test(readme);
  const hasLicense = /license/i.test(readme);
  const hasCodeBlocks = /```/.test(readme);

  const score = [
    hasInstallation,
    hasUsage,
    hasAPI,
    hasBadges,
    hasContributing,
    hasLicense,
    hasCodeBlocks,
  ].filter(Boolean).length;

  if (score >= 5) return "excellent";
  if (score >= 3) return "good";
  if (score >= 1) return "basic";
  return "minimal";
}

function calculateAvgFileSize(contents: Record<string, string>): number {
  const sizes = Object.values(contents).map((c) => c.length);
  if (sizes.length === 0) return 0;
  return Math.round(sizes.reduce((a, b) => a + b, 0) / sizes.length);
}

export function calculateScores(metrics: CodeMetrics): {
  overall: number;
  codeQuality: number;
  documentation: number;
  security: number;
  maintainability: number;
  testCoverage: number;
  dependencies: number;
  breakdown: Record<string, { score: number; factors: string[] }>;
} {
  const breakdown: Record<string, { score: number; factors: string[] }> = {};

  // Code Quality (0-100)
  let codeQuality = 50;
  const codeFactors: string[] = [];

  if (metrics.hasTypeScript) {
    codeQuality += 15;
    codeFactors.push("+15: TypeScript");
  }
  if (metrics.strictMode) {
    codeQuality += 10;
    codeFactors.push("+10: Strict mode enabled");
  }
  if (metrics.hasLinting) {
    codeQuality += 10;
    codeFactors.push("+10: Linting configured");
  }
  if (metrics.hasPrettier) {
    codeQuality += 5;
    codeFactors.push("+5: Prettier configured");
  }
  if (metrics.hasEditorConfig) {
    codeQuality += 3;
    codeFactors.push("+3: EditorConfig present");
  }
  if (metrics.codePatterns.hasErrorHandling) {
    codeQuality += 5;
    codeFactors.push("+5: Error handling detected");
  }
  if (metrics.codePatterns.hasValidation) {
    codeQuality += 5;
    codeFactors.push("+5: Input validation present");
  }
  if (metrics.largeFiles.length > 3) {
    codeQuality -= 10;
    codeFactors.push("-10: Multiple large files");
  }
  if (metrics.deepNesting.length > 5) {
    codeQuality -= 5;
    codeFactors.push("-5: Deep directory nesting");
  }

  codeQuality = Math.max(0, Math.min(100, codeQuality));
  breakdown.codeQuality = { score: codeQuality, factors: codeFactors };

  // Documentation (0-100)
  let documentation = 30;
  const docFactors: string[] = [];

  const readmeScores = {
    missing: 0,
    minimal: 10,
    basic: 25,
    good: 40,
    excellent: 50,
  };
  documentation += readmeScores[metrics.readmeQuality];
  docFactors.push(
    `+${readmeScores[metrics.readmeQuality]}: README is ${metrics.readmeQuality}`,
  );

  if (metrics.hasChangelog) {
    documentation += 10;
    docFactors.push("+10: CHANGELOG present");
  }
  if (metrics.hasContributing) {
    documentation += 10;
    docFactors.push("+10: CONTRIBUTING guide");
  }
  if (metrics.hasDocs) {
    documentation += 15;
    docFactors.push("+15: Docs directory");
  }
  if (!metrics.hasLicense) {
    documentation -= 15;
    docFactors.push("-15: No LICENSE file");
  }

  documentation = Math.max(0, Math.min(100, documentation));
  breakdown.documentation = { score: documentation, factors: docFactors };

  // Security (0-100)
  let security = 60;
  const securityFactors: string[] = [];

  if (metrics.hasSecurityConfig) {
    security += 15;
    securityFactors.push("+15: Security tooling configured");
  }
  if (metrics.hasEnvExample) {
    security += 10;
    securityFactors.push("+10: .env.example present");
  }
  if (metrics.exposedSecrets.length > 0) {
    security -= 30;
    securityFactors.push(
      `-30: ${metrics.exposedSecrets.length} potential secret(s) exposed`,
    );
  }
  if (metrics.vulnerablePatterns.length > 0) {
    security -= 10 * metrics.vulnerablePatterns.length;
    securityFactors.push(
      `-${10 * metrics.vulnerablePatterns.length}: Deprecated/vulnerable dependencies`,
    );
  }
  if (metrics.codePatterns.hasRateLimiting) {
    security += 10;
    securityFactors.push("+10: Rate limiting detected");
  }
  if (metrics.codePatterns.hasValidation) {
    security += 5;
    securityFactors.push("+5: Input validation");
  }

  security = Math.max(0, Math.min(100, security));
  breakdown.security = { score: security, factors: securityFactors };

  // Maintainability (0-100)
  let maintainability = 50;
  const maintainFactors: string[] = [];

  if (metrics.hasCI) {
    maintainability += 20;
    maintainFactors.push(`+20: CI/CD with ${metrics.ciProvider}`);
  }
  if (metrics.hasTypeScript) {
    maintainability += 10;
    maintainFactors.push("+10: Type safety");
  }
  if (metrics.hasLinting) {
    maintainability += 10;
    maintainFactors.push("+10: Linting enforced");
  }
  if (metrics.existingAutomations.length > 2) {
    maintainability += 10;
    maintainFactors.push("+10: Multiple automations");
  }
  if (metrics.largeFiles.length > 5) {
    maintainability -= 15;
    maintainFactors.push("-15: Too many large files");
  }
  if (metrics.dependencyCount > 50) {
    maintainability -= 10;
    maintainFactors.push("-10: Heavy dependencies");
  }

  maintainability = Math.max(0, Math.min(100, maintainability));
  breakdown.maintainability = {
    score: maintainability,
    factors: maintainFactors,
  };

  // Test Coverage (0-100)
  let testCoverage = 20;
  const testFactors: string[] = [];

  if (metrics.hasTests) {
    testCoverage += 30;
    testFactors.push("+30: Tests present");

    if (metrics.testToCodeRatio >= 0.5) {
      testCoverage += 30;
      testFactors.push("+30: Good test-to-code ratio");
    } else if (metrics.testToCodeRatio >= 0.2) {
      testCoverage += 15;
      testFactors.push("+15: Moderate test coverage");
    } else {
      testFactors.push("+0: Low test-to-code ratio");
    }

    if (metrics.testFileCount > 10) {
      testCoverage += 10;
      testFactors.push("+10: Many test files");
    }
  } else {
    testFactors.push("+0: No tests detected");
  }

  if (metrics.hasCI) {
    testCoverage += 10;
    testFactors.push("+10: CI can run tests");
  }

  testCoverage = Math.max(0, Math.min(100, testCoverage));
  breakdown.testCoverage = { score: testCoverage, factors: testFactors };

  // Dependencies (0-100)
  let dependencies = 70;
  const depFactors: string[] = [];

  if (metrics.vulnerablePatterns.length === 0) {
    dependencies += 15;
    depFactors.push("+15: No deprecated packages detected");
  } else {
    dependencies -= 10 * metrics.vulnerablePatterns.length;
    depFactors.push(
      `-${10 * metrics.vulnerablePatterns.length}: Deprecated packages found`,
    );
  }

  if (metrics.hasSecurityConfig) {
    dependencies += 10;
    depFactors.push("+10: Dependency monitoring");
  }
  if (metrics.dependencyCount < 30) {
    dependencies += 5;
    depFactors.push("+5: Reasonable dependency count");
  }
  if (metrics.dependencyCount > 80) {
    dependencies -= 15;
    depFactors.push("-15: Very heavy dependencies");
  }

  dependencies = Math.max(0, Math.min(100, dependencies));
  breakdown.dependencies = { score: dependencies, factors: depFactors };

  // Overall: weighted average
  const weights = {
    codeQuality: 0.2,
    documentation: 0.15,
    security: 0.2,
    maintainability: 0.2,
    testCoverage: 0.15,
    dependencies: 0.1,
  };

  const overall = Math.round(
    codeQuality * weights.codeQuality +
      documentation * weights.documentation +
      security * weights.security +
      maintainability * weights.maintainability +
      testCoverage * weights.testCoverage +
      dependencies * weights.dependencies,
  );

  return {
    overall,
    codeQuality,
    documentation,
    security,
    maintainability,
    testCoverage,
    dependencies,
    breakdown,
  };
}
