"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@notion-kit/cn";

const sizeVariants = cva("", {
  variants: {
    size: {
      md: "size-4",
      sm: "size-[14px]",
      xs: "size-[13px] rounded-[2px]",
    },
  },
  defaultVariants: { size: "md" },
});

const checkboxVariants = cva(
  "peer shrink-0 border border-border-button shadow-xs hover:bg-default/5 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-none data-[state=checked]:bg-blue data-[state=checked]:text-white",
);

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof sizeVariants> {}

const Checkbox = ({ className, size, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(checkboxVariants(), sizeVariants({ size }), className)}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className={cn(sizeVariants({ size }))} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
