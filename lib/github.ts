import { FileNode, FileStats, RepoMetadata } from "./types";
import { getLanguageFromExtension, getFileExtension } from "./utils";
import { MAX_TREE_ITEMS, MAX_FILE_TREE_DEPTH } from "./constants";

const GITHUB_API_BASE = "https://api.github.com";

interface GitHubTreeItem {
  path: string;
  type: "blob" | "tree";
  size?: number;
}

interface GitHubTreeResponse {
  tree: GitHubTreeItem[];
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoGist-Analyzer",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string
): Promise<RepoMetadata> {
  const response = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Repository not found. Please check the URL.");
    }
    if (response.status === 403) {
      const remaining = response.headers.get("x-ratelimit-remaining");
      if (remaining === "0") {
        throw new Error(
          "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN or try later."
        );
      }
      throw new Error("Access forbidden. The repository may be private.");
    }
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    name: data.name,
    fullName: data.full_name,
    description: data.description,
    stars: data.stargazers_count,
    forks: data.forks_count,
    watchers: data.watchers_count,
    language: data.language,
    topics: data.topics || [],
    defaultBranch: data.default_branch,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    pushedAt: data.pushed_at,
    size: data.size,
    openIssues: data.open_issues_count,
    license: data.license?.spdx_id || null,
    isPrivate: data.private,
    owner: {
      login: data.owner.login,
      avatarUrl: data.owner.avatar_url,
      type: data.owner.type,
    },
  };
}

const excludePatterns = [
  /^node_modules\//,
  /^\.git\//,
  /^vendor\//,
  /^dist\//,
  /^build\//,
  /^\.next\//,
  /^out\//,
  /^coverage\//,
  /^__pycache__\//,
  /^\.venv\//,
  /^venv\//,
  /^target\//,
  /\.min\.js$/,
  /\.min\.css$/,
  /\.map$/,
  /\.lock$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /pnpm-lock\.yaml$/,
  /\.(png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|mp[34]|pdf|zip|tar|gz)$/i,
];

function shouldExclude(path: string): boolean {
  return excludePatterns.some((pattern) => pattern.test(path));
}

export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch?: string
): Promise<FileNode[]> {
  const targetBranch = branch || "main";

  const response = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
    { headers: getHeaders(), cache: "no-store" }
  );

  if (!response.ok) {
    if (targetBranch === "main") {
      return fetchRepoTree(owner, repo, "master");
    }
    throw new Error(`Failed to fetch repository tree: ${response.statusText}`);
  }

  const data: GitHubTreeResponse = await response.json();
  const filteredItems = data.tree
    .filter((item) => {
      const depth = item.path.split("/").length;
      return depth <= MAX_FILE_TREE_DEPTH && !shouldExclude(item.path);
    })
    .slice(0, MAX_TREE_ITEMS);

  return buildFileTree(filteredItems);
}

function buildFileTree(items: GitHubTreeItem[]): FileNode[] {
  const root: FileNode[] = [];
  const pathMap = new Map<string, FileNode>();

  const sortedItems = [...items].sort((a, b) => a.path.localeCompare(b.path));

  for (const item of sortedItems) {
    const pathParts = item.path.split("/");
    const name = pathParts[pathParts.length - 1];
    const parentPath = pathParts.slice(0, -1).join("/");

    const node: FileNode = {
      name,
      path: item.path,
      type: item.type === "tree" ? "directory" : "file",
      size: item.size,
      language: getLanguageFromExtension(name),
      extension: getFileExtension(name),
      children: item.type === "tree" ? [] : undefined,
    };

    pathMap.set(item.path, node);

    if (parentPath === "") {
      root.push(node);
    } else {
      const parent = pathMap.get(parentPath);
      if (parent?.children) {
        parent.children.push(node);
      }
    }
  }

  return sortFileTree(root);
}

function sortFileTree(nodes: FileNode[]): FileNode[] {
  return nodes
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === "directory" ? -1 : 1;
      return a.name.localeCompare(b.name);
    })
    .map((node) => ({
      ...node,
      children: node.children ? sortFileTree(node.children) : undefined,
    }));
}

export async function fetchImportantFiles(
  owner: string,
  repo: string,
  branch: string = "main"
): Promise<Record<string, string>> {
  const importantFiles = [
    "package.json",
    "README.md",
    "tsconfig.json",
    "next.config.js",
    "next.config.ts",
    "next.config.mjs",
    "vite.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
    "prisma/schema.prisma",
    "docker-compose.yml",
    "Dockerfile",
    "requirements.txt",
    "pyproject.toml",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
  ];

  const contents: Record<string, string> = {};
  let totalSize = 0;
  const maxSize = 80000;

  for (const file of importantFiles) {
    if (totalSize >= maxSize) break;

    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file}?ref=${branch}`,
        { headers: getHeaders(), cache: "no-store" }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.size <= 50000 && data.encoding === "base64") {
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          const truncated = content.slice(0, 6000);
          contents[file] = truncated;
          totalSize += truncated.length;
        }
      }
    } catch {
      // Skip file
    }
  }

  return contents;
}

export function calculateFileStats(tree: FileNode[]): FileStats {
  let totalFiles = 0;
  let totalDirectories = 0;
  const languages: Record<string, number> = {};

  function traverse(nodes: FileNode[]) {
    for (const node of nodes) {
      if (node.type === "directory") {
        totalDirectories++;
        if (node.children) traverse(node.children);
      } else {
        totalFiles++;
        if (node.language) {
          languages[node.language] = (languages[node.language] || 0) + 1;
        }
      }
    }
  }

  traverse(tree);
  return { totalFiles, totalDirectories, languages };
}

export function createCompactTreeString(
  tree: FileNode[],
  maxLines: number = 60
): string {
  const lines: string[] = [];

  function traverse(nodes: FileNode[], prefix: string = "") {
    for (let i = 0; i < nodes.length && lines.length < maxLines; i++) {
      const node = nodes[i];
      const isLast = i === nodes.length - 1;
      const connector = isLast ? "└── " : "├── ";

      lines.push(`${prefix}${connector}${node.name}`);

      if (node.type === "directory" && node.children) {
        traverse(node.children, prefix + (isLast ? "    " : "│   "));
      }
    }
  }

  traverse(tree);
  if (lines.length >= maxLines) lines.push("... (truncated)");
  return lines.join("\n");
}
