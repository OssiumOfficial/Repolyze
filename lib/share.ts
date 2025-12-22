import { AnalysisResult, ScoreMetrics } from "./types";

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
}

export function createShareData(result: Partial<AnalysisResult>): ShareCardData | null {
  if (!result.metadata) return null;

  const { metadata, scores, techStack, insights } = result;

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
  };
}

export function generateShareUrl(data: ShareCardData): string {
  try {
    const encoded = btoa(encodeURIComponent(JSON.stringify(data)));
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    return `${baseUrl}/share/${encoded}`;
  } catch {
    return "";
  }
}

export function parseShareData(encoded: string): ShareCardData | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

export function generateTwitterShareText(data: ShareCardData): string {
  const scoreEmoji = data.overallScore >= 80 ? "🟢" : data.overallScore >= 60 ? "🟡" : "🔴";
  const techList = data.techStack.slice(0, 3).join(", ");
  
  return `🔍 Just analyzed ${data.repoFullName} with RepoGist!

${scoreEmoji} Score: ${data.overallScore}/100
⭐ ${formatNumberShort(data.stars)} stars
🛠️ ${techList}${data.techStack.length > 3 ? ` +${data.techStack.length - 3} more` : ""}

Check out the full analysis:`;
}

export function generateTwitterShareUrl(data: ShareCardData): string {
  const text = generateTwitterShareText(data);
  const url = generateShareUrl(data);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

export function generateLinkedInShareUrl(data: ShareCardData): string {
  const url = generateShareUrl(data);
  const title = `${data.repoName} - Repository Analysis`;
  const summary = `AI analysis score: ${data.overallScore}/100. Tech stack: ${data.techStack.slice(0, 5).join(", ")}`;
  
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      return true;
    } catch {
      return false;
    }
  }
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
      backgroundColor: "#09090b", // zinc-950
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

function formatNumberShort(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return num.toString();
}