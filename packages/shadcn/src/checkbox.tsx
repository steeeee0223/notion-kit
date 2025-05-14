"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "@notion-kit/cn";

const checkboxVariants = cva(
  [
    "peer shrink-0 border border-border-button shadow-xs outline-none hover:bg-default/5",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:border-none data-[state=checked]:bg-blue data-[state=checked]:text-white",
  ],
  {
    variants: {
      size: {
        md: "size-4",
        sm: "size-[14px]",
        xs: "size-[13px] rounded-[2px]",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants> {}

const Checkbox = ({ className, size, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    data-slot="checkbox"
    className={cn(checkboxVariants({ size, className }))}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      data-slot="checkbox-indicator"
      className="flex items-center justify-center"
    >
      <Check className="size-full" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);

export { Checkbox };
