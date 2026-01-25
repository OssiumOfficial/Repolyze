// lib/github.ts
import { FileNode, FileStats, RepoMetadata, BranchInfo } from "./types";
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
  truncated?: boolean;
}

interface GitHubBranchResponse {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
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

/**
 * Fetch all branches for a repository
 */
export async function fetchRepoBranches(
  owner: string,
  repo: string,
  defaultBranch?: string,
): Promise<BranchInfo[]> {
  const branches: BranchInfo[] = [];
  let page = 1;
  const perPage = 100;
  const maxBranches = 100; // Limit to prevent excessive API calls

  try {
    while (branches.length < maxBranches) {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=${perPage}&page=${page}`,
        { headers: getHeaders(), cache: "no-store" },
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Repository not found");
        }
        throw new Error(`Failed to fetch branches: ${response.statusText}`);
      }

      const data: GitHubBranchResponse[] = await response.json();

      if (data.length === 0) break;

      branches.push(
        ...data.map((branch) => ({
          name: branch.name,
          commit: {
            sha: branch.commit.sha,
            url: branch.commit.url,
          },
          protected: branch.protected,
          isDefault: branch.name === defaultBranch,
        })),
      );

      if (data.length < perPage) break;
      page++;
    }

    // Sort: default branch first, then protected, then alphabetically
    return branches.sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      if (a.protected && !b.protected) return -1;
      if (!a.protected && b.protected) return 1;
      return a.name.localeCompare(b.name);
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    // Return empty array instead of throwing - branches are optional
    return [];
  }
}

export async function fetchRepoMetadata(
  owner: string,
  repo: string,
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
          "GitHub API rate limit exceeded. Please add a GITHUB_TOKEN or try later.",
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

/**
 * Fetch repository tree for a specific branch
 */
export async function fetchRepoTree(
  owner: string,
  repo: string,
  branch?: string,
): Promise<FileNode[]> {
  // Try the specified branch, then default to main, then master
  const branchesToTry = branch ? [branch] : ["main", "master"];

  let lastError: Error | null = null;

  for (const targetBranch of branchesToTry) {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${targetBranch}?recursive=1`,
        { headers: getHeaders(), cache: "no-store" },
      );

      if (response.ok) {
        const data: GitHubTreeResponse = await response.json();
        const filteredItems = data.tree
          .filter((item) => {
            const depth = item.path.split("/").length;
            return depth <= MAX_FILE_TREE_DEPTH && !shouldExclude(item.path);
          })
          .slice(0, MAX_TREE_ITEMS);

        return buildFileTree(filteredItems);
      }

      if (response.status === 404) {
        lastError = new Error(`Branch '${targetBranch}' not found`);
        continue;
      }

      throw new Error(
        `Failed to fetch repository tree: ${response.statusText}`,
      );
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
  }

  throw lastError || new Error("Failed to fetch repository tree");
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

/**
 * Fetch important files from a specific branch
 */
export async function fetchImportantFiles(
  owner: string,
  repo: string,
  branch?: string,
): Promise<Record<string, string>> {
  const targetBranch = branch || "main";

  // Expanded list for better analysis
  const configFiles = [
    "package.json",
    "README.md",
    "readme.md",
    "tsconfig.json",
    "next.config.js",
    "next.config.ts",
    "next.config.mjs",
    "vite.config.ts",
    "vite.config.js",
    "tailwind.config.js",
    "tailwind.config.ts",
    "eslint.config.js",
    ".eslintrc.js",
    ".eslintrc.json",
    "biome.json",
    ".prettierrc",
    ".prettierrc.json",
    "prisma/schema.prisma",
    "docker-compose.yml",
    "docker-compose.yaml",
    "Dockerfile",
    "requirements.txt",
    "pyproject.toml",
    "setup.py",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
    "build.gradle",
    ".env.example",
    ".github/workflows/ci.yml",
    ".github/workflows/main.yml",
    ".github/dependabot.yml",
    "CHANGELOG.md",
    "CONTRIBUTING.md",
    "LICENSE",
  ];

  // Also try to fetch some source files for better analysis
  const sourcePatterns = [
    "src/index.ts",
    "src/index.js",
    "src/main.ts",
    "src/main.js",
    "src/app.ts",
    "src/app.js",
    "app/page.tsx",
    "app/layout.tsx",
    "pages/index.tsx",
    "pages/_app.tsx",
    "lib/utils.ts",
    "utils/index.ts",
    "src/lib/utils.ts",
    "main.py",
    "app.py",
    "main.go",
    "src/main.rs",
  ];

  const allFiles = [...configFiles, ...sourcePatterns];
  const contents: Record<string, string> = {};
  let totalSize = 0;
  const maxSize = 100000; // 100KB total
  const maxFileSize = 8000; // 8KB per file

  const fetchFile = async (
    file: string,
  ): Promise<{ file: string; content: string } | null> => {
    try {
      const response = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file}?ref=${targetBranch}`,
        { headers: getHeaders(), cache: "no-store" },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.size <= 50000 && data.encoding === "base64") {
          const content = Buffer.from(data.content, "base64").toString("utf-8");
          return { file, content: content.slice(0, maxFileSize) };
        }
      }
    } catch {
      // Skip file
    }
    return null;
  };

  // Fetch in parallel batches
  const batchSize = 8;
  for (let i = 0; i < allFiles.length && totalSize < maxSize; i += batchSize) {
    const batch = allFiles.slice(i, i + batchSize);
    const results = await Promise.all(batch.map(fetchFile));

    for (const result of results) {
      if (result && totalSize + result.content.length < maxSize) {
        contents[result.file] = result.content;
        totalSize += result.content.length;
      }
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
  maxLines: number = 60,
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
