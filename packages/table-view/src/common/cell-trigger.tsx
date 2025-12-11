import React from "react";

import { cn } from "@notion-kit/cn";
import { buttonVariants } from "@notion-kit/shadcn";

import type { LayoutType } from "../features";

interface CellTriggerProps extends React.ComponentProps<"div"> {
  wrapped?: boolean;
  layout?: LayoutType;
}

export function CellTrigger({
  className,
  wrapped,
  layout = "table",
  ...props
}: CellTriggerProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        buttonVariants({ variant: "cell" }),
        "relative px-2",
        layout === "table" &&
          "block min-h-9 w-full overflow-clip py-[7.5px] text-sm/normal",
        "aria-disabled:pointer-events-none",
        layout === "list" &&
          "min-h-[30px] flex-none overflow-hidden rounded-md",
        layout === "board" &&
          "min-h-7 flex-none overflow-hidden rounded-md px-1",
        wrapped && "whitespace-normal",
        className,
      )}
      onPointerDown={(e) => e.stopPropagation()}
      {...props}
    />
  );
}
