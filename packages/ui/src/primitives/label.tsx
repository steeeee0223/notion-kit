"use client";

import * as React from "react";
import { Label as LabelPrimitive } from "radix-ui";

import { cn, cva } from "@notion-kit/cn";

import { typography } from "./variants";

const labelVariants = cva(
  "text-secondary peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(typography("label"), labelVariants(), className)}
      {...props}
    />
  );
}

export { Label };
