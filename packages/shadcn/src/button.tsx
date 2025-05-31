"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@notion-kit/cn";

import { buttonVariants, type ButtonVariants } from "./variants";

export interface ButtonProps
  extends React.ComponentProps<"button">,
    ButtonVariants {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button };
