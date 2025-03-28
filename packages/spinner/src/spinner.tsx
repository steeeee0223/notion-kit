import React from "react";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { Loader, LoaderCircle } from "lucide-react";

import { cn } from "@notion-kit/cn";

const spinnerVariants = cva("animate-spin text-muted", {
  variants: {
    size: {
      sm: "size-2",
      md: "size-4",
      lg: "size-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  variant?: "solid" | "dashed";
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size,
  variant,
}) => {
  const Icon = variant === "dashed" ? Loader : LoaderCircle;
  return (
    <Icon
      className={cn(spinnerVariants({ size, className }))}
      aria-label="spinner"
    />
  );
};
