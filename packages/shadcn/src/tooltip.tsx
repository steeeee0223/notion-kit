"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

function TooltipProvider({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />;
}

type TooltipProps = React.ComponentProps<typeof TooltipPrimitive.Root>;
function Tooltip({ ...props }: TooltipProps) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

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
function TooltipContent({
  className,
  size,
  sideOffset = 4,
  ...props
}: TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          contentVariants({ variant: "tooltip", sideAnimation: true }),
          tooltipVariants({ size }),
          className,
        )}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}

interface Description {
  type: "default" | "secondary";
  text: string;
}

interface TooltipPresetProps extends TooltipContentProps {
  children: React.ReactNode;
  description: string | Description[];
  disabled?: boolean;
}

function TooltipPreset({
  children,
  description,
  disabled,
  side = "bottom",
  ...props
}: TooltipPresetProps) {
  const body =
    typeof description === "string"
      ? description
      : description.map((desc, i) => <TooltipDescription key={i} {...desc} />);

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      {!disabled && (
        <TooltipContent side={side} {...props}>
          {body}
        </TooltipContent>
      )}
    </Tooltip>
  );
}

const TooltipDescription: React.FC<Description> = ({ type, text }) => {
  switch (type) {
    case "secondary":
      return <span className="text-tooltip-secondary">{text}</span>;
    default:
      return <div>{text}</div>;
  }
};

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPreset,
};

export type {
  TooltipProps,
  TooltipContentProps,
  TooltipPresetProps,
  Description,
};
