import React from "react";

import { cn } from "@notion-kit/cn";

interface CellTriggerProps extends React.ComponentProps<"div"> {
  wrapped?: boolean;
}

export function CellTrigger({
  className,
  wrapped,
  ...props
}: CellTriggerProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "relative block min-h-8 w-full animate-bg-in cursor-pointer overflow-clip px-2 py-[5px] text-sm select-none",
        wrapped ? "whitespace-normal" : "whitespace-nowrap",
        className,
      )}
      {...props}
    />
  );
}
