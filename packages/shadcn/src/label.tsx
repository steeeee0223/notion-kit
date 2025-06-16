"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";

import { cn } from "@notion-kit/cn";

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
