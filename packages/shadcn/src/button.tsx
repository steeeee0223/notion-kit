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

const Button = ({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
};
Button.displayName = "Button";

export { Button };
