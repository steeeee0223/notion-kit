"use client";

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@notion-kit/cn";

import { contentVariants } from "./variants";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverClose = PopoverPrimitive.Close;

type PopoverContentProps = React.ComponentProps<
  typeof PopoverPrimitive.Content
> & {
  container?: Element | DocumentFragment | null;
};
const PopoverContent = ({
  className,
  align = "center",
  sideOffset = 4,
  container,
  ...props
}: PopoverContentProps) => (
  <PopoverPrimitive.Portal container={container}>
    <PopoverPrimitive.Content
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "w-72 p-0 outline-hidden",
        contentVariants({ variant: "popover" }),
        className,
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverClose, PopoverContent };
