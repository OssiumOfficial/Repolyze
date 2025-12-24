import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText } from "ai";
import {
  fetchRepoMetadata,
  fetchRepoTree,
  fetchImportantFiles,
  calculateFileStats,
  createCompactTreeString,
} from "@/lib/github";
import { validateGitHubUrl } from "@/lib/validators";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MODEL_ID = "mistralai/devstral-2512:free";
const model = openrouter.chat(MODEL_ID);

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    const validation = validateGitHubUrl(url);
    if (!validation.valid || !validation.parsed) {
      return Response.json({ error: validation.error }, { status: 400 });
    }

    const { owner, repo } = validation.parsed;

    let metadata, tree, importantFiles;

    try {
      [metadata, tree, importantFiles] = await Promise.all([
        fetchRepoMetadata(owner, repo),
        fetchRepoTree(owner, repo),
        fetchImportantFiles(owner, repo),
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch repository";
      return Response.json({ error: message }, { status: 400 });
    }

    // This now returns { totalFiles, totalDirectories, languages }
    const fileStats = calculateFileStats(tree);
    const compactTree = createCompactTreeString(tree, 50);

    const filesContent = Object.entries(importantFiles)
      .slice(0, 6)
      .map(
        ([file, content]) =>
          `### ${file}\n\`\`\`\n${content.slice(0, 2000)}\n\`\`\``
      )
      .join("\n\n");

    const prompt = `# Repository: ${metadata.fullName}

## Info
- Description: ${metadata.description || "None"}
- Language: ${metadata.language || "Unknown"}
- Stars: ${metadata.stars} | Forks: ${metadata.forks} | Issues: ${
      metadata.openIssues
    }
- Files: ${fileStats.totalFiles} | Dirs: ${fileStats.totalDirectories}
- Languages detected: ${Object.entries(fileStats.languages)
      .slice(0, 5)
      .map(([lang, count]) => `${lang}(${count})`)
      .join(", ")}

## Structure
\`\`\`
${compactTree}
\`\`\`

## Key Files
${filesContent}

---

Analyze this repository and return a comprehensive JSON response. Be specific, actionable, and thorough.

\`\`\`json
{
  "summary": "2-3 sentence technical summary of the repository",
  "whatItDoes": "A plain English explanation (2-3 sentences) of what this project does and its main purpose - written for someone unfamiliar with the codebase",
  "targetAudience": "Who should use this project (be specific, e.g., 'Frontend developers building React applications who need a component library')",
  "techStack": ["Technology1", "Technology2", "Framework1"],
  "howToRun": [
    "git clone https://github.com/${metadata.fullName}.git",
    "cd ${metadata.name}",
    "npm install",
    "npm run dev"
  ],
  "keyFolders": [
    {"name": "folder-name/", "description": "What this folder contains and its purpose"}
  ],
  "scores": {
    "overall": 75,
    "codeQuality": 80,
    "documentation": 70,
    "security": 75,
    "maintainability": 80,
    "testCoverage": 60,
    "dependencies": 75
  },
  "insights": [
    {
      "type": "strength|weakness|suggestion|warning",
      "category": "Category Name",
      "title": "Brief Title",
      "description": "Detailed explanation of the insight",
      "priority": "low|medium|high|critical",
      "affectedFiles": ["path/to/file.ts"]
    }
  ],
  "refactors": [
    {
      "id": "ref-1",
      "title": "Refactor Title",
      "description": "What should be refactored and why",
      "impact": "low|medium|high",
      "effort": "low|medium|high",
      "category": "Category",
      "files": ["path/to/file.ts"],
      "suggestedCode": "// Optional code example"
    }
  ],
  "automations": [
    {
      "id": "auto-1",
      "type": "issue|pull-request|workflow",
      "title": "Issue/PR Title",
      "description": "Brief description",
      "body": "Full markdown body for the issue or PR",
      "labels": ["enhancement", "good-first-issue"],
      "priority": "low|medium|high"
    }
  ],
  "architecture": [
    {
      "id": "arch-1",
      "name": "Component Name",
      "type": "frontend|backend|database|service|external|middleware",
      "description": "What this component does",
      "technologies": ["React", "TypeScript"],
      "connections": ["arch-2"]
    }
  ],
  "dataFlow": {
    "nodes": [
      {"id": "df-1", "name": "Node Name", "type": "source|process|store|output", "description": "Description"}
    ],
    "edges": [
      {"from": "df-1", "to": "df-2", "label": "Data flow label", "dataType": "JSON"}
    ]
  }
}
\`\`\`

## Requirements:
- **whatItDoes**: Explain like you're telling a friend what this project is about
- **targetAudience**: Be specific about who would benefit from this project
- **techStack**: List all detected technologies, frameworks, and tools (${
      metadata.language
        ? `primary language is ${metadata.language}`
        : "detect the primary language"
    })
- **howToRun**: Provide actual working commands based on the detected package manager and framework
- **keyFolders**: Explain 4-8 key directories from the file structure shown above
- **scores**: Rate 0-100 based on actual code quality visible in the files
- **insights**: Provide 4-6 insights (mix of strengths, weaknesses, suggestions, warnings)
- **refactors**: Suggest 2-3 specific refactoring improvements
- **automations**: Suggest 2-3 GitHub issues or PRs that could improve the project
- **architecture**: Identify 2-4 main architectural components
- **dataFlow**: Map 3-5 data flow nodes showing how data moves through the system

Be specific to THIS repository based on the actual files and structure shown.`;

    const result = await streamText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        // Send metadata with complete fileStats (including languages)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: "metadata",
              data: { metadata, fileTree: tree, fileStats },
            })}\n\n`
          )
        );

        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "content", data: chunk })}\n\n`
              )
            );
          }
        } catch (e) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                data: "Stream interrupted",
              })}\n\n`
            )
          );
        }

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
        );
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text-event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}
