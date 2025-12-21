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

## Structure
\`\`\`
${compactTree}
\`\`\`

## Key Files
${filesContent}

---

Return JSON analysis:

\`\`\`json
{
  "summary": "2-3 sentence summary",
  "techStack": ["tech1", "tech2"],
  "scores": {
    "overall": 75, "codeQuality": 80, "documentation": 70,
    "security": 75, "maintainability": 80, "testCoverage": 60, "dependencies": 75
  },
  "insights": [
    {"type": "strength|weakness|suggestion|warning", "category": "Cat", "title": "Title", "description": "Desc", "priority": "low|medium|high|critical", "affectedFiles": ["file.ts"]}
  ],
  "refactors": [
    {"id": "ref-1", "title": "Title", "description": "Desc", "impact": "high", "effort": "medium", "category": "Cat", "files": ["file.ts"]}
  ],
  "automations": [
    {"id": "auto-1", "type": "issue", "title": "Title", "description": "Desc", "body": "Body", "labels": ["enhancement"], "priority": "medium"}
  ],
  "architecture": [
    {"id": "arch-1", "name": "Name", "type": "frontend", "description": "Desc", "technologies": ["React"], "connections": ["arch-2"]}
  ],
  "dataFlow": {
    "nodes": [{"id": "df-1", "name": "Name", "type": "source", "description": "Desc"}],
    "edges": [{"from": "df-1", "to": "df-2", "label": "Label"}]
  }
}
\`\`\`

Provide 4-6 insights, 2-3 refactors, 2-3 automations, 2-4 architecture components.`;

    const result = await streamText({
      model,
      prompt,
      temperature: 0.7,
      maxOutputTokens: 4000,
    });

    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
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
        "Content-Type": "text/event-stream",
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
