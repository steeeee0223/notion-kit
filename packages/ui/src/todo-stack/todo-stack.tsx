import * as React from "react";

import { cn, cva, type VariantProps } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Badge, Button } from "@/primitives";

export interface TodoStackProps extends Omit<React.ComponentProps<"div">, "title"> {
  /** The list heading, e.g. `"To-dos"`. */
  title?: React.ReactNode;
  /** A count shown next to the title, e.g. the number of open items. */
  count?: number;
  /** Content shown when there are no `TodoItem` children. */
  empty?: React.ReactNode;
}

/**
 * A Ramp-style action list. Compose with `TodoItem` children; shows an
 * "all done" empty state when there are none.
 */
function TodoStack({ title, count, empty, className, children, ...props }: TodoStackProps) {
  const hasItems = React.Children.count(children) > 0;

  return (
    <div data-slot="todo-stack" className={cn("flex flex-col", className)} {...props}>
      {(title ?? count !== undefined) && (
        <div className="flex items-center justify-between gap-2 pb-2">
          {title && <h3 className="text-sm font-semibold text-primary">{title}</h3>}
          {count !== undefined && (
            <span className="text-xs text-muted tabular-nums">{count}</span>
          )}
        </div>
      )}
      {hasItems ? (
        <div className="flex flex-col divide-y divide-border">{children}</div>
      ) : (
        (empty ?? <TodoStackEmpty />)
      )}
    </div>
  );
}

function TodoStackEmpty() {
  return (
    <div
      data-slot="todo-stack-empty"
      className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center"
    >
      <Icon.CheckmarkCircle className="size-5 text-green" />
      <p className="text-sm text-muted">All done</p>
    </div>
  );
}

const toneVariants = cva("", {
  variants: {
    tone: {
      neutral: "text-icon",
      info: "text-blue",
      warning: "text-orange",
      danger: "text-red",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export interface TodoItemProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof toneVariants> {
  /** An icon rendered before the title, typically from `@notion-kit/icons`. */
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** A trailing count/badge, e.g. the number of affected records. */
  count?: number;
  /** The primary action, e.g. `<Button render={<a href="..." />}>Review</Button>`. */
  action?: React.ReactNode;
  /** Shows a dismiss button; call `onDismiss` to handle it. */
  dismissible?: boolean;
  onDismiss?: () => void;
}

/**
 * A single row inside a `TodoStack`.
 */
function TodoItem({
  icon,
  tone,
  title,
  description,
  count,
  action,
  dismissible,
  onDismiss,
  className,
  ...props
}: TodoItemProps) {
  return (
    <div
      data-slot="todo-item"
      className={cn("flex items-start gap-3 py-3 first:pt-0 last:pb-0", className)}
      {...props}
    >
      {icon && <span className={cn("mt-0.5 shrink-0", toneVariants({ tone }))}>{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-primary">{title}</p>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {count !== undefined && (
        <Badge variant="gray" className="shrink-0 tabular-nums">
          {count}
        </Badge>
      )}
      {action}
      {dismissible && (
        <Button
          variant="hint"
          aria-label="Dismiss"
          className="size-6 shrink-0 rounded-full hover:bg-default/10"
          onClick={onDismiss}
        >
          <Icon.Close className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

export { TodoStack, TodoItem, TodoStackEmpty };
