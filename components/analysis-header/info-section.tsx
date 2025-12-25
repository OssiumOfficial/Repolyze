import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { InfoSectionProps } from "./types";
import { ACCENT_COLOR_CLASSES } from "./constants";

export function InfoSection({
  icon: Icon,
  title,
  description,
  accentColor = "primary",
  count,
  isHighlighted = false,
  children,
}: InfoSectionProps) {
  const colors = ACCENT_COLOR_CLASSES[accentColor];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="pt-4 first:pt-0"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("p-1.5 rounded-md", colors.iconBg)}>
          <Icon className={cn("w-3.5 h-3.5", colors.iconText)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{title}</span>
            {count !== undefined && (
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                {count}
              </Badge>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground hidden sm:block">
            {description}
          </p>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          "p-3 sm:p-4 rounded-lg border",
          isHighlighted ? colors.bg : "bg-muted/10",
          isHighlighted ? colors.border : "border-border/40"
        )}
      >
        {children}
      </div>
    </motion.div>
  );
}