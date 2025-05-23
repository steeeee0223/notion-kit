import React from "react";

import { cn } from "@notion-kit/cn";
import { buttonVariants } from "@notion-kit/shadcn";

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
        buttonVariants({ variant: "cell" }),
        "relative block min-h-8 w-full overflow-clip px-2 py-[5px]",
        wrapped && "whitespace-normal",
        className,
      )}
      {...props}
    />
  );
}
