import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button } from "@notion-kit/ui/primitives";

import { Code } from "@/components/code";

export function DefaultExample() {
  const { ref, rect } = useRect();
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex w-80 flex-col gap-4">
      <Button
        ref={ref}
        aria-label="Expand measurement area"
        aria-expanded={expanded}
        className={cn(
          "flex h-30 w-full items-center justify-center rounded-md border-2 border-blue bg-blue/15 transition-[height]",
          expanded && "h-60",
        )}
        onClick={() => setExpanded((v) => !v)}
      >
        <Icon.Chevron
          side={expanded ? "down" : "right"}
          className="size-8 fill-primary transition-[rotate]"
        />
      </Button>
      <Code codeObject={rect} />
    </div>
  );
}
