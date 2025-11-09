"use client";

import { cn } from "@notion-kit/cn";
import { TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
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
          <CopyButton
            className="hidden justify-start group-hover/number-cell:flex"
            value={value}
          />
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
            "inline-flex flex-[1_0_auto] items-center justify-end gap-x-2 gap-y-1.5 leading-normal",
            wrapped ? "whitespace-pre-wrap" : "text-nowrap break-normal",
          )}
          // NO WRAP: white-space-collapse: collapse;
        >
          {config.options.showNumber && displayedValue}
          <TooltipPreset
            side="top"
            description={`${value || 0} / ${config.options.divideBy}`}
          >
            <span className="inline-flex w-24">
              <ProgressBar
                className="h-[21px] max-w-40 min-w-12 grow"
                value={cappedValue}
                color={config.options.color}
              />
            </span>
          </TooltipPreset>
        </div>
      );
    case "ring":
      return (
        <div
          className={cn(
            "inline-flex flex-[1_0_auto] items-center justify-end gap-x-2 gap-y-1.5 leading-normal",
            wrapped ? "whitespace-pre-wrap" : "text-nowrap break-normal",
          )}
          // NO WRAP: white-space-collapse: collapse;
        >
          {config.options.showNumber && displayedValue}
          <TooltipPreset
            side="top"
            description={`${value || 0} / ${config.options.divideBy}`}
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
            "justify-end text-end leading-normal",
            wrappedClassName(wrapped),
          )}
        >
          <div
            className={cn(
              "flex items-center justify-start gap-x-8 gap-y-1.5 leading-normal",
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
    // const rounded =
    //   config.round === "default" ? num : Number(num.toFixed(roundDigits));

    switch (config.format) {
      case "number_with_commas":
        return num.toLocaleString(undefined, {
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });

      case "percent":
        return num.toLocaleString(undefined, {
          style: "percent",
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });

      case "currency":
        return num.toLocaleString(undefined, {
          style: "currency",
          currency: "USD", // or make this configurable later
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });

      default:
        return num.toLocaleString(undefined, {
          useGrouping: false,
          minimumFractionDigits: roundDigits,
          maximumFractionDigits: roundDigits,
        });
    }
  };

  return [formatNumber(), cappedValue];
}
