import * as React from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

const badgeVariants = cva(
  "inline-flex items-center border transition-colors focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-white hover:bg-default/80",
        gray: "border-transparent bg-[#cecdca]/50 text-secondary dark:bg-default/5",
        blue: "border-none bg-blue/10 text-blue",
        orange: "border-none bg-[#f6c05042] font-normal text-orange",
        tag: "truncate border-none bg-[#cecdca]/50 text-primary",
      },
      size: {
        md: "rounded-full px-2.5 py-0.5 text-xs font-semibold",
        sm: "rounded-sm px-1.5 text-[9px]/none font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
