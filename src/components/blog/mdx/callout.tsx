import type { ReactNode } from "react";
import { InfoIcon, TriangleAlertIcon, LightbulbIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type CalloutType = "info" | "warn" | "tip";

const CONFIG: Record<
  CalloutType,
  { Icon: typeof InfoIcon; className: string; label: string }
> = {
  info: {
    Icon: InfoIcon,
    className: "border-primary/30 bg-muted",
    label: "정보",
  },
  warn: {
    Icon: TriangleAlertIcon,
    className: "border-destructive/40 bg-destructive/10",
    label: "주의",
  },
  tip: {
    Icon: LightbulbIcon,
    className: "border-primary/30 bg-accent",
    label: "팁",
  },
};

export function Callout({
  type = "info",
  children,
}: {
  type?: CalloutType;
  children: ReactNode;
}) {
  const { Icon, className, label } = CONFIG[type];
  return (
    <div
      role="note"
      aria-label={label}
      className={cn(
        "not-prose my-6 flex gap-3 rounded-lg border p-4 text-sm leading-relaxed",
        className,
      )}
    >
      <Icon className="text-muted-foreground mt-0.5 size-5 shrink-0" />
      <div className="[&>p]:m-0 [&>p+p]:mt-2">{children}</div>
    </div>
  );
}
