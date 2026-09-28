import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Skeleton } from "@/primitives";

const statCardVariants = cva(
  "flex flex-col gap-3 rounded-lg border border-border bg-transparent p-4",
  {
    variants: {
      interactive: {
        true: "cursor-pointer transition-colors hover:bg-default/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden",
      },
    },
    defaultVariants: { interactive: false },
  },
);

const deltaVariants = cva(
  "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
  {
    variants: {
      tone: {
        good: "text-green",
        bad: "text-red",
        neutral: "text-muted",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type StatCardDeltaDirection = "up" | "down" | "flat";

export interface StatCardDelta {
  /** The rendered delta value, e.g. `"+12.4%"` or `"-3 this week"`. */
  value: React.ReactNode;
  /** Which way the value moved. */
  direction: StatCardDeltaDirection;
  /**
   * Whether an `"up"` direction should be colored as a good outcome.
   * Set to `false` when a decrease is the desired outcome (e.g. churn).
   * @default true
   */
  positiveIsGood?: boolean;
}

export interface StatCardProps
  extends Omit<useRender.ComponentProps<"div">, "children">,
    VariantProps<typeof statCardVariants> {
  /** The KPI label, e.g. `"Monthly revenue"`. */
  label: React.ReactNode;
  /**
   * The KPI value. Pass a `number` with `format` to render a formatted
   * string, or any `ReactNode` to render it directly.
   */
  value: React.ReactNode;
  /** Formats a numeric `value` into a display string. */
  format?: (value: number) => string;
  /** An optional up/down/flat delta shown next to the value. */
  delta?: StatCardDelta;
  /** Supporting text below the value, e.g. `"vs. last month"`. */
  caption?: React.ReactNode;
  /** The period the value covers, e.g. `"Jan 1 – Jan 31"`. */
  period?: React.ReactNode;
  /** A chart slot, typically a `Sparkline`. */
  chart?: React.ReactNode;
  /** Navigates to a URL; renders the card as an anchor. */
  href?: string;
  /** Shows a skeleton in place of the label/value/delta. */
  loading?: boolean;
}

function DeltaIndicator({
  value,
  direction,
  positiveIsGood = true,
}: StatCardDelta) {
  const tone =
    direction === "flat"
      ? "neutral"
      : (direction === "up") === positiveIsGood
        ? "good"
        : "bad";
  return (
    <span className={cn(deltaVariants({ tone }))}>
      {direction === "up" && <Icon.ArrowUp className="size-3" />}
      {direction === "down" && <Icon.ArrowDown className="size-3" />}
      {direction === "flat" && <Icon.Minus className="size-3" />}
      {value}
    </span>
  );
}

/**
 * A KPI tile: a label, a large tabular-nums value, and optional delta,
 * caption, period, and chart slot. Pass `href` or `onClick` to make it
 * interactive.
 */
function StatCard({
  className,
  interactive,
  label,
  value,
  format,
  delta,
  caption,
  period,
  chart,
  href,
  loading,
  render,
  ...props
}: StatCardProps) {
  const isInteractive = interactive ?? Boolean(href ?? props.onClick);
  const displayValue =
    typeof value === "number" && format ? format(value) : value;

  return useRender({
    defaultTagName: href ? "a" : isInteractive ? "button" : "div",
    render,
    props: mergeProps(
      {
        "data-slot": "stat-card",
        "data-loading": loading ? "" : undefined,
        href,
        type: !href && isInteractive ? "button" : undefined,
        className: cn(
          statCardVariants({ interactive: isInteractive, className }),
        ),
      },
      props,
      {
        children: loading ? (
          <StatCardSkeleton />
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm text-muted">{label}</span>
              {period && (
                <span className="shrink-0 text-xs text-muted">{period}</span>
              )}
            </div>
            <div className="flex items-end justify-between gap-3">
              <span className="text-2xl/tight font-semibold text-primary tabular-nums">
                {displayValue}
              </span>
              {chart && (
                <div className="h-8 w-20 shrink-0 text-secondary">{chart}</div>
              )}
            </div>
            {(delta ?? caption) && (
              <div className="flex items-center gap-2">
                {delta && <DeltaIndicator {...delta} />}
                {caption && (
                  <span className="text-xs text-muted">{caption}</span>
                )}
              </div>
            )}
          </>
        ),
      },
    ),
  });
}

function StatCardSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-3 w-20" />
    </>
  );
}

export { StatCard, statCardVariants };
