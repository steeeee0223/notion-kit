"use client";

import * as React from "react";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";

import { Button, TooltipPreset } from "@/primitives";

export interface DescriptionListProps extends React.ComponentProps<"dl"> {
  /**
   * `"horizontal"` puts the label and value on the same row from `sm` up;
   * `"stacked"` always stacks them.
   * @default "horizontal"
   */
  layout?: "horizontal" | "stacked";
}

/**
 * A list of key/value rows. Compose with `DescriptionItem` children.
 */
function DescriptionList({
  layout = "horizontal",
  className,
  ...props
}: DescriptionListProps) {
  return (
    <dl
      data-slot="description-list"
      data-layout={layout}
      className={cn(
        "flex flex-col divide-y divide-border text-sm",
        layout === "horizontal" &&
          "*:data-[slot=description-item]:sm:flex-row *:data-[slot=description-item]:sm:items-baseline *:data-[slot=description-item]:sm:justify-between",
        className,
      )}
      {...props}
    />
  );
}

export interface DescriptionItemProps extends React.ComponentProps<"div"> {
  label: React.ReactNode;
  value: React.ReactNode;
  /** Renders `value` in a monospace font. */
  mono?: boolean;
  /**
   * The plain-text value to copy. Providing this shows a copy-to-clipboard
   * button next to the value.
   */
  copyValue?: string;
}

/**
 * A single label/value row inside a `DescriptionList`.
 */
function DescriptionItem({
  label,
  value,
  mono,
  copyValue,
  className,
  ...props
}: DescriptionItemProps) {
  const [copied, setCopied] = React.useState(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  React.useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const handleCopy = async () => {
    if (!copyValue) return;
    await navigator.clipboard.writeText(copyValue);
    setCopied(true);
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      data-slot="description-item"
      className={cn("flex flex-col gap-1 py-2", className)}
      {...props}
    >
      <dt className="text-muted">{label}</dt>
      <dd
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-primary",
          mono && "font-mono text-xs",
        )}
      >
        <span className="truncate">{value}</span>
        {copyValue && (
          <TooltipPreset description={copied ? "Copied" : "Copy"}>
            <Button
              variant="hint"
              aria-label="Copy value"
              className="size-6 shrink-0 rounded-full hover:bg-default/10"
              onClick={handleCopy}
            >
              {copied ? (
                <Icon.Check className="size-3.5" />
              ) : (
                <Icon.Copy className="size-3.5" />
              )}
            </Button>
          </TooltipPreset>
        )}
      </dd>
    </div>
  );
}

export { DescriptionList, DescriptionItem };
