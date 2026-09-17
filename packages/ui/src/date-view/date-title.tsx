import type { ComponentProps } from "react";

import { cn } from "@notion-kit/cn";

export function DateTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "inline-flex h-8 items-center text-sm font-medium text-primary",
        className,
      )}
      {...props}
    />
  );
}
