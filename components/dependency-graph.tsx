"use client";

import {
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Network,
  GripHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { DependencyNode, DependencyEdge } from "@/lib/types";
import { useTheme } from "next-themes";

// ─── Types ──────────────────────────────────────────────────────────

interface DependencyGraphProps {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

interface PositionedNode extends DependencyNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface CanvasState {
  panX: number;
  panY: number;
  zoom: number;
}

// ─── Color palette per node group ───────────────────────────────────

const GROUP_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  component: { bg: "#3b82f620", border: "#3b82f6", text: "#60a5fa" },
  page: { bg: "#8b5cf620", border: "#8b5cf6", text: "#a78bfa" },
  api: { bg: "#10b98120", border: "#10b981", text: "#34d399" },
  hook: { bg: "#f59e0b20", border: "#f59e0b", text: "#fbbf24" },
  lib: { bg: "#ec489920", border: "#ec4899", text: "#f472b6" },
  config: { bg: "#6b728020", border: "#6b7280", text: "#9ca3af" },
  context: { bg: "#14b8a620", border: "#14b8a6", text: "#2dd4bf" },
  store: { bg: "#f97316a0", border: "#f97316", text: "#fb923c" },
  service: { bg: "#6366f120", border: "#6366f1", text: "#818cf8" },
  model: { bg: "#84cc1620", border: "#84cc16", text: "#a3e635" },
  middleware: { bg: "#a855f720", border: "#a855f7", text: "#c084fc" },
  default: { bg: "#71717a20", border: "#71717a", text: "#a1a1aa" },
};

function getGroupColor(group: string) {
  return GROUP_COLORS[group.toLowerCase()] || GROUP_COLORS.default;
}

// ─── Force-directed layout ─────────────────────────────────────────

function forceDirectedLayout(
  nodes: DependencyNode[],
  edges: DependencyEdge[],
  width: number,
  height: number,
): PositionedNode[] {
  // Initial positions in a circle
  const positioned: PositionedNode[] = nodes.map((node, i) => {
    const angle = (2 * Math.PI * i) / nodes.length;
    const radius = Math.min(width, height) * 0.35;
    return {
      ...node,
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
      vx: 0,
      vy: 0,
    };
  });

  const nodeMap = new Map(positioned.map((n) => [n.id, n]));

  // Run simulation
  const iterations = 150;
  const repulsion = 8000;
  const attraction = 0.005;
  const damping = 0.85;
  const centerGravity = 0.01;

  for (let iter = 0; iter < iterations; iter++) {
    const temp = 1 - iter / iterations;

    // Repulsion between all nodes
    for (let i = 0; i < positioned.length; i++) {
      for (let j = i + 1; j < positioned.length; j++) {
        const a = positioned[i];
        const b = positioned[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
        const force = (repulsion * temp) / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }
    }

    // Attraction along edges
    for (const edge of edges) {
      const source = nodeMap.get(edge.from);
      const target = nodeMap.get(edge.to);
      if (!source || !target) continue;
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const force = dist * attraction * temp;
      const fx = (dx / Math.max(dist, 1)) * force;
      const fy = (dy / Math.max(dist, 1)) * force;
      source.vx += fx;
      source.vy += fy;
      target.vx -= fx;
      target.vy -= fy;
    }

    // Center gravity
    for (const node of positioned) {
      node.vx += (width / 2 - node.x) * centerGravity;
      node.vy += (height / 2 - node.y) * centerGravity;
    }

    // Apply velocity with damping
    for (const node of positioned) {
      node.vx *= damping;
      node.vy *= damping;
      node.x += node.vx;
      node.y += node.vy;
      // Keep within bounds with padding
      node.x = Math.max(80, Math.min(width - 80, node.x));
      node.y = Math.max(40, Math.min(height - 40, node.y));
    }
  }

  return positioned;
}

// ─── Edge path with curvature ──────────────────────────────────────

function getEdgePath(
  source: PositionedNode,
  target: PositionedNode,
  allEdges: DependencyEdge[],
  currentIdx: number,
): string {
  // Check if there's a reverse edge (bidirectional)
  const hasReverse = allEdges.some(
    (e, i) => i !== currentIdx && e.from === target.id && e.to === source.id,
  );

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (!hasReverse || dist < 10) {
    // Straight line (with slight offset to not overlap node centers)
    return `M ${source.x} ${source.y} L ${target.x} ${target.y}`;
  }

  // Curved — offset perpendicular
  const mx = (source.x + target.x) / 2;
  const my = (source.y + target.y) / 2;
  const nx = -dy / dist;
  const ny = dx / dist;
  const curve = 30;
  const cx = mx + nx * curve;
  const cy = my + ny * curve;
  return `M ${source.x} ${source.y} Q ${cx} ${cy} ${target.x} ${target.y}`;
}

// ─── Graph Canvas SVG ──────────────────────────────────────────────

function GraphCanvas({
  nodes,
  edges,
  width,
  height,
  className,
}: {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  width: number;
  height: number;
  className?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [canvas, setCanvas] = useState<CanvasState>({ panX: 0, panY: 0, zoom: 1 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [panning, setPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const positioned = useMemo(
    () => forceDirectedLayout(nodes, edges, width, height),
    [nodes, edges, width, height],
  );

  const initialPositions = useMemo(
    () => new Map(positioned.map((n) => [n.id, { x: n.x, y: n.y }])),
    [positioned],
  );

  // Only store drag overrides — everything else derives from the layout
  const [dragOverrides, setDragOverrides] = useState<Map<string, { x: number; y: number }>>(new Map());

  const nodeMap = useMemo(
    () => new Map(positioned.map((n) => [n.id, n])),
    [positioned],
  );

  // Get live node position (respects drag)
  const getPos = useCallback(
    (id: string) => dragOverrides.get(id) || initialPositions.get(id) || { x: 0, y: 0 },
    [dragOverrides, initialPositions],
  );

  // Highlight connected edges/nodes
  const connectedToSelected = useMemo(() => {
    if (!selected) return new Set<string>();
    const ids = new Set<string>();
    for (const e of edges) {
      if (e.from === selected) ids.add(e.to);
      if (e.to === selected) ids.add(e.from);
    }
    return ids;
  }, [selected, edges]);

  // ─── Mouse handlers ───
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-node-id]")) return;
      setPanning(true);
      setPanStart({ x: e.clientX - canvas.panX, y: e.clientY - canvas.panY });
    },
    [canvas.panX, canvas.panY],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (panning) {
        setCanvas((prev) => ({
          ...prev,
          panX: e.clientX - panStart.x,
          panY: e.clientY - panStart.y,
        }));
      }
      if (dragging && svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - canvas.panX) / canvas.zoom;
        const y = (e.clientY - rect.top - canvas.panY) / canvas.zoom;
        setDragOverrides((prev) => {
          const next = new Map(prev);
          next.set(dragging, { x, y });
          return next;
        });
      }
    },
    [panning, panStart, dragging, canvas.panX, canvas.panY, canvas.zoom],
  );

  const handleMouseUp = useCallback(() => {
    setPanning(false);
    setDragging(null);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setCanvas((prev) => ({
      ...prev,
      zoom: Math.max(0.2, Math.min(3, prev.zoom * delta)),
    }));
  }, []);

  const resetView = useCallback(() => {
    setCanvas({ panX: 0, panY: 0, zoom: 1 });
    setDragOverrides(new Map());
    setSelected(null);
  }, []);

  const zoomIn = useCallback(() => {
    setCanvas((prev) => ({ ...prev, zoom: Math.min(3, prev.zoom * 1.25) }));
  }, []);

  const zoomOut = useCallback(() => {
    setCanvas((prev) => ({ ...prev, zoom: Math.max(0.2, prev.zoom * 0.8) }));
  }, []);

  // Node dimensions
  const nodeW = 140;
  const nodeH = 48;
  const nodeR = 8;

  // Groups legend
  const activeGroups = useMemo(() => {
    const groups = new Set(nodes.map((n) => n.group));
    return Array.from(groups);
  }, [nodes]);

  return (
    <div className={cn("relative overflow-hidden rounded-lg bg-muted/20 border border-border/50", className)}>
      {/* Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border border-border/50 p-1">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomIn} title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={zoomOut} title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5" />
        </Button>
        <div className="w-px h-4 bg-border/50" />
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={resetView} title="Reset view">
          <RotateCcw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-1.5 max-w-[60%]">
        {activeGroups.map((group) => {
          const color = getGroupColor(group);
          return (
            <span
              key={group}
              className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: color.border }}
              />
              {group}
            </span>
          );
        })}
      </div>

      {/* Drag hint */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
        <GripHorizontal className="w-3 h-3" />
        Drag to pan · Scroll to zoom · Drag nodes to reposition
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-grab active:cursor-grabbing select-none"
        style={{ minHeight: height }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Arrow marker */}
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon
              points="0 0, 8 3, 0 6"
              fill={isDark ? "#525252" : "#a1a1aa"}
            />
          </marker>
          <marker
            id="arrowhead-active"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
          </marker>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${canvas.panX}, ${canvas.panY}) scale(${canvas.zoom})`}>
          {/* Edges */}
          {edges.map((edge, idx) => {
            const sourcePos = getPos(edge.from);
            const targetPos = getPos(edge.to);
            const sourceNode = { ...nodeMap.get(edge.from)!, ...sourcePos };
            const targetNode = { ...nodeMap.get(edge.to)!, ...targetPos };
            if (!sourceNode || !targetNode) return null;

            const isActive =
              selected === edge.from ||
              selected === edge.to ||
              hovered === edge.from ||
              hovered === edge.to;

            const path = getEdgePath(sourceNode, targetNode, edges, idx);

            return (
              <g key={`edge-${idx}`}>
                <path
                  d={path}
                  fill="none"
                  stroke={isActive ? "#3b82f6" : isDark ? "#333" : "#d4d4d8"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={edge.type === "indirect" ? "4 4" : undefined}
                  markerEnd={isActive ? "url(#arrowhead-active)" : "url(#arrowhead)"}
                  opacity={selected && !isActive ? 0.15 : isActive ? 1 : 0.5}
                  className="transition-all duration-200"
                />
                {/* Edge label */}
                {edge.label && isActive && (
                  <text
                    x={(sourcePos.x + targetPos.x) / 2}
                    y={(sourcePos.y + targetPos.y) / 2 - 8}
                    textAnchor="middle"
                    className="text-[9px] fill-muted-foreground pointer-events-none"
                    fontFamily="ui-monospace, monospace"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {positioned.map((node) => {
            const pos = getPos(node.id);
            const color = getGroupColor(node.group);
            const isSelected = selected === node.id;
            const isConnected = connectedToSelected.has(node.id);
            const isHovered = hovered === node.id;
            const dimmed = selected && !isSelected && !isConnected;
            const isFile = node.label.includes(".");

            return (
              <g
                key={node.id}
                data-node-id={node.id}
                transform={`translate(${pos.x - nodeW / 2}, ${pos.y - nodeH / 2})`}
                className="cursor-pointer"
                style={{ opacity: dimmed ? 0.2 : 1, transition: "opacity 200ms" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setDragging(node.id);
                }}
                onMouseEnter={() => setHovered(node.id)}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected((prev) => (prev === node.id ? null : node.id));
                }}
              >
                {/* Glow for selected */}
                {isSelected && (
                  <rect
                    x={-3}
                    y={-3}
                    width={nodeW + 6}
                    height={nodeH + 6}
                    rx={nodeR + 2}
                    fill="none"
                    stroke={color.border}
                    strokeWidth={2}
                    opacity={0.4}
                    filter="url(#glow)"
                  />
                )}

                {/* Node background */}
                <rect
                  width={nodeW}
                  height={nodeH}
                  rx={nodeR}
                  fill={isDark ? "#18181b" : "#ffffff"}
                  stroke={isSelected || isHovered ? color.border : isDark ? "#27272a" : "#e4e4e7"}
                  strokeWidth={isSelected ? 2 : 1}
                  className="transition-all duration-150"
                />

                {/* Color accent bar */}
                <rect
                  x={0}
                  y={0}
                  width={4}
                  height={nodeH}
                  rx={2}
                  fill={color.border}
                  opacity={0.8}
                />

                {/* Icon */}
                <g transform={`translate(14, ${nodeH / 2 - 7})`}>
                  {isFile ? (
                    <rect width="14" height="14" rx="2" fill={color.bg} stroke={color.border} strokeWidth="0.5" />
                  ) : (
                    <rect width="14" height="14" rx="3" fill={color.bg} stroke={color.border} strokeWidth="0.5" />
                  )}
                  <text
                    x="7"
                    y="10.5"
                    textAnchor="middle"
                    fontSize="8"
                    fill={color.text}
                    fontFamily="ui-monospace, monospace"
                    fontWeight="bold"
                  >
                    {isFile ? (node.label.split(".").pop() || "f").slice(0, 2).toUpperCase() : node.group.charAt(0).toUpperCase()}
                  </text>
                </g>

                {/* Label */}
                <text
                  x={36}
                  y={nodeH / 2 - 3}
                  fontSize="11"
                  fontWeight="500"
                  fill={isDark ? "#e4e4e7" : "#18181b"}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  className="pointer-events-none"
                >
                  {truncateLabel(node.label, 14)}
                </text>

                {/* Group label */}
                <text
                  x={36}
                  y={nodeH / 2 + 11}
                  fontSize="9"
                  fill={isDark ? "#71717a" : "#a1a1aa"}
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  className="pointer-events-none"
                >
                  {node.group}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Selected node info panel */}
      {selected && (() => {
        const node = nodeMap.get(selected);
        if (!node) return null;
        const inbound = edges.filter((e) => e.to === selected);
        const outbound = edges.filter((e) => e.from === selected);
        const color = getGroupColor(node.group);
        return (
          <div className="absolute bottom-3 right-3 z-10 max-w-64 bg-background/95 backdrop-blur-sm rounded-lg border border-border/60 p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: color.border }}
              />
              <span className="text-sm font-medium text-foreground truncate">{node.label}</span>
            </div>
            {node.description && (
              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{node.description}</p>
            )}
            <div className="flex gap-3 text-[10px] text-muted-foreground/70">
              <span>{inbound.length} inbound</span>
              <span>{outbound.length} outbound</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function truncateLabel(label: string, max: number): string {
  // Show last segment of a path, truncate if needed
  const parts = label.split("/");
  const name = parts[parts.length - 1];
  if (name.length <= max) {
    if (parts.length > 1) {
      const prefix = parts.slice(0, -1).join("/");
      if (prefix.length + name.length + 1 <= max + 6) {
        return label;
      }
      return "…/" + name;
    }
    return name;
  }
  return name.slice(0, max - 1) + "…";
}

// ─── Main Export ────────────────────────────────────────────────────

export function DependencyGraph({ nodes, edges }: DependencyGraphProps) {
  const [fullscreen, setFullscreen] = useState(false);

  if (nodes.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Network className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No dependency graph data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-border/60 bg-background overflow-hidden">
        <CardHeader className="p-4 border-b border-border/50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Network className="w-4 h-4 text-primary" />
              </div>
              Dependency Graph
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground tabular-nums">
                {nodes.length} nodes · {edges.length} connections
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setFullscreen(true)}
                title="Fullscreen"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <GraphCanvas nodes={nodes} edges={edges} width={900} height={500} />
        </CardContent>
      </Card>

      {/* Fullscreen dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-sm font-medium">
                <Network className="w-4 h-4 text-primary" />
                Dependency Graph
                <span className="text-xs text-muted-foreground font-normal ml-2">
                  {nodes.length} nodes · {edges.length} connections
                </span>
              </DialogTitle>
            </div>
          </DialogHeader>
          <div className="flex-1 min-h-0">
            <GraphCanvas
              nodes={nodes}
              edges={edges}
              width={1400}
              height={800}
              className="h-full rounded-none border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
