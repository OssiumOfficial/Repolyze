"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Circle,
  Square,
  Database,
  ArrowRightCircle,
  Workflow,
  Link as LinkIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataFlowNode, DataFlowEdge } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DataFlowDiagramProps {
  nodes: DataFlowNode[];
  edges: DataFlowEdge[];
}

const nodeConfig = {
  source: { icon: Circle, label: "Sources" },
  process: { icon: Square, label: "Processes" },
  store: { icon: Database, label: "Storage" },
  output: { icon: ArrowRightCircle, label: "Outputs" },
} as const;

const nodeOrder = ["source", "process", "store", "output"] as const;

export function DataFlowDiagram({ nodes, edges }: DataFlowDiagramProps) {
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
    (type) => groupedNodes[type]?.length > 0
  );

  if (nodes.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
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

  return (
    <Card className="border-border/60">
      {/* Header */}
      <CardHeader className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Workflow className="w-4 h-4 text-primary" />
            Data Flow
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {nodes.length} nodes · {edges.length} links
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-8">
        {/* Nodes Grid: Stacks on mobile, expands on desktop */}
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {activeTypes.map((type, typeIndex) => {
            const config = nodeConfig[type];
            const Icon = config.icon;
            const typeNodes = groupedNodes[type];

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: typeIndex * 0.05 }}
                className="flex flex-col gap-3 min-w-0"
              >
                {/* Type Header */}
                <div className="flex items-center gap-2 pb-1 border-b border-border/40">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    {config.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto">
                    {typeNodes.length}
                  </span>
                </div>

                {/* Node Cards */}
                <div className="flex flex-col gap-2">
                  {typeNodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        delay: typeIndex * 0.05 + index * 0.02,
                      }}
                      className={cn(
                        "p-3 rounded-lg border border-border/50",
                        "bg-muted/20 hover:bg-muted/40",
                        "transition-colors cursor-default"
                      )}
                    >
                      <h4 className="text-sm font-medium text-foreground truncate w-full block">
                        {node.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 min-h-[2.5em] leading-relaxed">
                        {node.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Connections Section */}
        {edges.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 pt-4 border-t border-border/50"
          >
            {/* Section Header */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Connection Map
              </span>
            </div>

            {/* Connection List: 1 col on mobile, 2 on tablet+ */}
            <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
              {edges.map((edge, index) => {
                const fromNode = nodeMap.get(edge.from);
                const toNode = nodeMap.get(edge.to);

                if (!fromNode || !toNode) return null;

                return (
                  <motion.div
                    key={`${edge.from}-${edge.to}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.02 }}
                    className={cn(
                      "flex items-center justify-between gap-3 p-2.5 rounded-lg border border-border/40",
                      "bg-muted/10 hover:bg-muted/20 transition-colors"
                    )}
                  >
                    {/* Flow: From -> To */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-medium text-foreground truncate shrink">
                        {fromNode.name}
                      </span>
                      
                      <ArrowRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
                      
                      <span className="text-xs font-medium text-foreground truncate shrink">
                        {toNode.name}
                      </span>
                    </div>

                    {/* Label */}
                    {edge.label && (
                      <span className="text-[10px] text-muted-foreground/70 px-1.5 py-0.5 rounded-md bg-muted/50 border border-border/30 max-w-25 truncate shrink-0">
                        {edge.label}
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}