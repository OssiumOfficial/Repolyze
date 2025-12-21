export interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  size?: number;
  language?: string;
  extension?: string;
}

export interface RepoMetadata {
  name: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  watchers: number;
  language: string | null;
  topics: string[];
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  openIssues: number;
  license: string | null;
  isPrivate: boolean;
  owner: {
    login: string;
    avatarUrl: string;
    type: string;
  };
}

export interface ScoreMetrics {
  overall: number;
  codeQuality: number;
  documentation: number;
  security: number;
  maintainability: number;
  testCoverage: number;
  dependencies: number;
}

export interface AIInsight {
  type: "strength" | "weakness" | "suggestion" | "warning";
  category: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "critical";
  affectedFiles?: string[];
}

export interface Refactor {
  id: string;
  title: string;
  description: string;
  impact: "low" | "medium" | "high";
  effort: "low" | "medium" | "high";
  category: string;
  files: string[];
  suggestedCode?: string;
}

export interface Automation {
  id: string;
  type: "issue" | "pull-request" | "workflow";
  title: string;
  description: string;
  body: string;
  labels?: string[];
  priority: "low" | "medium" | "high";
}

export interface ArchitectureComponent {
  id: string;
  name: string;
  type:
    | "frontend"
    | "backend"
    | "database"
    | "service"
    | "external"
    | "middleware";
  description: string;
  technologies: string[];
  connections: string[];
}

export interface DataFlowNode {
  id: string;
  name: string;
  type: "source" | "process" | "store" | "output";
  description: string;
}

export interface DataFlowEdge {
  from: string;
  to: string;
  label: string;
  dataType?: string;
}

export interface AnalysisResult {
  metadata: RepoMetadata;
  fileTree: FileNode[];
  scores: ScoreMetrics;
  insights: AIInsight[];
  refactors: Refactor[];
  automations: Automation[];
  architecture: ArchitectureComponent[];
  dataFlow: {
    nodes: DataFlowNode[];
    edges: DataFlowEdge[];
  };
  summary: string;
  techStack: string[];
  fileStats: {
    totalFiles: number;
    totalDirectories: number;
    languages: Record<string, number>;
  };
}

export type AnalysisStage =
  | "idle"
  | "fetching"
  | "parsing"
  | "analyzing"
  | "complete"
  | "error";

export interface StreamingAnalysis {
  stage: AnalysisStage;
  progress: number;
  currentStep: string;
  error?: string;
}

export type IconProps = React.SVGProps<SVGSVGElement> & {
  secondaryfill?: string;
  strokewidth?: number;
  title?: string;
  className?: string;
  fill?: string;
};