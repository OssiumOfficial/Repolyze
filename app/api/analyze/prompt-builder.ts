import { PromptContext } from "./types";

export function buildPrompt(context: PromptContext): string {
  const { metadata, fileStats, compactTree, filesContent } = context;

  const languagesInfo = formatLanguagesInfo(fileStats.languages);
  const jsonSchema = getResponseSchema(metadata);
  const requirements = getRequirements(metadata);

  return `# GitHub Repository Analysis: ${metadata.fullName}

## Repository Overview
| Property | Value |
|----------|-------|
| **Name** | ${metadata.name} |
| **Owner** | ${metadata.owner.login} |
| **Description** | ${metadata.description || "No description provided"} |
| **Primary Language** | ${metadata.language || "Not specified"} |
| **Stars** | ${metadata.stars.toLocaleString()} |
| **Forks** | ${metadata.forks.toLocaleString()} |
| **Open Issues** | ${metadata.openIssues.toLocaleString()} |
| **Total Files** | ${fileStats.totalFiles.toLocaleString()} |
| **Total Directories** | ${fileStats.totalDirectories.toLocaleString()} |
| **Languages Detected** | ${languagesInfo} |

## Directory Structure
\`\`\`
${compactTree}
\`\`\`

## Key Source Files
${filesContent}

---

## Task
Perform a comprehensive analysis of this repository and provide actionable insights. Your response must be a valid JSON object matching the schema below.

## Response Schema
\`\`\`json
${jsonSchema}
\`\`\`

## Analysis Guidelines

### Summary & Description
- **summary**: Write a concise 2-3 sentence technical overview highlighting the project's purpose, architecture, and key technologies
- **whatItDoes**: Explain in plain English what this project accomplishes, as if describing it to a developer unfamiliar with the codebase
- **targetAudience**: Identify the specific user persona (e.g., "Backend developers building REST APIs with Node.js who need request validation")

### Technical Stack
- **techStack**: List ALL detected technologies including:
  - Programming languages
  - Frameworks and libraries
  - Build tools and bundlers
  - Testing frameworks
  - Database technologies
  - DevOps/CI tools

### Setup Instructions
- **howToRun**: Provide accurate, copy-paste ready commands based on:
  - Detected package manager (npm, yarn, pnpm, bun)
  - Framework-specific commands
  - Environment setup if apparent from config files

### Project Structure
- **keyFolders**: Analyze 4-8 important directories, explaining:
  - What each folder contains
  - Its role in the architecture
  - Key files within

### Quality Scores (0-100)
Rate based on evidence in the provided files:
- **codeQuality**: Code organization, naming conventions, patterns
- **documentation**: README quality, inline comments, API docs
- **security**: Dependency management, secrets handling, input validation
- **maintainability**: Modularity, separation of concerns, complexity
- **testCoverage**: Presence and quality of tests
- **dependencies**: Currency of dependencies, vulnerability exposure

### Insights
Provide 4-6 insights with a balanced mix:
- **strength**: What the project does well
- **weakness**: Areas needing improvement
- **suggestion**: Actionable recommendations
- **warning**: Potential issues or risks

### Refactoring Opportunities
Identify 2-3 specific improvements:
- Reference actual files from the structure
- Explain the benefit of each refactor
- Rate impact and effort realistically

### Automation Suggestions
Propose 2-3 GitHub Issues or PRs:
- **issue**: Bug fixes, feature requests, documentation
- **pull-request**: Code improvements with specific changes
- **workflow**: CI/CD enhancements

### Architecture Components
Map 2-4 main system components:
- Identify component types (frontend, backend, database, etc.)
- List technologies used in each
- Show relationships between components

### Data Flow
Trace how data moves through the system:
- Identify 3-5 key nodes (sources, processes, stores, outputs)
- Map the edges showing data transformation
- Label data types where apparent

${requirements}`;
}

function formatLanguagesInfo(languages: Record<string, number>): string {
  const entries = Object.entries(languages).slice(0, 5);
  
  if (entries.length === 0) {
    return "Unknown";
  }
  
  return entries.map(([lang, count]) => `${lang} (${count})`).join(", ");
}

function getResponseSchema(metadata: { fullName: string; name: string }): string {
  return `{
  "summary": "string - 2-3 sentence technical summary",
  "whatItDoes": "string - Plain English explanation of the project",
  "targetAudience": "string - Specific description of who benefits from this project",
  "techStack": ["string - Technology/framework names"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    {
      "name": "string - folder-name/",
      "description": "string - Purpose and contents"
    }
  ],
  "scores": {
    "overall": "number 0-100",
    "codeQuality": "number 0-100",
    "documentation": "number 0-100",
    "security": "number 0-100",
    "maintainability": "number 0-100",
    "testCoverage": "number 0-100",
    "dependencies": "number 0-100"
  },
  "insights": [
    {
      "type": "strength | weakness | suggestion | warning",
      "category": "string - Category name",
      "title": "string - Brief title",
      "description": "string - Detailed explanation",
      "priority": "low | medium | high | critical",
      "affectedFiles": ["string - file paths"]
    }
  ],
  "refactors": [
    {
      "id": "string - ref-1, ref-2, etc.",
      "title": "string - Refactor title",
      "description": "string - What and why",
      "impact": "low | medium | high",
      "effort": "low | medium | high",
      "category": "string - Category",
      "files": ["string - affected file paths"],
      "suggestedCode": "string - Optional code example"
    }
  ],
  "automations": [
    {
      "id": "string - auto-1, auto-2, etc.",
      "type": "issue | pull-request | workflow",
      "title": "string - Issue/PR title",
      "description": "string - Brief description",
      "body": "string - Full markdown body",
      "labels": ["string - GitHub labels"],
      "priority": "low | medium | high"
    }
  ],
  "architecture": [
    {
      "id": "string - arch-1, arch-2, etc.",
      "name": "string - Component name",
      "type": "frontend | backend | database | service | external | middleware",
      "description": "string - What this component does",
      "technologies": ["string - Technologies used"],
      "connections": ["string - IDs of connected components"]
    }
  ],
  "dataFlow": {
    "nodes": [
      {
        "id": "string - df-1, df-2, etc.",
        "name": "string - Node name",
        "type": "source | process | store | output",
        "description": "string - Node description"
      }
    ],
    "edges": [
      {
        "from": "string - Source node ID",
        "to": "string - Target node ID",
        "label": "string - Edge label",
        "dataType": "string - Data type being transferred"
      }
    ]
  }
}`;
}

function getRequirements(metadata: { language: string | null }): string {
  const languageNote = metadata.language
    ? `The primary language is **${metadata.language}**. Ensure techStack includes this and related ecosystem tools.`
    : "Detect and identify the primary programming language from the file extensions and content.";

  return `
## Important Reminders
1. ${languageNote}
2. Base all scores on **evidence visible in the provided files**, not assumptions
3. Reference **actual file paths** from the directory structure in your analysis
4. Ensure **howToRun** commands match the detected package manager and framework
5. Keep suggestions **specific and actionable** for this repository
6. Return **only valid JSON** - no markdown formatting outside the JSON block
7. All arrays should have the specified minimum number of items`;
}

export function prepareFilesContent(
  importantFiles: Record<string, string>,
  maxFiles: number = 6,
  maxContentLength: number = 2000
): string {
  return Object.entries(importantFiles)
    .slice(0, maxFiles)
    .map(
      ([file, content]) =>
        `### ${file}\n\`\`\`\n${content.slice(0, maxContentLength)}\n\`\`\``
    )
    .join("\n\n");
}