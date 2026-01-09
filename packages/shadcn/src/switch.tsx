"use client";

import * as React from "react";
import { Switch as SwitchPrimitives } from "radix-ui";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

const switchVariants = cva(
  [
    "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-none p-0.5 transition-all outline-none",
    "focus-visible:shadow-notion disabled:cursor-not-allowed disabled:opacity-50",
    "data-[state=checked]:bg-blue data-[state=unchecked]:bg-default/15",
  ],
  {
    variants: {
      size: {
        md: "h-6 w-11 *:data-[slot='switch-thumb']:size-5",
        sm: "h-4 w-7 *:data-[slot='switch-thumb']:size-3",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type SwitchProps = React.ComponentProps<typeof SwitchPrimitives.Root> &
  VariantProps<typeof switchVariants>;

function Switch({ className, size, ...props }: SwitchProps) {
  return (
    <SwitchPrimitives.Root
      data-slot="switch"
      className={cn(switchVariants({ className, size }))}
      {...props}
    >
      <SwitchPrimitives.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitives.Root>
  );
}

export { Switch };
