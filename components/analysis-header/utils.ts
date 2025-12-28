import { RepoMetadata, AnalysisResult, FileNode } from "@/lib/types";
import { ExtendedAnalysis } from "./types";
import { FOLDER_DESCRIPTIONS, TECH_ICONS } from "./constants";

export function generateExtendedAnalysis(
  metadata: RepoMetadata,
  techStack?: string[],
  result?: Partial<AnalysisResult>
): ExtendedAnalysis {
  const language = metadata.language?.toLowerCase() || "";
  const topics = metadata.topics || [];
  const description = metadata.description || "";

  let whatItDoes = "";
  if (result?.whatItDoes) {
    whatItDoes = result.whatItDoes;
  } else if (description) {
    whatItDoes = description;
  } else {
    whatItDoes = `${metadata.name} is a ${
      metadata.language || "software"
    } project maintained by ${metadata.owner.login}. `;
    if (topics.length > 0) {
      whatItDoes += `It focuses on ${topics.slice(0, 3).join(", ")}.`;
    }
  }

  let targetAudience = "";
  if (result?.targetAudience) {
    targetAudience = result.targetAudience;
  } else {
    targetAudience = generateTargetAudienceFallback(topics, metadata.language);
  }

  let howToRun: string[] = [];
  if (result?.howToRun && result.howToRun.length > 0) {
    howToRun = result.howToRun;
  } else {
    howToRun = generateRunCommands(
      language,
      techStack || [],
      metadata.fullName
    );
  }

  let keyFolders: { name: string; description: string }[] = [];
  if (result?.keyFolders && result.keyFolders.length > 0) {
    keyFolders = result.keyFolders;
  } else {
    keyFolders = generateKeyFolders(
      result?.fileTree,
      language,
      techStack || []
    );
  }

  return {
    whatItDoes,
    targetAudience,
    howToRun,
    keyFolders,
  };
}

export function generateTargetAudienceFallback(
  topics: string[],
  language?: string | null
): string {
  if (topics.includes("framework") || topics.includes("library")) {
    return "Developers looking for a reusable solution to integrate into their projects.";
  } else if (topics.includes("cli") || topics.includes("tool")) {
    return "Developers and DevOps engineers who need command-line automation tools.";
  } else if (topics.includes("api") || topics.includes("backend")) {
    return "Backend developers building services and APIs.";
  } else if (
    topics.includes("frontend") ||
    topics.includes("ui") ||
    topics.includes("react") ||
    topics.includes("vue")
  ) {
    return "Frontend developers building modern web applications and user interfaces.";
  } else if (
    topics.includes("mobile") ||
    topics.includes("ios") ||
    topics.includes("android")
  ) {
    return "Mobile developers creating native or cross-platform applications.";
  } else if (
    topics.includes("machine-learning") ||
    topics.includes("ai") ||
    topics.includes("deep-learning")
  ) {
    return "Data scientists and ML engineers working on AI/ML projects.";
  } else if (
    topics.includes("devops") ||
    topics.includes("docker") ||
    topics.includes("kubernetes")
  ) {
    return "DevOps engineers and system administrators managing infrastructure.";
  } else {
    return `Developers and teams working with ${
      language || "this technology"
    } who need a ${topics[0] || "quality"} solution.`;
  }
}

export function generateRunCommands(
  language: string,
  techStack: string[],
  repoFullName: string
): string[] {
  const commands: string[] = [];
  const techLower = techStack.map((t) => t.toLowerCase());
  const repoName = repoFullName.split("/").pop() || repoFullName;

  commands.push(`git clone https://github.com/${repoFullName}.git`);
  commands.push(`cd ${repoName}`);

  if (techLower.includes("next.js") || techLower.includes("nextjs")) {
    commands.push("pnpm install  # or npm install");
    commands.push("pnpm dev      # starts development server");
  } else if (techLower.includes("react") || techLower.includes("vite")) {
    commands.push("npm install");
    commands.push("npm run dev");
  } else if (techLower.includes("vue") || techLower.includes("nuxt")) {
    commands.push("npm install");
    commands.push("npm run dev");
  } else if (language === "python") {
    commands.push("pip install -r requirements.txt");
    commands.push("python main.py  # or python app.py");
  } else if (language === "go") {
    commands.push("go mod download");
    commands.push("go run .");
  } else if (language === "rust") {
    commands.push("cargo build");
    commands.push("cargo run");
  } else if (language === "java") {
    commands.push("./mvnw install  # or ./gradlew build");
    commands.push("./mvnw spring-boot:run");
  } else if (language === "ruby") {
    commands.push("bundle install");
    commands.push("rails server  # or ruby app.rb");
  } else if (language === "php") {
    commands.push("composer install");
    commands.push("php artisan serve  # for Laravel");
  } else if (techLower.includes("docker")) {
    commands.push("docker-compose up -d");
  } else {
    commands.push("npm install");
    commands.push("npm start");
  }

  return commands;
}

export function generateKeyFolders(
  fileTree?: FileNode[],
  language?: string,
  techStack?: string[]
): { name: string; description: string }[] {
  const folders: { name: string; description: string }[] = [];
  const techLower = (techStack || []).map((t) => t.toLowerCase());

  if (fileTree && fileTree.length > 0) {
    const topDirs = fileTree
      .filter((node) => node.type === "directory")
      .slice(0, 8);

    for (const dir of topDirs) {
      const desc = getFolderDescription(dir.name, language, techLower);
      if (desc) {
        folders.push({ name: dir.name, description: desc });
      }
    }
  }

  if (folders.length === 0) {
    if (techLower.includes("next.js") || techLower.includes("nextjs")) {
      folders.push(
        { name: "app/", description: "App Router pages and layouts" },
        { name: "components/", description: "Reusable React components" },
        { name: "lib/", description: "Utility functions and helpers" },
        { name: "public/", description: "Static assets (images, fonts)" }
      );
    } else if (techLower.includes("react")) {
      folders.push(
        { name: "src/", description: "Source code and components" },
        { name: "components/", description: "Reusable UI components" },
        { name: "hooks/", description: "Custom React hooks" },
        { name: "public/", description: "Static assets" }
      );
    } else if (language === "python") {
      folders.push(
        { name: "src/", description: "Main source code" },
        { name: "tests/", description: "Unit and integration tests" },
        { name: "docs/", description: "Documentation files" }
      );
    }
  }

  return folders.slice(0, 6);
}

export function getFolderDescription(
  name: string,
  language?: string,
  techStack?: string[]
): string | null {
  const lowerName = name.toLowerCase().replace(/\/$/, "");

  if (FOLDER_DESCRIPTIONS[lowerName]) {
    return FOLDER_DESCRIPTIONS[lowerName];
  }

  const techLower = (techStack || []).map((t) => t.toLowerCase());

  if (techLower.includes("next.js") || techLower.includes("nextjs")) {
    if (lowerName === "app") return "App Router pages, layouts, and API routes";
    if (lowerName === "pages") return "Pages Router (legacy) page components";
  }

  if (techLower.includes("react")) {
    if (lowerName === "components") return "Reusable React UI components";
    if (lowerName === "hooks") return "Custom React hooks";
    if (lowerName === "context") return "React context providers";
  }

  if (language === "python") {
    if (lowerName === "src") return "Main Python source modules";
    if (lowerName === "tests") return "Pytest unit and integration tests";
  }

  if (language === "go") {
    if (lowerName === "cmd") return "Main application entry points";
    if (lowerName === "pkg") return "Public library packages";
    if (lowerName === "internal") return "Private application code";
  }

  return null;
}

export function getTechIcon(tech: string): string | null {
  const lowerTech = tech.toLowerCase();
  return TECH_ICONS[lowerTech] || null;
}
