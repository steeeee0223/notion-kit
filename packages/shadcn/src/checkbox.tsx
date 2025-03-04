"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cva } from "class-variance-authority";
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
  "peer shrink-0 border focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border-border-button hover:bg-primary/5 data-[state=checked]:bg-blue shadow-xs data-[state=checked]:border-none data-[state=checked]:text-white",
      },
    },
    defaultVariants: { variant: "default" },
  },
);
export interface CheckboxProps
  extends React.ComponentProps<typeof CheckboxPrimitive.Root>,
    VariantProps<typeof checkboxVariants>,
    VariantProps<typeof sizeVariants> {}

const Checkbox = ({ className, variant, size, ...props }: CheckboxProps) => (
  <CheckboxPrimitive.Root
    className={cn(
      checkboxVariants({ variant }),
      sizeVariants({ size }),
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className={cn(sizeVariants({ size }))} />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
);
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
