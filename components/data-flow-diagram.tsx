"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Circle,
  Square,
  Database,
  ArrowRightCircle,
  Workflow,
  Link as LinkIcon,
  Code,
  Check,
  Maximize2,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DataFlowNode, DataFlowEdge, MermaidDiagram } from "@/lib/types";
import { generateDataFlowDiagram } from "@/lib/mermaid";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface DataFlowDiagramProps {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
  mermaidDiagram?: MermaidDiagram;
}

const nodeConfig = {
  source: { icon: Circle, label: "Sources" },
  process: { icon: Square, label: "Processes" },
  store: { icon: Database, label: "Storage" },
  output: { icon: ArrowRightCircle, label: "Outputs" },
} as const;

const nodeOrder = ["source", "process", "store", "output"] as const;

const getMermaidThemeVariables = (isDark: boolean) =>
  isDark
    ? {
        primaryColor: "#3b82f6",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#2563eb",
        lineColor: "#6b7280",
        secondaryColor: "#1e293b",
        tertiaryColor: "#0f172a",
        background: "#09090b",
        mainBkg: "#18181b",
        nodeBorder: "#3f3f46",
        clusterBkg: "#27272a",
        titleColor: "#fafafa",
        edgeLabelBackground: "#27272a",
        textColor: "#e4e4e7",
        nodeTextColor: "#fafafa",
      }
    : {
        primaryColor: "#3b82f6",
        primaryTextColor: "#1e293b",
        primaryBorderColor: "#2563eb",
        lineColor: "#94a3b8",
        secondaryColor: "#f1f5f9",
        tertiaryColor: "#e2e8f0",
        background: "#ffffff",
        mainBkg: "#f8fafc",
        nodeBorder: "#cbd5e1",
        clusterBkg: "#f1f5f9",
        titleColor: "#0f172a",
        edgeLabelBackground: "#f1f5f9",
        textColor: "#334155",
        nodeTextColor: "#0f172a",
      };

// Optimize SVG: remove excess whitespace and scale properly
const optimizeSvg = (svgString: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) return svgString;

  // Get the actual content bounds from the SVG group
  const gElement = svg.querySelector("g.output");
  if (gElement) {
    const bbox = (gElement as SVGGraphicsElement).getBBox?.();
    if (bbox && bbox.width > 0 && bbox.height > 0) {
      const padding = 20;
      const newViewBox = `${bbox.x - padding} ${bbox.y - padding} ${
        bbox.width + padding * 2
      } ${bbox.height + padding * 2}`;
      svg.setAttribute("viewBox", newViewBox);
    }
  }

  // Remove fixed dimensions to allow responsive scaling
  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  svg.style.width = "100%";
  svg.style.height = "100%";
  svg.style.maxHeight = "500px";

  return new XMLSerializer().serializeToString(svg);
};

// Convert SVG to high-quality PNG
const downloadAsPng = async (
  svgString: string,
  isDark: boolean,
): Promise<void> => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const svg = doc.querySelector("svg");

  if (!svg) throw new Error("Invalid SVG");

  // Calculate proper dimensions
  const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [];
  const width = viewBox[2] || 800;
  const height = viewBox[3] || 600;

  // Set explicit dimensions for export
  const exportWidth = Math.max(width, 800);
  const exportHeight = Math.max(height, 400);
  const scale = 2;

  svg.setAttribute("width", String(exportWidth));
  svg.setAttribute("height", String(exportHeight));

  // Add background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", isDark ? "#09090b" : "#ffffff");
  svg.insertBefore(bg, svg.firstChild);

  // Convert to base64 data URL
  const svgData = new XMLSerializer().serializeToString(svg);
  const base64 = btoa(unescape(encodeURIComponent(svgData)));
  const dataUrl = `data:image/svg+xml;base64,${base64}`;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = exportWidth * scale;
      canvas.height = exportHeight * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }

      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, exportWidth, exportHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Blob creation failed"));
            return;
          }
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `data-flow-${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          resolve();
        },
        "image/png",
        1.0,
      );
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
};

export function DataFlowDiagram({
  nodes,
  edges,
  mermaidDiagram,
}: DataFlowDiagramProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [activeTab, setActiveTab] = useState<"visual" | "mermaid">("visual");
  const [copied, setCopied] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [mermaidSvg, setMermaidSvg] = useState<string>("");
  const [rawSvg, setRawSvg] = useState<string>("");

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const groupedNodes = useMemo(() => {
    const groups: Record<string, DataFlowNode[]> = {
      source: [],
      process: [],
      store: [],
      output: [],
    };
    nodes.forEach((node) => {
      if (groups[node.type]) groups[node.type].push(node);
    });
    return groups;
  }, [nodes]);

  const activeTypes = nodeOrder.filter(
    (type) => groupedNodes[type]?.length > 0,
  );

  const diagram = useMemo(() => {
    if (mermaidDiagram) return mermaidDiagram;
    if (nodes.length > 0) return generateDataFlowDiagram(nodes, edges);
    return null;
  }, [mermaidDiagram, nodes, edges]);

  // Render Mermaid diagram
  useEffect(() => {
    if (!diagram || activeTab !== "mermaid") return;

    let cancelled = false;

    const render = async () => {
      try {
        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: getMermaidThemeVariables(isDark),
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            rankSpacing: 60,
            nodeSpacing: 40,
            padding: 20,
            useMaxWidth: false,
          },
          securityLevel: "loose",
        });

        const id = `mermaid-${Date.now()}`;
        const { svg } = await mermaid.render(id, diagram.code);

        if (cancelled) return;

        setRawSvg(svg);
        setMermaidSvg(optimizeSvg(svg));
      } catch (error) {
        console.error("Mermaid render failed:", error);
        setMermaidSvg("");
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [diagram, activeTab, isDark]);

  const handleCopy = useCallback(async () => {
    if (!diagram) return;
    await navigator.clipboard.writeText(diagram.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [diagram]);

  const handleDownload = useCallback(async () => {
    if (!rawSvg) return;
    setDownloading(true);
    try {
      await downloadAsPng(rawSvg, isDark);
    } catch (error) {
      console.error("Download failed:", error);
      // Fallback to SVG download
      const blob = new Blob([rawSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `data-flow-${Date.now()}.svg`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }, [rawSvg, isDark]);

  if (nodes.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Workflow className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No data flow information available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const DiagramActions = ({ size = "sm" }: { size?: "sm" | "default" }) => (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size={size}
        onClick={handleDownload}
        disabled={!rawSvg || downloading}
        className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
      >
        {downloading ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {downloading ? "Saving..." : "PNG"}
      </Button>
      <Button
        variant="outline"
        size={size}
        onClick={handleCopy}
        className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Code className="w-3.5 h-3.5" />
        )}
        {copied ? "Copied" : "Code"}
      </Button>
      {!fullscreen && (
        <Button
          variant="outline"
          size={size}
          onClick={() => setFullscreen(true)}
          className={cn(size === "sm" && "h-7 text-xs gap-1.5")}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );

  const MermaidView = ({
    isFullscreen = false,
  }: {
    isFullscreen?: boolean;
  }) => (
    <div
      className={cn(
        "rounded-lg border border-border/50 overflow-hidden",
        isDark ? "bg-zinc-950" : "bg-white",
      )}
    >
      {mermaidSvg ? (
        <div
          className={cn(
            "w-full flex items-center justify-center p-4",
            isFullscreen ? "min-h-[40vh]" : "min-h-75 max-h-125",
          )}
          dangerouslySetInnerHTML={{ __html: mermaidSvg }}
        />
      ) : (
        <div className="flex items-center justify-center min-h-75">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Rendering...</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Card className="border-border/60 bg-background">
        <CardHeader className="p-4 border-b border-border/50">
          <div className="flex lg:items-center lg:flex-row flex-col items-start gap-2 justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Workflow className="w-4 h-4 text-primary" />
              Data Flow
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground tabular-nums">
                {nodes.length} nodes · {edges.length} edges
              </span>
              {diagram && (
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as "visual" | "mermaid")}
                >
                  <TabsList className="h-7">
                    <TabsTrigger value="visual" className="text-xs h-6 px-2">
                      Visual
                    </TabsTrigger>
                    <TabsTrigger value="mermaid" className="text-xs h-6 px-2">
                      Diagram
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          {activeTab === "visual" ? (
            <div className="space-y-6">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {activeTypes.map((type, typeIndex) => {
                  const config = nodeConfig[type];
                  const Icon = config.icon;
                  const typeNodes = groupedNodes[type];

                  return (
                    <motion.div
                      key={type}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: typeIndex * 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2 pb-1.5 border-b border-border/40">
                        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          {config.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 ml-auto">
                          {typeNodes.length}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {typeNodes.map((node) => (
                          <div
                            key={node.id}
                            className="p-2.5 rounded-md border border-border/40 bg-muted/20 hover:bg-muted/30 transition-colors"
                          >
                            <h4 className="text-sm font-medium truncate">
                              {node.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {node.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {edges.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Connections
                    </span>
                  </div>

                  <div className="grid gap-1.5 grid-cols-1 md:grid-cols-2">
                    {edges.map((edge) => {
                      const from = nodeMap.get(edge.from);
                      const to = nodeMap.get(edge.to);
                      if (!from || !to) return null;

                      return (
                        <div
                          key={`${edge.from}-${edge.to}`}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/10 hover:bg-muted/20 transition-colors text-xs"
                        >
                          <span className="font-medium truncate">
                            {from.name}
                          </span>
                          <ArrowRight className="w-3 h-3 text-muted-foreground/50 shrink-0" />
                          <span className="font-medium truncate">
                            {to.name}
                          </span>
                          {edge.label && (
                            <span className="ml-auto text-[10px] text-muted-foreground/70 px-1.5 py-0.5 rounded bg-muted/50 truncate max-w-20">
                              {edge.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <DiagramActions />
              </div>
              <MermaidView />
              {diagram && (
                <details className="group">
                  <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                    <Code className="w-3.5 h-3.5" />
                    Mermaid Code
                  </summary>
                  <pre className="mt-2 p-3 rounded-md bg-muted/50 border border-border/50 text-xs font-mono overflow-auto max-h-40">
                    {diagram.code}
                  </pre>
                </details>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent
          className="max-w-6xl max-h-[90vh] p-0"
          showCloseButton={false}
        >
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-base font-medium">
                <Workflow className="w-5 h-5 text-primary" />
                Diagram
              </DialogTitle>
              <DiagramActions size="default" />
            </div>
          </DialogHeader>
          <div
            className={cn(
              "p-6 overflow-auto",
              isDark ? "bg-zinc-950" : "bg-white",
            )}
          >
            <MermaidView isFullscreen />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
