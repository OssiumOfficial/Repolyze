// api/analyze/prompt-builder.ts
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
  const metricsContext = formatMetricsContext(metrics, calculatedScores);

  return `# GitHub Repository Analysis: ${metadata.fullName}
## Branch: ${branch}

## Repository Overview
| Property | Value |
|----------|-------|
| **Name** | ${metadata.name} |
| **Owner** | ${metadata.owner.login} |
| **Branch** | ${branch} |
| **Description** | ${metadata.description || "No description provided"} |
| **Primary Language** | ${metadata.language || "Not specified"} |
| **Stars** | ${metadata.stars.toLocaleString()} |
| **Forks** | ${metadata.forks.toLocaleString()} |
| **Open Issues** | ${metadata.openIssues.toLocaleString()} |
| **Total Files** | ${fileStats.totalFiles.toLocaleString()} |
| **Languages Detected** | ${languagesInfo} |

## Pre-Computed Code Metrics
${metricsContext}

## Pre-Calculated Scores (USE THESE EXACT VALUES)
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

## Directory Structure
\`\`\`
${compactTree}
\`\`\`

## Key Source Files
${filesContent}

---

## Your Task
Analyze this repository and provide insights. Scores, refactors, and automations are pre-generated - focus on these areas:

1. **Summary** - 2-3 sentence technical overview
2. **What It Does** - Plain English explanation
3. **Target Audience** - Who benefits from this project
4. **Tech Stack** - All detected technologies (be comprehensive)
5. **How To Run** - Accurate setup commands based on detected package manager
6. **Key Folders** - Purpose of 4-6 main directories
7. **Insights** - 4-6 actionable insights (strengths, weaknesses, suggestions)
8. **Architecture** - System component mapping
9. **Data Flow** - How data moves through the system
10. **Diagrams** - Mermaid.js diagrams for visualization

## Response Format
Return ONLY a valid JSON object with this exact structure:

\`\`\`json
{
  "summary": "2-3 sentence technical summary of the project",
  "whatItDoes": "Plain English explanation of what this project accomplishes",
  "targetAudience": "Specific description of who benefits from this project",
  "techStack": ["Technology1", "Technology2", "Framework1", "Library1"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    {
      "name": "src/",
      "description": "Main source code directory containing application logic"
    }
  ],
  "insights": [
    {
      "type": "strength",
      "category": "Architecture",
      "title": "Well-organized project structure",
      "description": "The codebase follows a clear separation of concerns with dedicated folders for components, utilities, and types.",
      "priority": "medium",
      "affectedFiles": ["src/components/", "src/lib/"]
    },
    {
      "type": "weakness",
      "category": "Testing",
      "title": "Missing test coverage",
      "description": "No test files were detected. Adding unit tests would improve code reliability.",
      "priority": "high",
      "affectedFiles": []
    }
  ],
  "architecture": [
    {
      "id": "arch-1",
      "name": "Frontend",
      "type": "frontend",
      "description": "React-based user interface",
      "technologies": ["React", "TypeScript", "Tailwind CSS"],
      "connections": ["arch-2"]
    },
    {
      "id": "arch-2",
      "name": "API Layer",
      "type": "backend",
      "description": "REST API endpoints",
      "technologies": ["Next.js API Routes"],
      "connections": ["arch-3"]
    }
  ],
  "dataFlow": {
    "nodes": [
      {
        "id": "df-1",
        "name": "User Input",
        "type": "source",
        "description": "User interactions and form submissions"
      },
      {
        "id": "df-2",
        "name": "API Handler",
        "type": "process",
        "description": "Processes requests and validates data"
      }
    ],
    "edges": [
      {
        "from": "df-1",
        "to": "df-2",
        "label": "HTTP Request",
        "dataType": "JSON"
      }
    ]
  },
  "diagrams": {
    "architecture": {
      "type": "flowchart",
      "title": "System Architecture",
      "code": "flowchart TD\\n    A[Client] --> B[Next.js]\\n    B --> C[API Routes]\\n    C --> D[(Database)]"
    },
    "dataFlow": {
      "type": "sequenceDiagram",
      "title": "Request Flow",
      "code": "sequenceDiagram\\n    participant U as User\\n    participant F as Frontend\\n    participant A as API\\n    U->>F: Action\\n    F->>A: Request\\n    A-->>F: Response\\n    F-->>U: Update UI"
    }
  }
}
\`\`\`

## Critical Requirements
1. Return ONLY valid JSON - no markdown, no explanations outside JSON
2. Use the EXACT scores provided above (they are pre-calculated)
3. Do NOT include "scores", "refactors", or "automations" in your response - they are handled separately
4. Reference SPECIFIC files from the directory structure
5. Ensure all arrays have at least the minimum items shown
6. Mermaid diagram code must use \\\\n for newlines (escaped)
7. "type" in insights must be one of: "strength", "weakness", "suggestion", "warning"
8. "priority" must be one of: "low", "medium", "high", "critical"
9. "type" in architecture must be one of: "frontend", "backend", "database", "service", "external", "middleware"
10. "type" in dataFlow nodes must be one of: "source", "process", "store", "output"`;
}

function formatMetricsContext(
  metrics: CodeMetrics,
  scores: { breakdown: Record<string, { score: number; factors: string[] }> },
): string {
  const lines: string[] = [];

  lines.push("### Testing");
  lines.push(`- Has Tests: ${metrics.hasTests ? "Yes" : "No"}`);
  if (metrics.hasTests) {
    lines.push(`- Test Files: ${metrics.testFileCount}`);
    lines.push(
      `- Test/Code Ratio: ${(metrics.testToCodeRatio * 100).toFixed(1)}%`,
    );
  }

  lines.push("\n### CI/CD");
  lines.push(
    `- Has CI: ${metrics.hasCI ? `Yes (${metrics.ciProvider})` : "No"}`,
  );
  if (metrics.ciConfigPath) lines.push(`- Config: ${metrics.ciConfigPath}`);

  lines.push("\n### Code Quality Tools");
  lines.push(
    `- TypeScript: ${metrics.hasTypeScript ? (metrics.strictMode ? "Yes (strict)" : "Yes (non-strict)") : "No"}`,
  );
  lines.push(`- Linting: ${metrics.hasLinting ? "Yes" : "No"}`);
  lines.push(`- Prettier: ${metrics.hasPrettier ? "Yes" : "No"}`);

  lines.push("\n### Security");
  lines.push(`- Security Config: ${metrics.hasSecurityConfig ? "Yes" : "No"}`);
  lines.push(`- .env.example: ${metrics.hasEnvExample ? "Yes" : "No"}`);
  if (metrics.exposedSecrets.length > 0) {
    lines.push(
      `- ⚠️ Potential Secrets: ${metrics.exposedSecrets.length} detected`,
    );
  }
  if (metrics.vulnerablePatterns.length > 0) {
    lines.push(
      `- ⚠️ Deprecated Dependencies: ${metrics.vulnerablePatterns.join(", ")}`,
    );
  }

  lines.push("\n### Documentation");
  lines.push(`- README Quality: ${metrics.readmeQuality}`);
  lines.push(`- Has CHANGELOG: ${metrics.hasChangelog ? "Yes" : "No"}`);
  lines.push(`- Has CONTRIBUTING: ${metrics.hasContributing ? "Yes" : "No"}`);
  lines.push(`- Has Docs Folder: ${metrics.hasDocs ? "Yes" : "No"}`);

  lines.push("\n### Dependencies");
  lines.push(`- Production: ${metrics.dependencyCount}`);
  lines.push(`- Dev: ${metrics.devDependencyCount}`);

  lines.push("\n### Issues Detected");
  if (metrics.largeFiles.length > 0) {
    lines.push(`- Large Files: ${metrics.largeFiles.slice(0, 3).join(", ")}`);
  }
  if (metrics.deepNesting.length > 0) {
    lines.push(
      `- Deep Nesting: ${metrics.deepNesting.length} files with 6+ depth`,
    );
  }
  if (metrics.missingEssentials.length > 0) {
    lines.push(`- Missing: ${metrics.missingEssentials.join(", ")}`);
  }

  lines.push("\n### Existing Automations");
  lines.push(
    metrics.existingAutomations.length > 0
      ? metrics.existingAutomations.join(", ")
      : "None detected",
  );

  return lines.join("\n");
}

function formatLanguagesInfo(languages: Record<string, number>): string {
  const entries = Object.entries(languages).slice(0, 5);
  if (entries.length === 0) return "Unknown";
  return entries.map(([lang, count]) => `${lang} (${count})`).join(", ");
}

export function prepareFilesContent(
  importantFiles: Record<string, string>,
  maxFiles: number = 8,
  maxContentLength: number = 3000,
): string {
  return Object.entries(importantFiles)
    .slice(0, maxFiles)
    .map(
      ([file, content]) =>
        `### ${file}\n\`\`\`\n${content.slice(0, maxContentLength)}\n\`\`\``,
    )
    .join("\n\n");
}
