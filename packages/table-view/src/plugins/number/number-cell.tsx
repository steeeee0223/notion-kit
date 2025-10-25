"use client";

import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";
import { ProgressBar, ProgressRing } from "./common";
import type { NumberConfig } from "./types";

interface NumberCellProps {
  value: string;
  config: NumberConfig;
  wrapped?: boolean;
  onUpdate: (value: string) => void;
}

export function NumberCell({
  value,
  config,
  wrapped,
  onUpdate,
}: NumberCellProps) {
  const [, copy] = useCopyToClipboard();
  const handleUpdate = (newValue: string) => {
    if (newValue === "") return onUpdate("");
    const num = Number(newValue);
    onUpdate(isNaN(num) ? "" : String(num));
  };

  return (
    <TextInputPopover
      className="text-end"
      value={value}
      onUpdate={handleUpdate}
      renderTrigger={() => (
        <CellTrigger className="group/number-cell h-9" wrapped={wrapped}>
          <div className="pointer-events-none absolute top-1.5 right-0 left-0 z-20 mx-1 my-0 hidden justify-start group-hover/number-cell:flex">
            <div
              id="quick-action-container"
              className="pointer-events-auto sticky left-1 flex bg-transparent"
            >
              <TooltipPreset
                description="Copy to Clipboard"
                side="top"
                className="z-9990"
              >
                <Button
                  tabIndex={0}
                  aria-label="Copy to Clipboard"
                  size="xs"
                  className="rounded-md bg-main fill-secondary leading-[1.2] font-medium tracking-[0.5px] text-secondary uppercase shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copy(value);
                  }}
                >
                  <Icon.Copy className="size-3.5" />
                </Button>
              </TooltipPreset>
            </div>
          </div>
          <div
            className={cn(
              "flex justify-end gap-x-2 gap-y-1.5",
              wrapped ? "flex-wrap" : "flex-nowrap",
            )}
          >
            <NumberDisplay value={value} config={config} wrapped={wrapped} />
          </div>
        </CellTrigger>
      )}
    />
  );
}

interface NumberDisplayProps {
  value: string;
  config: NumberConfig;
  wrapped?: boolean;
}

function NumberDisplay({ value, config, wrapped }: NumberDisplayProps) {
  const [displayedValue, cappedValue] = getNumberValue(value, config);
  switch (config.showAs) {
    case "bar":
      return (
        <div
          className={cn(
            "inline-flex flex-[1_0_auto] items-center justify-end gap-x-2 gap-y-1.5 leading-[1.5]",
            wrapped ? "whitespace-pre-wrap" : "text-nowrap break-normal",
          )}
          // NO WRAP: white-space-collapse: collapse;
        >
          {config.options.showNumber && displayedValue}
          <TooltipPreset
            side="top"
            description={`${value} / ${config.options.divideBy}`}
          >
            <ProgressBar
              className="h-[21px] max-w-40 min-w-12 grow-1"
              value={cappedValue}
              color={config.options.color}
            />
          </TooltipPreset>
        </div>
      );
    case "ring":
      return (
        <div
          className={cn(
            "inline-flex flex-[1_0_auto] items-center justify-end gap-x-2 gap-y-1.5 leading-[1.5]",
            wrapped ? "whitespace-pre-wrap" : "text-nowrap break-normal",
          )}
          // NO WRAP: white-space-collapse: collapse;
        >
          {config.options.showNumber && displayedValue}
          <TooltipPreset
            side="top"
            description={`${value} / ${config.options.divideBy}`}
          >
            <span className="inline-flex">
              <ProgressRing
                value={cappedValue}
                valueMax={config.options.divideBy}
                color={config.options.color}
              />
            </span>
          </TooltipPreset>
        </div>
      );
    default:
      return (
        <div
          className={cn(
            "justify-end text-end leading-[1.5]",
            wrappedClassName(wrapped),
          )}
        >
          <div
            className={cn(
              "flex items-center justify-start gap-x-8 gap-y-1.5 leading-[1.5]",
              wrappedClassName(wrapped),
            )}
          >
            {displayedValue}
          </div>
        </div>
      );
  }
}

/**
 * @returns [displayedValue, cappedValue]
 */
function getNumberValue(value: string, config: NumberConfig): [string, number] {
  if (value === "") return ["", 0];
  const num = Number(value);
  if (isNaN(num)) return ["", 0];

  // Capped value for bar, ring display
  const cappedValue = Math.min(config.options.divideBy, Math.max(0, num));

  // Handle formatting
  const formatNumber = () => {
    // Handle rounding
    const roundDigits =
      config.round === "default" ? undefined : Number(config.round);
    const rounded =
      config.round === "default" ? num : Number(num.toFixed(roundDigits));

    switch (config.format) {
      case "number_with_commas":
        return rounded.toLocaleString(undefined, {
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });

      case "percent":
        return (
          (rounded * 100).toLocaleString(undefined, {
            minimumFractionDigits: roundDigits,
            maximumFractionDigits: roundDigits,
          }) + "%"
        );

      case "currency":
        return rounded.toLocaleString(undefined, {
          style: "currency",
          currency: "USD", // or make this configurable later
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });

      default:
        return rounded.toString();
    }
  };

  return [formatNumber(), cappedValue];
}
