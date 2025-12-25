import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EmptyStateProps } from "./types";

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <Card className="border-border/50 bg-muted/20">
      <CardContent className="py-12 sm:py-16 lg:py-20">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <div
            className={cn(
              "w-14 h-14 rounded-xl mb-5",
              "bg-muted border border-border/50",
              "flex items-center justify-center"
            )}
          >
            <Icon className="w-6 h-6 text-muted-foreground/50" />
          </div>
          <h3 className="text-sm font-medium text-foreground mb-1.5">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}