import { AnalysisResult } from "./types";

export interface ShareCardData {
  repoName: string;
  repoFullName: string;
  ownerAvatar: string;
  ownerLogin: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  license: string | null;
  overallScore: number;
  scores: {
    codeQuality: number;
    documentation: number;
    security: number;
    maintainability: number;
    testCoverage: number;
    dependencies: number;
  };
  techStack: string[];
  topInsights: {
    strengths: number;
    weaknesses: number;
    suggestions: number;
    warnings: number;
  };
  analyzedAt: string;
  branch?: string;
}

export function createShareData(
  result: Partial<AnalysisResult>
): ShareCardData | null {
  if (!result.metadata) return null;

  const { metadata, scores, techStack, insights, branch } = result;

  return {
    repoName: metadata.name,
    repoFullName: metadata.fullName,
    ownerAvatar: metadata.owner.avatarUrl,
    ownerLogin: metadata.owner.login,
    description: metadata.description,
    stars: metadata.stars,
    forks: metadata.forks,
    watchers: metadata.watchers,
    language: metadata.language,
    license: metadata.license,
    overallScore: scores?.overall || 0,
    scores: {
      codeQuality: scores?.codeQuality || 0,
      documentation: scores?.documentation || 0,
      security: scores?.security || 0,
      maintainability: scores?.maintainability || 0,
      testCoverage: scores?.testCoverage || 0,
      dependencies: scores?.dependencies || 0,
    },
    techStack: techStack || [],
    topInsights: {
      strengths: insights?.filter((i) => i.type === "strength").length || 0,
      weaknesses: insights?.filter((i) => i.type === "weakness").length || 0,
      suggestions: insights?.filter((i) => i.type === "suggestion").length || 0,
      warnings: insights?.filter((i) => i.type === "warning").length || 0,
    },
    analyzedAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    branch,
  };
}

function formatNumberShort(num: number): string {
  if (num >= 1000000)
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}

function formatNumber(num: number): string {
  return num.toLocaleString();
}

const SITE_URL = "https://repolyze.vercel.app";

export function generateShareUrl(data: ShareCardData): string {
  const branchParam = data.branch
    ? `?branch=${encodeURIComponent(data.branch)}`
    : "";
  return `${SITE_URL}/share/${data.repoFullName}${branchParam}`;
}

export function generateTwitterShareUrl(data: ShareCardData): string {
  const scoreEmoji =
    data.overallScore >= 80 ? "🟢" : data.overallScore >= 60 ? "🟡" : "🔴";

  const branchInfo = data.branch ? ` (${data.branch} branch)` : "";

  const text = `🔍 Just analyzed ${
    data.repoFullName
  }${branchInfo} using Repolyze!

${scoreEmoji} Score: ${data.overallScore}/100
⭐ Stars: ${formatNumberShort(data.stars)}
💻 Language: ${data.language || "Multiple"}
🛠️ Tech: ${data.techStack.slice(0, 3).join(", ") || "Various"}

Analyze any GitHub repo instantly 👇`;

  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(SITE_URL)}`;
}

export function generateLinkedInShareUrl(data: ShareCardData): string {
  const branchInfo = data.branch ? ` (${data.branch} branch)` : "";

  const text = `🔍 Just analyzed ${
    data.repoFullName
  }${branchInfo} using Repolyze!

📊 Score: ${data.overallScore}/100
⭐ Stars: ${formatNumberShort(data.stars)}
💻 Language: ${data.language || "Multiple"}

Repolyze is an AI-powered tool that analyzes any GitHub repository instantly. Try it out!

${SITE_URL}`;

  return `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(
    text
  )}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textArea);
      return success;
    } catch {
      return false;
    }
  }
}

function getScoreRating(score: number): string {
  if (score >= 80) return "excellent";
  if (score >= 60) return "good";
  if (score >= 40) return "fair";
  return "needs improvement";
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return "🏆";
  if (score >= 80) return "🟢";
  if (score >= 70) return "🟡";
  if (score >= 60) return "🟠";
  if (score >= 40) return "🔴";
  return "⚠️";
}

function getScoreBar(score: number, length: number = 10): string {
  const filled = Math.round((score / 100) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function getImpactBadge(impact: string): string {
  const badges: Record<string, string> = {
    high: "🔴 High",
    medium: "🟡 Medium",
    low: "🟢 Low",
  };
  return badges[impact.toLowerCase()] || impact;
}

function getEffortBadge(effort: string): string {
  const badges: Record<string, string> = {
    high: "⏱️ High Effort",
    medium: "⏱️ Medium Effort",
    low: "⏱️ Low Effort",
  };
  return badges[effort.toLowerCase()] || effort;
}

/**
 * Generate simple English summary text for copying
 */
export function generateSummaryText(result: Partial<AnalysisResult>): string {
  if (!result.metadata) return "";

  const parts: string[] = [];

  // Title
  parts.push(`Repository Analysis: ${result.metadata.fullName}`);
  if (result.branch) {
    parts.push(`Branch: ${result.branch}`);
  }
  parts.push(`Analyzed on ${new Date().toLocaleDateString()}`);
  parts.push("");

  // Basic Info
  parts.push("About This Repository");
  parts.push("---------------------");
  if (result.metadata.description) {
    parts.push(result.metadata.description);
    parts.push("");
  }

  const stats = [];
  stats.push(`${result.metadata.stars.toLocaleString()} stars`);
  stats.push(`${result.metadata.forks.toLocaleString()} forks`);
  if (result.metadata.language) {
    stats.push(`written in ${result.metadata.language}`);
  }
  if (result.metadata.license) {
    stats.push(`${result.metadata.license} license`);
  }
  parts.push(`This repository has ${stats.join(", ")}.`);
  parts.push("");

  // Summary
  if (result.summary) {
    parts.push("Summary");
    parts.push("-------");
    parts.push(result.summary);
    parts.push("");
  }

  // What It Does
  if (result.whatItDoes) {
    parts.push("What It Does");
    parts.push("------------");
    parts.push(result.whatItDoes);
    parts.push("");
  }

  // Target Audience
  if (result.targetAudience) {
    parts.push("Who It's For");
    parts.push("------------");
    parts.push(result.targetAudience);
    parts.push("");
  }

  // Scores
  if (result.scores) {
    parts.push("Quality Assessment");
    parts.push("------------------");
    parts.push(
      `Overall Score: ${result.scores.overall}/100 (${getScoreRating(
        result.scores.overall
      )})`
    );
    parts.push("");
    parts.push("Breakdown:");
    parts.push(
      `• Code Quality: ${result.scores.codeQuality}/100 - ${getScoreRating(
        result.scores.codeQuality
      )}`
    );
    parts.push(
      `• Documentation: ${result.scores.documentation}/100 - ${getScoreRating(
        result.scores.documentation
      )}`
    );
    parts.push(
      `• Security: ${result.scores.security}/100 - ${getScoreRating(
        result.scores.security
      )}`
    );
    parts.push(
      `• Maintainability: ${
        result.scores.maintainability
      }/100 - ${getScoreRating(result.scores.maintainability)}`
    );
    parts.push(
      `• Test Coverage: ${result.scores.testCoverage}/100 - ${getScoreRating(
        result.scores.testCoverage
      )}`
    );
    parts.push(
      `• Dependencies: ${result.scores.dependencies}/100 - ${getScoreRating(
        result.scores.dependencies
      )}`
    );
    parts.push("");
  }

  // Tech Stack
  if (result.techStack && result.techStack.length > 0) {
    parts.push("Technologies Used");
    parts.push("-----------------");
    parts.push(result.techStack.join(", "));
    parts.push("");
  }

  // How to Run
  if (result.howToRun && result.howToRun.length > 0) {
    parts.push("Getting Started");
    parts.push("---------------");
    parts.push("To run this project locally:");
    parts.push("");
    result.howToRun.forEach((cmd, i) => {
      parts.push(`${i + 1}. ${cmd}`);
    });
    parts.push("");
  }

  // Key Folders
  if (result.keyFolders && result.keyFolders.length > 0) {
    parts.push("Project Structure");
    parts.push("-----------------");
    parts.push("Key folders in this repository:");
    parts.push("");
    for (const folder of result.keyFolders) {
      parts.push(`• ${folder.name}: ${folder.description}`);
    }
    parts.push("");
  }

  // Insights
  if (result.insights && result.insights.length > 0) {
    parts.push("Key Findings");
    parts.push("------------");

    const strengths = result.insights.filter((i) => i.type === "strength");
    const weaknesses = result.insights.filter((i) => i.type === "weakness");
    const suggestions = result.insights.filter((i) => i.type === "suggestion");
    const warnings = result.insights.filter((i) => i.type === "warning");

    if (strengths.length > 0) {
      parts.push("");
      parts.push("Strengths:");
      for (const insight of strengths.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (weaknesses.length > 0) {
      parts.push("");
      parts.push("Areas for Improvement:");
      for (const insight of weaknesses.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (suggestions.length > 0) {
      parts.push("");
      parts.push("Suggestions:");
      for (const insight of suggestions.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }

    if (warnings.length > 0) {
      parts.push("");
      parts.push("Warnings:");
      for (const insight of warnings.slice(0, 3)) {
        parts.push(`• ${insight.title}: ${insight.description}`);
      }
    }
    parts.push("");
  }

  // Refactors
  if (result.refactors && result.refactors.length > 0) {
    parts.push("Refactoring Opportunities");
    parts.push("-------------------------");
    for (const refactor of result.refactors.slice(0, 3)) {
      parts.push(
        `• ${refactor.title} (${refactor.impact} impact, ${refactor.effort} effort)`
      );
      parts.push(`  ${refactor.description}`);
      if (refactor.files && refactor.files.length > 0) {
        parts.push(`  Files: ${refactor.files.join(", ")}`);
      }
      parts.push("");
    }
  }

  // Footer
  parts.push("---");
  parts.push(`Generated by Repolyze (${SITE_URL})`);

  return parts.join("\n");
}

/**
 * Generate detailed, professionally styled markdown documentation
 */
export function generateMarkdownSummary(
  result: Partial<AnalysisResult>
): string {
  if (!result.metadata) return "";

  const lines: string[] = [];
  const {
    metadata,
    scores,
    techStack,
    insights,
    keyFolders,
    howToRun,
    refactors,
  } = result;

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`<div align="center">`);
  lines.push(``);
  lines.push(`# 📊 Repository Analysis Report`);
  lines.push(``);
  lines.push(`## ${metadata.fullName}`);
  lines.push(``);
  if (result.branch) {
    lines.push(`**🌿 Branch:** \`${result.branch}\``);
    lines.push(``);
  }
  lines.push(``);

  // Badges row
  const badges: string[] = [];
  badges.push(
    `![Stars](https://img.shields.io/github/stars/${metadata.fullName}?style=for-the-badge&logo=github&color=yellow)`
  );
  badges.push(
    `![Forks](https://img.shields.io/github/forks/${metadata.fullName}?style=for-the-badge&logo=github&color=blue)`
  );
  if (metadata.language) {
    badges.push(
      `![Language](https://img.shields.io/badge/${encodeURIComponent(
        metadata.language
      )}-language-green?style=for-the-badge)`
    );
  }
  if (metadata.license) {
    badges.push(
      `![License](https://img.shields.io/badge/${encodeURIComponent(
        metadata.license
      )}-license-purple?style=for-the-badge)`
    );
  }
  lines.push(badges.join(" "));
  lines.push(``);
  lines.push(`</div>`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ═══════════════════════════════════════════════════════════════════════════
  // TABLE OF CONTENTS
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`## 📑 Table of Contents`);
  lines.push(``);
  lines.push(`- [Overview](#-overview)`);
  lines.push(`- [Repository Statistics](#-repository-statistics)`);
  if (scores) lines.push(`- [Quality Assessment](#-quality-assessment)`);
  if (techStack && techStack.length > 0)
    lines.push(`- [Technology Stack](#-technology-stack)`);
  if (keyFolders && keyFolders.length > 0)
    lines.push(`- [Project Structure](#-project-structure)`);
  if (howToRun && howToRun.length > 0)
    lines.push(`- [Getting Started](#-getting-started)`);
  if (insights && insights.length > 0)
    lines.push(`- [Analysis Insights](#-analysis-insights)`);
  if (refactors && refactors.length > 0)
    lines.push(
      `- [Refactoring Recommendations](#-refactoring-recommendations)`
    );
  lines.push(`- [Analysis Metadata](#-analysis-metadata)`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERVIEW SECTION
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`## 📖 Overview`);
  lines.push(``);

  if (metadata.description) {
    lines.push(`> ${metadata.description}`);
    lines.push(``);
  }

  if (result.summary) {
    lines.push(`### Summary`);
    lines.push(``);
    lines.push(result.summary);
    lines.push(``);
  }

  if (result.whatItDoes) {
    lines.push(`### What This Repository Does`);
    lines.push(``);
    lines.push(result.whatItDoes);
    lines.push(``);
  }

  if (result.targetAudience) {
    lines.push(`### Target Audience`);
    lines.push(``);
    lines.push(`🎯 ${result.targetAudience}`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(``);

  // ═══════════════════════════════════════════════════════════════════════════
  // REPOSITORY STATISTICS
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`## 📈 Repository Statistics`);
  lines.push(``);
  lines.push(`<table>`);
  lines.push(`<tr>`);
  lines.push(`<td align="center"><b>⭐ Stars</b></td>`);
  lines.push(`<td align="center"><b>🍴 Forks</b></td>`);
  lines.push(`<td align="center"><b>👀 Watchers</b></td>`);
  lines.push(`<td align="center"><b>💻 Language</b></td>`);
  lines.push(`<td align="center"><b>📄 License</b></td>`);
  lines.push(`</tr>`);
  lines.push(`<tr>`);
  lines.push(`<td align="center">${formatNumber(metadata.stars)}</td>`);
  lines.push(`<td align="center">${formatNumber(metadata.forks)}</td>`);
  lines.push(`<td align="center">${formatNumber(metadata.watchers)}</td>`);
  lines.push(`<td align="center">${metadata.language || "N/A"}</td>`);
  lines.push(`<td align="center">${metadata.license || "N/A"}</td>`);
  lines.push(`</tr>`);
  lines.push(`</table>`);
  lines.push(``);
  lines.push(`---`);
  lines.push(``);

  // ═══════════════════════════════════════════════════════════════════════════
  // QUALITY ASSESSMENT
  // ═══════════════════════════════════════════════════════════════════════════

  if (scores) {
    lines.push(`## 🎯 Quality Assessment`);
    lines.push(``);

    // Overall Score Highlight
    lines.push(`<div align="center">`);
    lines.push(``);
    lines.push(`### Overall Score`);
    lines.push(``);
    lines.push(`# ${getScoreEmoji(scores.overall)} ${scores.overall}/100`);
    lines.push(`**${getScoreRating(scores.overall).toUpperCase()}**`);
    lines.push(``);
    lines.push(`\`${getScoreBar(scores.overall, 20)}\``);
    lines.push(``);
    lines.push(`</div>`);
    lines.push(``);

    // Detailed Scores Table
    lines.push(`### Detailed Breakdown`);
    lines.push(``);
    lines.push(`| Metric | Score | Progress | Rating |`);
    lines.push(`|:-------|:-----:|:---------|:-------|`);

    const scoreMetrics = [
      { name: "🔧 Code Quality", score: scores.codeQuality },
      { name: "📚 Documentation", score: scores.documentation },
      { name: "🔒 Security", score: scores.security },
      { name: "🔄 Maintainability", score: scores.maintainability },
      { name: "🧪 Test Coverage", score: scores.testCoverage },
      { name: "📦 Dependencies", score: scores.dependencies },
    ];

    for (const metric of scoreMetrics) {
      const bar = getScoreBar(metric.score, 10);
      const rating = getScoreRating(metric.score);
      const emoji = getScoreEmoji(metric.score);
      lines.push(
        `| ${metric.name} | **${metric.score}**/100 | \`${bar}\` | ${emoji} ${rating} |`
      );
    }
    lines.push(``);

    // Score Legend
    lines.push(`<details>`);
    lines.push(`<summary><b>📊 Score Legend</b></summary>`);
    lines.push(``);
    lines.push(`| Range | Rating | Description |`);
    lines.push(`|:------|:-------|:------------|`);
    lines.push(
      `| 90-100 | 🏆 Excellent | Outstanding quality, best practices followed |`
    );
    lines.push(
      `| 80-89 | 🟢 Very Good | High quality with minor improvements possible |`
    );
    lines.push(
      `| 70-79 | 🟡 Good | Solid quality, some areas need attention |`
    );
    lines.push(
      `| 60-69 | 🟠 Fair | Acceptable but significant improvements needed |`
    );
    lines.push(
      `| 40-59 | 🔴 Poor | Below average, requires substantial work |`
    );
    lines.push(
      `| 0-39 | ⚠️ Critical | Serious issues that need immediate attention |`
    );
    lines.push(``);
    lines.push(`</details>`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TECHNOLOGY STACK
  // ═══════════════════════════════════════════════════════════════════════════

  if (techStack && techStack.length > 0) {
    lines.push(`## 🛠️ Technology Stack`);
    lines.push(``);
    lines.push(`<div align="center">`);
    lines.push(``);

    // Create tech badges
    const techBadges = techStack.map((tech) => {
      const encoded = encodeURIComponent(tech);
      return `![${tech}](https://img.shields.io/badge/${encoded}-333?style=for-the-badge)`;
    });
    lines.push(techBadges.join(" "));
    lines.push(``);
    lines.push(`</div>`);
    lines.push(``);

    // Tech list table
    if (techStack.length > 5) {
      lines.push(`<details>`);
      lines.push(
        `<summary><b>View All Technologies (${techStack.length})</b></summary>`
      );
      lines.push(``);
      lines.push(`| # | Technology |`);
      lines.push(`|:--|:-----------|`);
      techStack.forEach((tech, idx) => {
        lines.push(`| ${idx + 1} | ${tech} |`);
      });
      lines.push(``);
      lines.push(`</details>`);
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PROJECT STRUCTURE
  // ═══════════════════════════════════════════════════════════════════════════

  if (keyFolders && keyFolders.length > 0) {
    lines.push(`## 📁 Project Structure`);
    lines.push(``);
    lines.push(`\`\`\`text`);
    lines.push(`${metadata.name}/`);
    for (const folder of keyFolders) {
      lines.push(`├── ${folder.name}/`);
      lines.push(`│   └── ${folder.description}`);
    }
    lines.push(`└── ...`);
    lines.push(`\`\`\``);
    lines.push(``);

    // Detailed folder table
    lines.push(`### Key Directories`);
    lines.push(``);
    lines.push(`| Directory | Purpose |`);
    lines.push(`|:----------|:--------|`);
    for (const folder of keyFolders) {
      lines.push(`| \`${folder.name}/\` | ${folder.description} |`);
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GETTING STARTED
  // ═══════════════════════════════════════════════════════════════════════════

  if (howToRun && howToRun.length > 0) {
    lines.push(`## 🚀 Getting Started`);
    lines.push(``);
    lines.push(`Follow these steps to set up and run the project locally:`);
    lines.push(``);

    // Prerequisites
    lines.push(`### Prerequisites`);
    lines.push(``);
    lines.push(`- Git installed on your system`);
    if (
      techStack?.includes("Node.js") ||
      techStack?.includes("npm") ||
      techStack?.includes("JavaScript") ||
      techStack?.includes("TypeScript")
    ) {
      lines.push(`- Node.js (LTS version recommended)`);
      lines.push(`- npm or yarn package manager`);
    }
    if (techStack?.includes("Python")) {
      lines.push(`- Python 3.x installed`);
    }
    if (techStack?.includes("Docker")) {
      lines.push(`- Docker and Docker Compose`);
    }
    lines.push(``);

    // Installation steps
    lines.push(`### Installation`);
    lines.push(``);

    howToRun.forEach((cmd, idx) => {
      lines.push(
        `**Step ${idx + 1}:** ${
          cmd.includes("clone")
            ? "Clone the repository"
            : cmd.includes("install")
            ? "Install dependencies"
            : cmd.includes("run") || cmd.includes("start")
            ? "Start the application"
            : "Execute command"
        }`
      );
      lines.push(``);
      lines.push(`\`\`\`bash`);
      lines.push(cmd);
      lines.push(`\`\`\``);
      lines.push(``);
    });

    // Quick start code block
    lines.push(`<details>`);
    lines.push(`<summary><b>📋 Quick Copy - All Commands</b></summary>`);
    lines.push(``);
    lines.push(`\`\`\`bash`);
    lines.push(`# Complete setup in one go`);
    for (const cmd of howToRun) {
      lines.push(cmd);
    }
    lines.push(`\`\`\``);
    lines.push(``);
    lines.push(`</details>`);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSIS INSIGHTS
  // ═══════════════════════════════════════════════════════════════════════════

  if (insights && insights.length > 0) {
    lines.push(`## 🔍 Analysis Insights`);
    lines.push(``);

    const strengths = insights.filter((i) => i.type === "strength");
    const weaknesses = insights.filter((i) => i.type === "weakness");
    const suggestions = insights.filter((i) => i.type === "suggestion");
    const warnings = insights.filter((i) => i.type === "warning");

    // Summary cards
    lines.push(`<table>`);
    lines.push(`<tr>`);
    lines.push(
      `<td align="center">✅<br><b>${strengths.length}</b><br>Strengths</td>`
    );
    lines.push(
      `<td align="center">⚠️<br><b>${weaknesses.length}</b><br>Weaknesses</td>`
    );
    lines.push(
      `<td align="center">💡<br><b>${suggestions.length}</b><br>Suggestions</td>`
    );
    lines.push(
      `<td align="center">🚨<br><b>${warnings.length}</b><br>Warnings</td>`
    );
    lines.push(`</tr>`);
    lines.push(`</table>`);
    lines.push(``);

    // Strengths
    if (strengths.length > 0) {
      lines.push(`### ✅ Strengths`);
      lines.push(``);
      lines.push(`> What this repository does well`);
      lines.push(``);
      for (const insight of strengths) {
        lines.push(`<details>`);
        lines.push(`<summary><b>${insight.title}</b></summary>`);
        lines.push(``);
        lines.push(insight.description);
        lines.push(``);
        lines.push(`</details>`);
        lines.push(``);
      }
    }

    // Weaknesses
    if (weaknesses.length > 0) {
      lines.push(`### ⚠️ Areas for Improvement`);
      lines.push(``);
      lines.push(`> Issues that should be addressed`);
      lines.push(``);
      lines.push(`| Issue | Description |`);
      lines.push(`|:------|:------------|`);
      for (const insight of weaknesses) {
        lines.push(`| **${insight.title}** | ${insight.description} |`);
      }
      lines.push(``);
    }

    // Suggestions
    if (suggestions.length > 0) {
      lines.push(`### 💡 Suggestions`);
      lines.push(``);
      lines.push(`> Recommendations for enhancement`);
      lines.push(``);
      suggestions.forEach((insight, idx) => {
        lines.push(`${idx + 1}. **${insight.title}**`);
        lines.push(`   - ${insight.description}`);
        lines.push(``);
      });
    }

    // Warnings
    if (warnings.length > 0) {
      lines.push(`### 🚨 Warnings`);
      lines.push(``);
      lines.push(`> Critical issues requiring attention`);
      lines.push(``);
      lines.push(`> [!WARNING]`);
      for (const insight of warnings) {
        lines.push(`> **${insight.title}:** ${insight.description}`);
      }
      lines.push(``);
    }

    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // REFACTORING RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  if (refactors && refactors.length > 0) {
    lines.push(`## 🔨 Refactoring Recommendations`);
    lines.push(``);
    lines.push(`Prioritized list of recommended code improvements:`);
    lines.push(``);

    refactors.forEach((refactor, idx) => {
      lines.push(`### ${idx + 1}. ${refactor.title}`);
      lines.push(``);
      lines.push(`| Attribute | Value |`);
      lines.push(`|:----------|:------|`);
      lines.push(`| **Impact** | ${getImpactBadge(refactor.impact)} |`);
      lines.push(`| **Effort** | ${getEffortBadge(refactor.effort)} |`);
      lines.push(``);
      lines.push(`**Description:**`);
      lines.push(refactor.description);
      lines.push(``);

      if (refactor.files && refactor.files.length > 0) {
        lines.push(`**Affected Files:**`);
        lines.push(``);
        lines.push(`\`\`\`text`);
        for (const file of refactor.files) {
          lines.push(`📄 ${file}`);
        }
        lines.push(`\`\`\``);
        lines.push(``);
      }

      if (refactor.codeExample) {
        lines.push(`<details>`);
        lines.push(`<summary><b>💻 Code Example</b></summary>`);
        lines.push(``);
        lines.push(`\`\`\`${metadata.language?.toLowerCase() || "javascript"}`);
        lines.push(refactor.codeExample);
        lines.push(`\`\`\``);
        lines.push(``);
        lines.push(`</details>`);
        lines.push(``);
      }
    });

    // Priority Matrix
    lines.push(`### 📊 Priority Matrix`);
    lines.push(``);
    lines.push(`| Refactor | Impact | Effort | Priority |`);
    lines.push(`|:---------|:------:|:------:|:--------:|`);
    for (const refactor of refactors) {
      const impactScore =
        refactor.impact.toLowerCase() === "high"
          ? 3
          : refactor.impact.toLowerCase() === "medium"
          ? 2
          : 1;
      const effortScore =
        refactor.effort.toLowerCase() === "low"
          ? 3
          : refactor.effort.toLowerCase() === "medium"
          ? 2
          : 1;
      const priority =
        impactScore + effortScore >= 5
          ? "🔴 High"
          : impactScore + effortScore >= 3
          ? "🟡 Medium"
          : "🟢 Low";
      lines.push(
        `| ${refactor.title} | ${getImpactBadge(
          refactor.impact
        )} | ${getEffortBadge(refactor.effort)} | ${priority} |`
      );
    }
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ANALYSIS METADATA
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`## 📋 Analysis Metadata`);
  lines.push(``);
  lines.push(`| Property | Value |`);
  lines.push(`|:---------|:------|`);
  lines.push(
    `| **Repository** | [${metadata.fullName}](https://github.com/${metadata.fullName}) |`
  );
  lines.push(
    `| **Owner** | [@${metadata.owner.login}](https://github.com/${metadata.owner.login}) |`
  );
  if (result.branch) {
    lines.push(`| **Branch Analyzed** | \`${result.branch}\` |`);
  }
  lines.push(
    `| **Analysis Date** | ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })} |`
  );
  lines.push(
    `| **Analysis Time** | ${new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    })} |`
  );
  lines.push(``);

  // ═══════════════════════════════════════════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════════════════════════════════════════

  lines.push(`---`);
  lines.push(``);
  lines.push(`<div align="center">`);
  lines.push(``);
  lines.push(`**🔍 Powered by [Repolyze](${SITE_URL})**`);
  lines.push(``);
  lines.push(`*AI-powered GitHub repository analysis*`);
  lines.push(``);
  lines.push(
    `[![Analyze Another Repo](https://img.shields.io/badge/Analyze_Another_Repo-Visit_Repolyze-blue?style=for-the-badge)](${SITE_URL})`
  );
  lines.push(``);
  lines.push(`</div>`);

  return lines.join("\n");
}

/**
 * Copy summary to clipboard
 */
export async function copySummary(
  result: Partial<AnalysisResult>,
  format: "text" | "markdown" = "text"
): Promise<boolean> {
  const text =
    format === "markdown"
      ? generateMarkdownSummary(result)
      : generateSummaryText(result);

  return copyToClipboard(text);
}

export async function downloadAsImage(
  element: HTMLElement,
  filename: string
): Promise<boolean> {
  try {
    const { toPng } = await import("html-to-image");

    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: "#09090b",
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });

    const link = document.createElement("a");
    link.download = `${filename}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error("Failed to download image:", error);
    return false;
  }
}

export function redirectToTwitter(data: ShareCardData): void {
  window.open(generateTwitterShareUrl(data), "_blank", "noopener,noreferrer");
}

export function redirectToLinkedIn(data: ShareCardData): void {
  window.open(generateLinkedInShareUrl(data), "_blank", "noopener,noreferrer");
}

// fix this error