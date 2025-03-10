import type { VariantProps } from "class-variance-authority";
import React from "react";
import { cva } from "class-variance-authority";
import { Loader, LoaderCircle } from "lucide-react";

import { cn } from "@notion-kit/cn";

const spinnerVariants = cva("text-muted dark:text-muted-dark animate-spin", {
  variants: {
    size: {
      sm: "h-2 w-2",
      md: "h-4 w-4",
      lg: "h-6 w-6",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface SpinnerProps extends VariantProps<typeof spinnerVariants> {
  className?: string;
  variants?: "solid" | "dashed";
}

export const Spinner: React.FC<SpinnerProps> = ({
  className,
  size,
  variants,
}) => {
  const Icon = variants === "dashed" ? Loader : LoaderCircle;
  return (
    <Icon
      className={cn(spinnerVariants({ size, className }))}
      aria-label="spinner"
    />
  );
};
