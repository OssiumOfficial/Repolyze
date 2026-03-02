import { PromptContext } from "./types";
import { CodeMetrics } from "./code-analyzer";

export function buildPrompt(
  context: PromptContext,
  metrics: CodeMetrics,
  calculatedScores: {
    overall: number;
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
    breakdown: Record<string, { score: number; factors: string[] }>;
  },
): string {
  const { metadata, fileStats, compactTree, filesContent, branch } = context;

  const languagesInfo = formatLanguagesInfo(fileStats.languages);
  const metricsContext = formatMetricsContext(metrics);
  const detectedPatterns = formatDetectedPatterns(metrics);

  return `You are a senior software architect performing a deep codebase analysis. Your goal is to produce an analysis that would save a developer HOURS of manual code reading. Focus on DEPTH over breadth — explain HOW things work, not just WHAT exists.

# Repository: ${metadata.fullName}
## Branch: ${branch}

## Repository Overview
| Property | Value |
|----------|-------|
| **Name** | ${metadata.name} |
| **Owner** | ${metadata.owner.login} |
| **Branch** | ${branch} |
| **Description** | ${metadata.description || "No description"} |
| **Primary Language** | ${metadata.language || "Not specified"} |
| **Stars** | ${metadata.stars.toLocaleString()} |
| **Forks** | ${metadata.forks.toLocaleString()} |
| **Open Issues** | ${metadata.openIssues.toLocaleString()} |
| **Total Files** | ${fileStats.totalFiles.toLocaleString()} |
| **Languages** | ${languagesInfo} |
| **Created** | ${metadata.createdAt} |
| **Last Push** | ${metadata.pushedAt} |
| **License** | ${metadata.license || "None"} |
| **Topics** | ${metadata.topics?.join(", ") || "None"} |

## Code Metrics
${metricsContext}

## Detected Patterns & Entry Points
${detectedPatterns}

## Pre-Calculated Scores (USE THESE EXACT VALUES — do NOT output scores)
\`\`\`json
{
  "overall": ${calculatedScores.overall},
  "codeQuality": ${calculatedScores.codeQuality},
  "documentation": ${calculatedScores.documentation},
  "security": ${calculatedScores.security},
  "maintainability": ${calculatedScores.maintainability},
  "testCoverage": ${calculatedScores.testCoverage},
  "dependencies": ${calculatedScores.dependencies}
}
\`\`\`

## Full Directory Structure
\`\`\`
${compactTree}
\`\`\`

## Source File Contents
${filesContent}

---

# ANALYSIS INSTRUCTIONS

You must produce a deep, structured analysis. Do NOT just summarize the README or repeat the description. Analyze the actual code, directory structure, and file contents provided above. For every claim, reference specific files or directories.

## What to analyze:

### 1. Summary & Purpose
- A 3-5 sentence technical summary that explains the project's core value, how it achieves it technically, and what makes it interesting/unique.
- Plain-English explanation a non-developer could understand.
- Who specifically benefits (contributors, end-users, library consumers, etc.).

### 2. Tech Stack
- List ALL technologies detected from package.json, imports, config files, and file extensions.
- Include frameworks, libraries, build tools, runtimes, databases, and infrastructure tools.

### 3. How To Run
- Exact setup commands based on the detected package manager and build system.
- Include prerequisites (Node version, system deps, env vars, etc.).

### 4. Key Folders (6-10)
- For EACH major directory, explain its purpose AND what key files inside it do.
- Describe the relationship between folders (e.g., "components/ contains UI used by pages/ which are routed via app/").

### 5. Core Features & Implementation (THIS IS CRITICAL)
- Identify 3-6 core features of the project.
- For EACH feature, explain:
  - What it does
  - How it's implemented (which files, what pattern)
  - Key classes/functions/modules involved
  - How data flows through this feature
- Reference specific file paths from the directory structure.

### 6. Key Concepts
- Identify 3-8 domain-specific concepts, algorithms, or techniques used in this project.
- For each concept: name it, explain what it is, why it's used here, and which files implement it.
- Examples: "greedy meshing" in a voxel engine, "incremental compilation" in a build tool, "virtual DOM diffing" in a UI framework.

### 7. Architecture & Component Interactions
- Map out the system's major components/subsystems.
- For each component, specify its type, technologies, and what it connects to.
- Explain HOW components interact (not just that they do). What interfaces/protocols/patterns connect them?

### 8. Data Flow
- Trace how data moves through the system end-to-end.
- Include sources (user input, APIs, files), processing steps, storage, and outputs.
- Be specific about data formats and transformations.

### 9. Design Patterns
- Identify architectural and design patterns used (MVC, pub-sub, middleware chain, ECS, etc.).
- Reference where in the code each pattern is implemented.

### 10. Insights (8-12 DEEP insights)
- NOT generic advice. Every insight must reference specific code/files.
- Strengths: What's well-engineered? Why? Point to specific implementations.
- Weaknesses: What could cause real problems? Be specific about the impact.
- Suggestions: What would a senior developer do to improve this codebase? Include rationale.
- Warnings: What are active risks (security, performance, maintainability)?

### 11. Dependency Graph (CRITICAL — used for interactive visual canvas)
- Map out file-level and module-level dependencies as a directed graph.
- Each node represents a key file, module, or component (NOT every file — pick 10-20 most important ones).
- Each edge represents an import, usage, or dependency relationship.
- Nodes have: id, label (short display name like "AuthProvider" or "api/route.ts"), group (one of: component, page, api, hook, lib, config, context, store, service, model, middleware), description.
- Edges have: from (source id), to (target id), label (relationship like "imports", "uses", "extends", "renders"), type ("direct" for imports, "indirect" for implicit dependencies).
- Focus on the actual import/usage graph visible in the source files.
- Group related files sensibly — don't just list random files.

### 12. Diagrams
- Architecture diagram showing subsystems and their connections.
- Data flow diagram showing how data moves through the system.
- Both must be valid Mermaid.js syntax and reflect the ACTUAL architecture, not generic templates.

## RESPONSE FORMAT
Return ONLY valid JSON — no markdown, no commentary, no code fences outside JSON:

{
  "summary": "3-5 sentence deep technical summary referencing actual implementation details",
  "whatItDoes": "Plain English explanation that a non-developer can understand",
  "targetAudience": "Specific description of who benefits and how",
  "techStack": ["Tech1", "Tech2", "Framework1", "BuildTool1"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "# prerequisite: ...",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    {
      "name": "src/core/",
      "description": "Core engine implementation containing the main processing pipeline. Key files: processor.ts (main pipeline), types.ts (shared types), config.ts (runtime configuration)."
    }
  ],
  "coreFeatures": [
    {
      "name": "Feature Name",
      "description": "What this feature does for the user",
      "implementation": "Detailed explanation of HOW it works technically — which files, what algorithms, what data structures, what the execution flow looks like",
      "keyFiles": ["src/core/processor.ts", "src/utils/transform.ts"],
      "patterns": ["Observer Pattern", "Pipeline"]
    }
  ],
  "keyConcepts": [
    {
      "name": "Concept Name (e.g., Greedy Meshing)",
      "description": "What this concept is and why it matters in this project",
      "implementation": "How this concept is implemented in this codebase specifically",
      "relatedFiles": ["src/mesher/greedy.cpp", "src/mesher/types.h"]
    }
  ],
  "insights": [
    {
      "type": "strength",
      "category": "Architecture",
      "title": "Descriptive and specific title",
      "description": "Detailed explanation with specific references to code. At least 2-3 sentences explaining WHY this matters and WHAT the impact is.",
      "priority": "high",
      "affectedFiles": ["src/core/processor.ts", "src/utils/cache.ts"],
      "codeReference": "The ProcessorPipeline class in processor.ts uses a chain-of-responsibility pattern..."
    }
  ],
  "architecture": [
    {
      "id": "arch-1",
      "name": "Component Name",
      "type": "backend",
      "description": "What this component does and HOW it works, not just a label",
      "technologies": ["Express", "TypeScript"],
      "connections": ["arch-2"],
      "keyFiles": ["src/server/index.ts"]
    }
  ],
  "dataFlow": {
    "nodes": [
      { "id": "df-1", "name": "User Input", "type": "source", "description": "Specific description of what enters the system" }
    ],
    "edges": [
      { "from": "df-1", "to": "df-2", "label": "HTTP Request", "dataType": "JSON payload with repo URL" }
    ]
  },
  "designPatterns": [
    {
      "name": "Pattern Name",
      "description": "How this pattern is used in this codebase",
      "files": ["src/core/factory.ts"]
    }
  ],
  "dependencyGraph": {
    "nodes": [
      { "id": "dep-1", "label": "AuthProvider", "group": "context", "description": "Manages authentication state and session" },
      { "id": "dep-2", "label": "api/auth", "group": "api", "description": "Auth endpoint handling login/logout" },
      { "id": "dep-3", "label": "useAuth", "group": "hook", "description": "Hook for consuming auth context" }
    ],
    "edges": [
      { "from": "dep-3", "to": "dep-1", "label": "uses", "type": "direct" },
      { "from": "dep-1", "to": "dep-2", "label": "calls", "type": "direct" }
    ]
  },
  "diagrams": {
    "architecture": {
      "type": "flowchart",
      "title": "System Architecture",
      "code": "flowchart TD\\n    subgraph Frontend\\n        A[UI Components]\\n    end\\n    subgraph Backend\\n        B[API Server]\\n        C[Processing Engine]\\n    end\\n    A --> B\\n    B --> C"
    },
    "dataFlow": {
      "type": "flowchart",
      "title": "Data Flow",
      "code": "flowchart LR\\n    A[Input] --> B[Process]\\n    B --> C[Store]\\n    C --> D[Output]"
    }
  }
}

## CRITICAL REQUIREMENTS
1. Return ONLY valid JSON — no markdown wrapping, no \`\`\`json fences
2. Do NOT include "scores", "refactors", or "automations" — those are pre-generated
3. EVERY insight, feature, and concept MUST reference specific files from the directory structure
4. Mermaid diagram code must use \\\\n for newlines (escaped for JSON)
5. "type" in insights: "strength", "weakness", "suggestion", "warning"
6. "priority" in insights: "low", "medium", "high", "critical"
7. "type" in architecture: "frontend", "backend", "database", "service", "external", "middleware"
8. "type" in dataFlow nodes: "source", "process", "store", "output"
9. Do NOT generate generic/template output — every statement must be grounded in the actual code provided
10. Aim for 8-12 insights, 3-6 core features, 3-8 key concepts, 6-10 key folders
11. If you can't determine something from the provided code, say so honestly rather than guessing
12. Diagrams should reflect the ACTUAL architecture visible in the code, not generic software patterns`;
}

function formatMetricsContext(metrics: CodeMetrics): string {
  const lines: string[] = [];

  // Testing
  lines.push("### Testing");
  lines.push(
    `- Has Tests: ${metrics.hasTests ? `Yes (${metrics.testFileCount} files)` : "No"}`,
  );

  // CI/CD
  lines.push("\n### CI/CD");
  lines.push(
    `- Has CI: ${metrics.hasCI ? `Yes (${metrics.ciProvider})` : "No"}`,
  );

  // Code Quality
  lines.push("\n### Code Quality");
  lines.push(
    `- TypeScript: ${metrics.hasTypeScript ? (metrics.strictMode ? "Yes (strict)" : "Yes") : "No"}`,
  );
  lines.push(`- Linting: ${metrics.hasLinting ? "Yes" : "No"}`);
  lines.push(`- Prettier: ${metrics.hasPrettier ? "Yes" : "No"}`);

  // Security
  lines.push("\n### Security");
  lines.push(`- Security Config: ${metrics.hasSecurityConfig ? "Yes" : "No"}`);
  lines.push(`- .env.example: ${metrics.hasEnvExample ? "Yes" : "No"}`);
  if (metrics.exposedSecrets?.length > 0) {
    lines.push(
      `- ⚠️ Potential Secrets: ${metrics.exposedSecrets.length} detected`,
    );
  }
  if (metrics.vulnerablePatterns?.length > 0) {
    lines.push(
      `- ⚠️ Deprecated Deps: ${metrics.vulnerablePatterns.join(", ")}`,
    );
  }

  // Documentation
  lines.push("\n### Documentation");
  lines.push(`- README: ${metrics.readmeQuality}`);
  lines.push(`- CHANGELOG: ${metrics.hasChangelog ? "Yes" : "No"}`);
  lines.push(`- CONTRIBUTING: ${metrics.hasContributing ? "Yes" : "No"}`);
  lines.push(`- LICENSE: ${metrics.hasLicense ? "Yes" : "No"}`);

  // Dependencies
  lines.push("\n### Dependencies");
  lines.push(
    `- Count: ${metrics.dependencyCount} production, ${metrics.devDependencyCount} dev`,
  );

  // Issues
  if (metrics.largeFiles?.length > 0) {
    lines.push("\n### Issues");
    lines.push(`- Large Files: ${metrics.largeFiles.slice(0, 5).join(", ")}`);
  }
  if (metrics.missingEssentials?.length > 0) {
    lines.push(`- Missing: ${metrics.missingEssentials.join(", ")}`);
  }

  // Automations
  if (metrics.existingAutomations?.length > 0) {
    lines.push("\n### Existing Automations");
    lines.push(metrics.existingAutomations.join(", "));
  }

  return lines.join("\n");
}

function formatDetectedPatterns(metrics: CodeMetrics): string {
  const lines: string[] = [];

  // Entry points
  if (metrics.entryPoints && metrics.entryPoints.length > 0) {
    lines.push("### Detected Entry Points");
    for (const entry of metrics.entryPoints) {
      lines.push(`- ${entry}`);
    }
  }

  // Design patterns
  if (metrics.designPatterns && metrics.designPatterns.length > 0) {
    lines.push("\n### Detected Design Patterns");
    for (const pattern of metrics.designPatterns) {
      lines.push(`- ${pattern.name}: ${pattern.files.join(", ")}`);
    }
  }

  // Key abstractions
  if (metrics.keyAbstractions && metrics.keyAbstractions.length > 0) {
    lines.push("\n### Detected Key Abstractions (classes/interfaces/modules)");
    for (const abstraction of metrics.keyAbstractions.slice(0, 20)) {
      lines.push(`- ${abstraction}`);
    }
  }

  // Import graph summary
  if (metrics.moduleConnections && metrics.moduleConnections.length > 0) {
    lines.push("\n### Module Connection Summary");
    for (const conn of metrics.moduleConnections.slice(0, 15)) {
      lines.push(`- ${conn}`);
    }
  }

  if (lines.length === 0) {
    lines.push("No additional patterns detected from static analysis.");
  }

  return lines.join("\n");
}

function formatLanguagesInfo(languages: Record<string, number>): string {
  const entries = Object.entries(languages).slice(0, 5);
  if (entries.length === 0) return "Unknown";
  return entries.map(([lang, count]) => `${lang} (${count})`).join(", ");
}

export function prepareFilesContent(
  importantFiles: Record<string, string>,
  maxFiles: number = 15,
  maxContentLength: number = 5000,
): string {
  // Prioritize source files over config files for deeper analysis
  const entries = Object.entries(importantFiles);
  
  // Sort: source files first, then configs, then docs
  const sorted = entries.sort(([a], [b]) => {
    const aIsSource = isSourceFile(a);
    const bIsSource = isSourceFile(b);
    const aIsConfig = isConfigFile(a);
    const bIsConfig = isConfigFile(b);
    
    if (aIsSource && !bIsSource) return -1;
    if (!aIsSource && bIsSource) return 1;
    if (aIsConfig && !bIsConfig) return -1;
    if (!aIsConfig && bIsConfig) return 1;
    return 0;
  });

  return sorted
    .slice(0, maxFiles)
    .map(
      ([file, content]) =>
        `### ${file}\n\`\`\`\n${content.slice(0, maxContentLength)}\n\`\`\``,
    )
    .join("\n\n");
}

function isSourceFile(path: string): boolean {
  return /\.(ts|tsx|js|jsx|py|go|rs|cpp|c|h|hpp|java|rb|swift|kt)$/.test(path) &&
    !isConfigFile(path);
}

function isConfigFile(path: string): boolean {
  return /\.(json|yaml|yml|toml|config\.|rc$|\.lock$)/.test(path) ||
    /^(package\.json|tsconfig|eslint|prettier|babel|webpack|vite|next\.config)/i.test(path);
}
