"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@notion-kit/cn";

const switchVariants = cva(
  "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-main focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-blue data-[state=unchecked]:bg-default/15",
  {
    variants: {
      size: {
        md: "h-6 w-11",
        sm: "h-4 w-7",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
  {
    variants: {
      size: {
        md: "h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0",
        sm: "h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitives.Root> &
  VariantProps<typeof switchVariants>;

const Switch = ({ className, size, ...props }: SwitchProps) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ className, size }))}
    {...props}
  >
    <SwitchPrimitives.Thumb className={cn(thumbVariants({ size }))} />
  </SwitchPrimitives.Root>
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
