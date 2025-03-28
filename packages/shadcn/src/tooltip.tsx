"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

const TooltipProvider = TooltipPrimitive.Provider;

type TooltipProps = TooltipPrimitive.TooltipProps;
const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const tooltipVariants = cva("max-w-[220px] font-medium break-words", {
  variants: {
    size: {
      sm: "rounded-sm px-2 py-1 text-xs/[1.4]",
      md: "rounded-md px-3 py-1.5 text-sm",
    },
  },
  defaultVariants: { size: "sm" },
});

type TooltipContentProps = React.ComponentProps<
  typeof TooltipPrimitive.Content
> &
  VariantProps<typeof tooltipVariants>;

const TooltipContent = ({
  className,
  size,
  sideOffset = 4,
  ...props
}: TooltipContentProps) => (
  <TooltipPrimitive.Content
    sideOffset={sideOffset}
    className={cn(
      contentVariants({ variant: "tooltip" }),
      tooltipVariants({ size }),
      className,
    )}
    {...props}
  />
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

export type { TooltipProps, TooltipContentProps };
