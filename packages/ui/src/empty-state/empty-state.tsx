import * as React from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center",
  {
    variants: {
      size: {
        sm: "gap-2 py-6",
        md: "gap-3 py-12",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export interface EmptyStateProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Buttons or links shown below the description. */
  actions?: React.ReactNode;
}

/**
 * A placeholder for a list, panel, or page with nothing to show yet.
 */
function EmptyState({
  icon,
  title,
  description,
  actions,
  size,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ size, className }))}
      {...props}
    >
      {icon && (
        <div className={cn("text-icon", size === "sm" ? "size-8" : "size-12")}>
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p
          className={cn(
            "font-semibold text-primary",
            size === "sm" ? "text-sm" : "text-base",
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn("text-muted", size === "sm" ? "text-xs" : "text-sm")}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export { EmptyState, emptyStateVariants };
