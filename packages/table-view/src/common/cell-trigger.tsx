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
        "relative block min-h-9 w-full overflow-clip px-2 py-[7.5px] text-sm/[1.5]",
        wrapped && "whitespace-normal",
        className,
      )}
      {...props}
    />
  );
}
