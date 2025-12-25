import { ActionSectionProps } from "./types";

export function ActionSection({ icon: Icon, title, children }: ActionSectionProps) {
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
        <Icon className="w-4 h-4 text-muted-foreground" />
        {title}
      </h3>
      {children}
    </div>
  );
}