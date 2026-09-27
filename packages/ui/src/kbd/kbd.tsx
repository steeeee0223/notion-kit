import * as React from "react";

import { cn } from "@notion-kit/cn";

export type KbdProps = React.ComponentProps<"kbd">;

/**
 * A keyboard hint chip, e.g. `<Kbd>⌘</Kbd>`.
 */
function Kbd({ className, ...props }: KbdProps) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-sm border border-border-button bg-default/5 px-1 font-mono text-[11px] font-medium text-secondary",
        className,
      )}
      {...props}
    />
  );
}

export type KbdGroupProps = React.ComponentProps<"span">;

/**
 * Groups `Kbd` chips for a chord or sequence, e.g. `⌘` + `K`.
 */
function KbdGroup({ className, ...props }: KbdGroupProps) {
  return (
    <span
      data-slot="kbd-group"
      role="group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
