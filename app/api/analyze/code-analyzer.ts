import { FileNode } from "@/lib/types";

export interface DetectedPattern {
  name: string;
  files: string[];
}

export interface CodeMetrics {
  hasTests: boolean;
  testFileCount: number;
  hasCI: boolean;
  ciProvider: string | null;
  hasLinting: boolean;
  hasTypeScript: boolean;
  strictMode: boolean;
  hasPrettier: boolean;
  hasSecurityConfig: boolean;
  hasEnvExample: boolean;
  exposedSecrets: string[];
  hasChangelog: boolean;
  hasContributing: boolean;
  hasLicense: boolean;
  readmeQuality: "missing" | "minimal" | "basic" | "good" | "excellent";
  dependencyCount: number;
  devDependencyCount: number;
  vulnerablePatterns: string[];
  largeFiles: string[];
  codePatterns: {
    hasErrorHandling: boolean;
    hasLogging: boolean;
    hasValidation: boolean;
  };
  missingEssentials: string[];
  existingAutomations: string[];
  // New deep-analysis fields
  entryPoints: string[];
  designPatterns: DetectedPattern[];
  keyAbstractions: string[];
  moduleConnections: string[];
}

// Pre-compiled patterns
const TEST_PATTERN =
  /\.(test|spec)\.(js|ts|jsx|tsx)$|__tests__|_test\.(go|py)$/;
const CI_PATTERNS: [RegExp, string][] = [
  [/\.github\/workflows/, "GitHub Actions"],
  [/\.gitlab-ci\.yml$/, "GitLab CI"],
  [/Jenkinsfile$/, "Jenkins"],
];
const SECRET_PATTERN =
  /(?:API_KEY|SECRET|PASSWORD|TOKEN)\s*=\s*['"]?[A-Za-z0-9+/=_-]{8,}/i;
const VULNERABLE_DEPS: [RegExp, string][] = [
  [/"moment"/, "moment.js → date-fns"],
  [/"request"/, "request → axios"],
];

export function analyzeCodeMetrics(
  tree: FileNode[],
  fileContents: Record<string, string>,
): CodeMetrics {
  const paths = flattenPaths(tree);

  // Single-pass path analysis
  let testFileCount = 0;
  let ciProvider: string | null = null;
  let hasSecurityConfig = false;
  let hasEnvExample = false;
  let hasChangelog = false;
  let hasContributing = false;
  let hasLicense = false;
  let hasLinting = false;
  let hasPrettier = false;

  for (const path of paths) {
    if (TEST_PATTERN.test(path)) testFileCount++;

    if (!ciProvider) {
      for (const [pattern, provider] of CI_PATTERNS) {
        if (pattern.test(path)) {
          ciProvider = provider;
          break;
        }
      }
    }

    if (/dependabot\.yml|\.snyk$/.test(path)) hasSecurityConfig = true;
    if (/\.env\.example$/.test(path)) hasEnvExample = true;
    if (/changelog\.md$/i.test(path)) hasChangelog = true;
    if (/contributing\.md$/i.test(path)) hasContributing = true;
    if (/^license/i.test(path)) hasLicense = true;
    if (/\.eslintrc|eslint\.config|biome\.json/.test(path)) hasLinting = true;
    if (/\.prettierrc/.test(path)) hasPrettier = true;
  }

  // Package.json analysis
  const pkg = fileContents["package.json"];
  let deps: Record<string, string> = {};
  let devDeps: Record<string, string> = {};

  if (pkg) {
    try {
      const parsed = JSON.parse(pkg);
      deps = parsed.dependencies || {};
      devDeps = parsed.devDependencies || {};
      if (!hasLinting) hasLinting = !!devDeps["eslint"] || !!devDeps["biome"];
      if (!hasPrettier) hasPrettier = !!devDeps["prettier"];
    } catch {}
  }

  // TypeScript check
  const tsConfig = fileContents["tsconfig.json"];
  const hasTypeScript = paths.some((p) => /\.tsx?$/.test(p));
  let strictMode = false;
  if (tsConfig) {
    try {
      strictMode = JSON.parse(tsConfig)?.compilerOptions?.strict === true;
    } catch {}
  }

  // README quality
  const readme = fileContents["README.md"] || fileContents["readme.md"] || "";
  const readmeQuality = assessReadme(readme);

  // Quick content analysis
  const exposedSecrets: string[] = [];
  const largeFiles: string[] = [];
  let hasErrorHandling = false;
  let hasLogging = false;
  let hasValidation = false;

  for (const [file, content] of Object.entries(fileContents)) {
    if (content.length > 10000) largeFiles.push(file);
    if (!file.endsWith(".example") && SECRET_PATTERN.test(content)) {
      exposedSecrets.push(file);
    }
    if (!hasErrorHandling && /try\s*\{|\.catch\(/.test(content))
      hasErrorHandling = true;
    if (!hasLogging && /console\.|logger\.|winston|pino/.test(content))
      hasLogging = true;
    if (!hasValidation && /zod|yup|joi|validator/.test(content))
      hasValidation = true;
  }

  // Vulnerable deps
  const vulnerablePatterns: string[] = [];
  if (pkg) {
    for (const [pattern, msg] of VULNERABLE_DEPS) {
      if (pattern.test(pkg)) vulnerablePatterns.push(msg);
    }
  }

  // Missing essentials
  const missingEssentials: string[] = [];
  if (!paths.some((p) => /readme\.md$/i.test(p)))
    missingEssentials.push("README.md");
  if (!hasLicense) missingEssentials.push("LICENSE");
  if (!hasEnvExample && paths.some((p) => /\.env$/.test(p)))
    missingEssentials.push(".env.example");

  // Existing automations
  const existingAutomations: string[] = [];
  if (ciProvider) existingAutomations.push(ciProvider);
  if (hasSecurityConfig) existingAutomations.push("Dependabot");
  if (paths.some((p) => /\.husky\//.test(p))) existingAutomations.push("Husky");

  // ─── Deep Analysis: Entry Points ───
  const entryPoints = detectEntryPoints(paths, fileContents);

  // ─── Deep Analysis: Design Patterns ───
  const designPatterns = detectDesignPatterns(paths, fileContents);

  // ─── Deep Analysis: Key Abstractions ───
  const keyAbstractions = detectKeyAbstractions(fileContents);

  // ─── Deep Analysis: Module Connections ───
  const moduleConnections = detectModuleConnections(fileContents);

  return {
    hasTests: testFileCount > 0,
    testFileCount,
    hasCI: !!ciProvider,
    ciProvider,
    hasLinting,
    hasTypeScript,
    strictMode,
    hasPrettier,
    hasSecurityConfig,
    hasEnvExample,
    exposedSecrets,
    hasChangelog,
    hasContributing,
    hasLicense,
    readmeQuality,
    dependencyCount: Object.keys(deps).length,
    devDependencyCount: Object.keys(devDeps).length,
    vulnerablePatterns,
    largeFiles,
    codePatterns: { hasErrorHandling, hasLogging, hasValidation },
    missingEssentials,
    existingAutomations,
    entryPoints,
    designPatterns,
    keyAbstractions,
    moduleConnections,
  };
}

function flattenPaths(tree: FileNode[]): string[] {
  const paths: string[] = [];
  const stack = [...tree];
  while (stack.length) {
    const node = stack.pop()!;
    paths.push(node.path);
    if (node.children) stack.push(...node.children);
  }
  return paths;
}

/**
 * Detect entry points: main files, server start files, CLI commands, etc.
 */
function detectEntryPoints(
  paths: string[],
  fileContents: Record<string, string>,
): string[] {
  const entryPoints: string[] = [];

  // Check package.json for explicit entry points
  const pkg = fileContents["package.json"];
  if (pkg) {
    try {
      const parsed = JSON.parse(pkg);
      if (parsed.main) entryPoints.push(`package.json main: ${parsed.main}`);
      if (parsed.module) entryPoints.push(`package.json module: ${parsed.module}`);
      if (parsed.bin) {
        const bins = typeof parsed.bin === "string" ? { [parsed.name]: parsed.bin } : parsed.bin;
        for (const [name, path] of Object.entries(bins)) {
          entryPoints.push(`CLI binary "${name}": ${path}`);
        }
      }
      if (parsed.scripts) {
        const importantScripts = ["start", "dev", "build", "serve", "main"];
        for (const script of importantScripts) {
          if (parsed.scripts[script]) {
            entryPoints.push(`npm run ${script}: ${parsed.scripts[script]}`);
          }
        }
      }
    } catch {}
  }

  // Detect common entry point files
  const entryPatterns: [RegExp, string][] = [
    [/^(src\/)?index\.(ts|js|tsx|jsx)$/, "Application entry"],
    [/^(src\/)?main\.(ts|js|tsx|jsx|py|go|rs)$/, "Application entry"],
    [/^(src\/)?app\.(ts|js|tsx|jsx|py)$/, "Application entry"],
    [/^(src\/)?server\.(ts|js)$/, "Server entry"],
    [/^app\/layout\.(tsx|jsx)$/, "Next.js root layout"],
    [/^app\/page\.(tsx|jsx)$/, "Next.js home page"],
    [/^pages\/_app\.(tsx|jsx)$/, "Next.js app wrapper"],
    [/^cmd\/.*\/main\.go$/, "Go CLI command"],
    [/^src\/main\.rs$/, "Rust entry"],
    [/^manage\.py$/, "Django management"],
    [/^Makefile$/, "Build system entry"],
    [/^CMakeLists\.txt$/, "CMake build entry"],
    [/^SConstruct$/, "SCons build entry"],
  ];

  for (const path of paths) {
    for (const [pattern, label] of entryPatterns) {
      if (pattern.test(path)) {
        entryPoints.push(`${label}: ${path}`);
      }
    }
  }

  return [...new Set(entryPoints)].slice(0, 12);
}

/**
 * Detect design patterns from code structure and contents.
 */
function detectDesignPatterns(
  paths: string[],
  fileContents: Record<string, string>,
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  // Singleton pattern
  const singletonFiles: string[] = [];
  // Factory pattern
  const factoryFiles: string[] = [];
  // Observer/Event pattern
  const observerFiles: string[] = [];
  // Middleware/Chain pattern
  const middlewareFiles: string[] = [];
  // MVC/Component pattern
  const mvcFiles: string[] = [];
  // Repository/DAO pattern
  const repositoryFiles: string[] = [];
  // Strategy pattern
  const strategyFiles: string[] = [];
  // Builder pattern
  const builderFiles: string[] = [];

  for (const [file, content] of Object.entries(fileContents)) {
    // Singleton: getInstance, private constructor, single instance
    if (/getInstance\s*\(|\.instance\b|private\s+(static\s+)?constructor/i.test(content)) {
      singletonFiles.push(file);
    }

    // Factory: createXxx, Factory class, produce/build methods
    if (/factory/i.test(file) || /class\s+\w*[Ff]actory|create[A-Z]\w+\s*\(/i.test(content)) {
      factoryFiles.push(file);
    }

    // Observer: addEventListener, on/emit, subscribe, EventEmitter
    if (/EventEmitter|\.on\(|\.emit\(|subscribe\(|addEventListener|observer/i.test(content)) {
      observerFiles.push(file);
    }

    // Middleware: app.use, middleware chain, next()
    if (/middleware/i.test(file) || /app\.use\(|\.use\(\s*\w+\)|next\(\)/i.test(content)) {
      middlewareFiles.push(file);
    }

    // Repository/DAO
    if (/repository|dao/i.test(file) || /class\s+\w*(Repository|DAO)\b/i.test(content)) {
      repositoryFiles.push(file);
    }

    // Strategy
    if (/strategy/i.test(file) || /class\s+\w*Strategy\b|interface\s+\w*Strategy\b/i.test(content)) {
      strategyFiles.push(file);
    }

    // Builder
    if (/builder/i.test(file) || /class\s+\w*Builder\b|\.build\(\)|\.setName\(|\.with[A-Z]/i.test(content)) {
      builderFiles.push(file);
    }
  }

  // MVC detection from directory structure
  const hasModels = paths.some((p) => /models?\//i.test(p));
  const hasViews = paths.some((p) => /views?\/|pages?\//i.test(p));
  const hasControllers = paths.some((p) => /controllers?\//i.test(p));
  const hasComponents = paths.some((p) => /components?\//i.test(p));
  const hasRoutes = paths.some((p) => /routes?\//i.test(p));
  const hasServices = paths.some((p) => /services?\//i.test(p));

  if (hasModels && hasViews && hasControllers) {
    mvcFiles.push("models/", "views/", "controllers/");
  }
  if (hasComponents) mvcFiles.push("components/");
  if (hasRoutes) mvcFiles.push("routes/");

  // ECS (Entity Component System) - common in game engines
  const hasECS = paths.some((p) => /systems?\//i.test(p)) && hasComponents;

  // Compile results
  if (singletonFiles.length > 0) patterns.push({ name: "Singleton", files: singletonFiles.slice(0, 3) });
  if (factoryFiles.length > 0) patterns.push({ name: "Factory", files: factoryFiles.slice(0, 3) });
  if (observerFiles.length > 0) patterns.push({ name: "Observer/Event-Driven", files: observerFiles.slice(0, 3) });
  if (middlewareFiles.length > 0) patterns.push({ name: "Middleware Chain", files: middlewareFiles.slice(0, 3) });
  if (mvcFiles.length > 0) patterns.push({ name: hasComponents ? "Component-Based Architecture" : "MVC", files: mvcFiles.slice(0, 4) });
  if (repositoryFiles.length > 0) patterns.push({ name: "Repository Pattern", files: repositoryFiles.slice(0, 3) });
  if (strategyFiles.length > 0) patterns.push({ name: "Strategy Pattern", files: strategyFiles.slice(0, 3) });
  if (builderFiles.length > 0) patterns.push({ name: "Builder Pattern", files: builderFiles.slice(0, 3) });
  if (hasECS) patterns.push({ name: "Entity-Component-System", files: ["systems/", "components/"] });
  if (hasServices) patterns.push({ name: "Service Layer", files: ["services/"] });

  return patterns;
}

/**
 * Detect key abstractions: classes, interfaces, exported modules.
 */
function detectKeyAbstractions(
  fileContents: Record<string, string>,
): string[] {
  const abstractions: string[] = [];

  for (const [file, content] of Object.entries(fileContents)) {
    // Extract class declarations
    const classMatches = content.matchAll(/(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/g);
    for (const match of classMatches) {
      abstractions.push(`class ${match[1]} (${file})`);
    }

    // Extract interface declarations (TypeScript)
    const interfaceMatches = content.matchAll(/(?:export\s+)?interface\s+(\w+)/g);
    for (const match of interfaceMatches) {
      abstractions.push(`interface ${match[1]} (${file})`);
    }

    // Extract type declarations
    const typeMatches = content.matchAll(/(?:export\s+)?type\s+(\w+)\s*[=<]/g);
    for (const match of typeMatches) {
      abstractions.push(`type ${match[1]} (${file})`);
    }

    // Extract Go structs
    const structMatches = content.matchAll(/type\s+(\w+)\s+struct\s*\{/g);
    for (const match of structMatches) {
      abstractions.push(`struct ${match[1]} (${file})`);
    }

    // Extract Rust structs/enums/traits
    const rustMatches = content.matchAll(/pub\s+(?:struct|enum|trait)\s+(\w+)/g);
    for (const match of rustMatches) {
      abstractions.push(`${match[0].split(" ")[1]} ${match[1]} (${file})`);
    }

    // Extract Python classes
    const pyClassMatches = content.matchAll(/class\s+(\w+)\s*[\(:\[]/g);
    for (const match of pyClassMatches) {
      if (!abstractions.some((a) => a.includes(`class ${match[1]}`))) {
        abstractions.push(`class ${match[1]} (${file})`);
      }
    }
  }

  return abstractions.slice(0, 30);
}

/**
 * Detect import/dependency connections between internal modules.
 */
function detectModuleConnections(
  fileContents: Record<string, string>,
): string[] {
  const connections: string[] = [];
  const importMap = new Map<string, string[]>();

  for (const [file, content] of Object.entries(fileContents)) {
    const imports: string[] = [];

    // ES imports: import ... from "./something"
    const esImports = content.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of esImports) {
      const target = match[1];
      if (target.startsWith(".") || target.startsWith("@/")) {
        imports.push(target);
      }
    }

    // Go imports
    const goImports = content.matchAll(/import\s+(?:\(\s*)?"([^"]+)"/g);
    for (const match of goImports) {
      imports.push(match[1]);
    }

    // Python imports
    const pyImports = content.matchAll(/from\s+(\S+)\s+import|import\s+(\S+)/g);
    for (const match of pyImports) {
      const target = match[1] || match[2];
      if (target && !target.startsWith("__") && target !== "os" && target !== "sys") {
        imports.push(target);
      }
    }

    // Rust use statements
    const rustUses = content.matchAll(/use\s+(crate::\S+|super::\S+)/g);
    for (const match of rustUses) {
      imports.push(match[1]);
    }

    if (imports.length > 0) {
      importMap.set(file, imports);
    }
  }

  // Summarize connections
  for (const [file, imports] of importMap) {
    const internalImports = imports.filter(
      (i) => i.startsWith(".") || i.startsWith("@/") || i.startsWith("crate::") || i.startsWith("super::"),
    );
    if (internalImports.length > 0) {
      connections.push(
        `${file} → ${internalImports.slice(0, 5).join(", ")}${internalImports.length > 5 ? ` (+${internalImports.length - 5} more)` : ""}`,
      );
    }
  }

  return connections.slice(0, 20);
}

function assessReadme(
  readme: string,
): "missing" | "minimal" | "basic" | "good" | "excellent" {
  if (readme.length < 100) return "missing";
  if (readme.length < 300) return "minimal";
  let score = 0;
  if (/install|setup/i.test(readme)) score++;
  if (/usage|example/i.test(readme)) score++;
  if (/```/.test(readme)) score++;
  if (score >= 3) return "excellent";
  if (score >= 2) return "good";
  return "basic";
}

export function calculateScores(metrics: CodeMetrics) {
  const breakdown: Record<string, { score: number; factors: string[] }> = {};

  // Code Quality (simplified)
  let cq = 50;
  const cqf: string[] = [];
  if (metrics.hasTypeScript) {
    cq += 20;
    cqf.push("+20: TypeScript");
  }
  if (metrics.strictMode) {
    cq += 10;
    cqf.push("+10: Strict");
  }
  if (metrics.hasLinting) {
    cq += 10;
    cqf.push("+10: Linting");
  }
  if (metrics.hasPrettier) {
    cq += 5;
    cqf.push("+5: Prettier");
  }
  if (metrics.codePatterns.hasErrorHandling) {
    cq += 5;
    cqf.push("+5: Error handling");
  }
  breakdown.codeQuality = { score: Math.min(100, cq), factors: cqf };

  // Documentation
  let doc = 30;
  const docf: string[] = [];
  const rmScore = {
    missing: 0,
    minimal: 10,
    basic: 25,
    good: 40,
    excellent: 50,
  };
  doc += rmScore[metrics.readmeQuality];
  docf.push(`README: ${metrics.readmeQuality}`);
  if (metrics.hasChangelog) {
    doc += 10;
    docf.push("+10: CHANGELOG");
  }
  if (!metrics.hasLicense) {
    doc -= 15;
    docf.push("-15: No LICENSE");
  }
  breakdown.documentation = {
    score: Math.max(0, Math.min(100, doc)),
    factors: docf,
  };

  // Security
  let sec = 70;
  const secf: string[] = [];
  if (metrics.hasSecurityConfig) {
    sec += 15;
    secf.push("+15: Security config");
  }
  if (metrics.exposedSecrets.length > 0) {
    sec -= 30;
    secf.push("-30: Secrets exposed");
  }
  if (metrics.vulnerablePatterns.length > 0) {
    sec -= 15;
    secf.push("-15: Deprecated deps");
  }
  breakdown.security = {
    score: Math.max(0, Math.min(100, sec)),
    factors: secf,
  };

  // Maintainability
  let maint = 50;
  const mf: string[] = [];
  if (metrics.hasCI) {
    maint += 25;
    mf.push(`+25: ${metrics.ciProvider}`);
  }
  if (metrics.hasTypeScript) {
    maint += 15;
    mf.push("+15: Types");
  }
  if (metrics.hasLinting) {
    maint += 10;
    mf.push("+10: Linting");
  }
  breakdown.maintainability = { score: Math.min(100, maint), factors: mf };

  // Test Coverage
  let test = 20;
  const tf: string[] = [];
  if (metrics.hasTests) {
    test += 50;
    tf.push("+50: Tests exist");
  }
  if (metrics.hasCI) {
    test += 10;
    tf.push("+10: CI");
  }
  breakdown.testCoverage = { score: Math.min(100, test), factors: tf };

  // Dependencies
  let dep = 80;
  const df: string[] = [];
  if (metrics.vulnerablePatterns.length > 0) {
    dep -= 20;
    df.push("-20: Deprecated");
  }
  if (metrics.dependencyCount > 50) {
    dep -= 10;
    df.push("-10: Heavy");
  }
  breakdown.dependencies = { score: Math.max(0, dep), factors: df };

  const overall = Math.round(
    breakdown.codeQuality.score * 0.2 +
      breakdown.documentation.score * 0.15 +
      breakdown.security.score * 0.2 +
      breakdown.maintainability.score * 0.2 +
      breakdown.testCoverage.score * 0.15 +
      breakdown.dependencies.score * 0.1,
  );

  return {
    overall,
    codeQuality: breakdown.codeQuality.score,
    documentation: breakdown.documentation.score,
    security: breakdown.security.score,
    maintainability: breakdown.maintainability.score,
    testCoverage: breakdown.testCoverage.score,
    dependencies: breakdown.dependencies.score,
    breakdown,
  };
}
