import type React from "react";

import { cn } from "@notion-kit/cn";
import { Badge } from "@notion-kit/ui/primitives";
import { COLOR, type Color } from "@notion-kit/utils";

interface OptionTagProps
  extends Omit<React.ComponentProps<typeof Badge>, "children" | "color"> {
  name: string;
  color: Color;
}

export function OptionTag({
  name,
  color,
  className,
  style,
  ...props
}: OptionTagProps) {
  return (
    <Badge
      {...props}
      variant="tag"
      size="sm"
      className={cn("h-5 max-w-full min-w-0 shrink-0 text-sm/5", className)}
      style={{ backgroundColor: COLOR[color].rgba, ...style }}
    >
      <span className="truncate">{name}</span>
    </Badge>
  );
}
