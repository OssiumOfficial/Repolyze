export const APP_NAME = "RepoGist";
export const APP_DESCRIPTION = "AI-Powered GitHub Repository Analyzer";

export const ANIMATION_DURATION = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
};

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export const FILE_ICONS: Record<string, string> = {
  typescript: "📘",
  javascript: "📒",
  python: "🐍",
  rust: "🦀",
  go: "🐹",
  java: "☕",
  ruby: "💎",
  php: "🐘",
  swift: "🍎",
  kotlin: "🎯",
  csharp: "🔷",
  cpp: "⚡",
  c: "🔧",
  html: "🌐",
  css: "🎨",
  json: "📋",
  markdown: "📝",
  yaml: "⚙️",
  docker: "🐳",
  shell: "🖥️",
  default: "📄",
  folder: "📁",
  folderOpen: "📂",
};

export const SCORE_THRESHOLDS = {
  excellent: 80,
  good: 60,
  fair: 40,
  poor: 0,
};

export const MAX_CHAT_MESSAGES = 50;
export const MAX_FILE_TREE_DEPTH = 6;
export const MAX_TREE_ITEMS = 500;