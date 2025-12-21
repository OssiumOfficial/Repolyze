"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Monitor,
  Server,
  Database,
  Cloud,
  Cog,
  Globe,
  ChevronDown,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArchitectureComponent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ArchitectureDiagramProps {
  components: ArchitectureComponent[];
}

const typeConfig = {
  frontend: {
    icon: Monitor,
    label: "Frontend",
  },
  backend: {
    icon: Server,
    label: "Backend",
  },
  database: {
    icon: Database,
    label: "Database",
  },
  service: {
    icon: Cog,
    label: "Services",
  },
  external: {
    icon: Cloud,
    label: "External",
  },
  middleware: {
    icon: Globe,
    label: "Middleware",
  },
} as const;

const layerOrder = [
  "frontend",
  "middleware",
  "backend",
  "service",
  "database",
  "external",
];

export function ArchitectureDiagram({ components }: ArchitectureDiagramProps) {
  const groupedComponents = useMemo(() => {
    const groups: Record<string, ArchitectureComponent[]> = {};
    layerOrder.forEach((type) => (groups[type] = []));

    components.forEach((comp) => {
      if (groups[comp.type]) {
        groups[comp.type].push(comp);
      }
    });

    return groups;
  }, [components]);

  const activeLayers = layerOrder.filter(
    (layer) => groupedComponents[layer]?.length > 0
  );

  if (activeLayers.length === 0) {
    return (
      <Card className="border-border/60">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <p className="text-sm text-muted-foreground">
              No architecture data available
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
            <Layers className="w-4 h-4 text-primary" />
            Architecture Overview
          </CardTitle>
          <span className="text-xs text-muted-foreground tabular-nums">
            {components.length} components · {activeLayers.length} layers
          </span>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4">
        <div className="space-y-1">
          {activeLayers.map((layer, layerIndex) => {
            const config = typeConfig[layer as keyof typeof typeConfig];
            const Icon = config?.icon || Cog;
            const layerComponents = groupedComponents[layer];

            return (
              <div key={layer}>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: layerIndex * 0.05 }}
                  className="space-y-3"
                >
                  {/* Layer Header */}
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-muted/60">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {config?.label || layer}
                      </span>
                      <span className="text-xs text-muted-foreground/60 tabular-nums">
                        ({layerComponents.length})
                      </span>
                    </div>
                    <div className="flex-1 h-px bg-border/50" />
                  </div>

                  {/* Components Grid */}
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 ml-9">
                    {layerComponents.map((component, index) => (
                      <motion.div
                        key={component.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                          delay: layerIndex * 0.05 + index * 0.02,
                        }}
                        className={cn(
                          "group p-3 rounded-lg border border-border/50",
                          "bg-muted/20 hover:bg-muted/40",
                          "transition-colors cursor-default"
                        )}
                      >
                        {/* Component Name */}
                        <h4 className="text-sm font-medium text-foreground mb-1 truncate">
                          {component.name}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5 min-h-10">
                          {component.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1">
                          {component.technologies.slice(0, 3).map((tech) => (
                            <span
                              key={tech}
                              className={cn(
                                "text-[10px] font-medium px-1.5 py-0.5 rounded",
                                "bg-background border border-border/50",
                                "text-muted-foreground"
                              )}
                            >
                              {tech}
                            </span>
                          ))}
                          {component.technologies.length > 3 && (
                            <span className="text-[10px] text-muted-foreground/50 self-center">
                              +{component.technologies.length - 3}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Connector */}
                {layerIndex < activeLayers.length - 1 && (
                  <div className="flex items-center gap-3 py-3 ml-2.5">
                    <div className="w-px h-4 bg-border/60" />
                    <ChevronDown className="w-3 h-3 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}