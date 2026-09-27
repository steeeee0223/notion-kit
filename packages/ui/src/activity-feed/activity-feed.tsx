import * as React from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";

export type ActivityFeedProps = React.ComponentProps<"div">;

/**
 * A vertical timeline. Compose with `ActivityItem` children; the connecting
 * line and `isLast` state are computed automatically.
 */
function ActivityFeed({ className, children, ...props }: ActivityFeedProps) {
  const items = React.Children.toArray(children);

  return (
    <div data-slot="activity-feed" role="list" className={cn("flex flex-col", className)} {...props}>
      {items.map((child, index) =>
        React.isValidElement<ActivityItemProps>(child)
          ? React.cloneElement(child, {
              key: child.key ?? index,
              isLast: child.props.isLast ?? index === items.length - 1,
            })
          : child,
      )}
    </div>
  );
}

const toneDotVariants = cva("size-2 rounded-full", {
  variants: {
    tone: {
      neutral: "bg-icon",
      info: "bg-blue",
      warning: "bg-orange",
      danger: "bg-red",
      success: "bg-green",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface ActivityItemProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof toneDotVariants> {
  /** An icon or avatar rendered in the timeline marker; defaults to a tone dot. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A timestamp slot rendered next to the title. */
  timestamp?: React.ReactNode;
  /** Hides the connecting line below this item. Computed by `ActivityFeed`. */
  isLast?: boolean;
}

/**
 * A single event inside an `ActivityFeed`.
 */
function ActivityItem({
  icon,
  tone,
  title,
  description,
  timestamp,
  isLast,
  className,
  ...props
}: ActivityItemProps) {
  return (
    <div
      data-slot="activity-item"
      role="listitem"
      className={cn("relative flex gap-3 pb-6 last:pb-0", className)}
      {...props}
    >
      <div className="relative flex flex-col items-center">
        <span className="z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-main ring-1 ring-border">
          {icon ?? <span className={cn(toneDotVariants({ tone }))} />}
        </span>
        {!isLast && (
          <span aria-hidden="true" className="absolute top-6 bottom-0 w-px bg-border" />
        )}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <p className="text-sm font-medium text-primary">{title}</p>
          {timestamp && <span className="shrink-0 text-xs text-muted">{timestamp}</span>}
        </div>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
    </div>
  );
}

export { ActivityFeed, ActivityItem };
