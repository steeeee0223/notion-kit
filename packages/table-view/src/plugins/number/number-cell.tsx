import type { OnChangeFn } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import {
  formatNumber,
  type CellValueProps,
  type NumberConfig,
} from "@notion-kit/table-hook/plugins";
import { MeterBar, MeterRing, TooltipPreset } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

import { TextInputPopoverContent } from "@/common";

export function NumberCellValue({
  data,
  config,
  wrapped,
}: CellValueProps<string | null, NumberConfig>) {
  if (data === null) return null;
  return (
    <div
      className={cn(
        "flex justify-end gap-x-2 gap-y-1.5",
        wrapped ? "flex-wrap" : "flex-nowrap",
      )}
    >
      <NumberDisplay value={data} config={config} wrapped={wrapped} />
    </div>
  );
}

interface NumberCellEditorProps {
  data: string | null;
  onChange: OnChangeFn<string | null>;
  onCancel?: () => void;
  commitOnUnchanged?: boolean;
}

export function NumberCellEditor({
  data,
  onChange,
  onCancel,
  commitOnUnchanged,
}: NumberCellEditorProps) {
  const handleUpdate = (newValue: string) => {
    if (newValue === "") return onChange(null);
    const number = Number(newValue);
    onChange(Number.isNaN(number) ? null : String(number));
  };

  return (
    <TextInputPopoverContent
      className="text-end"
      value={data ?? ""}
      onUpdate={handleUpdate}
      onCancel={onCancel}
      commitOnUnchanged={commitOnUnchanged}
    />
  );
}

interface NumberDisplayProps {
  value: string | null;
  config: NumberConfig;
  wrapped?: boolean;
}

function NumberDisplay({ value, config, wrapped }: NumberDisplayProps) {
  const [displayedValue, cappedValue] = getNumberValue(value ?? "", config);

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
          {value !== null && (
            <TooltipPreset
              side="top"
              description={`${value} / ${config.options.divideBy}`}
            >
              <span className="inline-flex w-24">
                <MeterBar
                  className="h-[21px] max-w-40 min-w-12 grow"
                  value={cappedValue}
                  max={config.options.divideBy}
                  trackColor={COLOR[config.options.color].hex}
                />
              </span>
            </TooltipPreset>
          )}
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
          {value !== null && (
            <TooltipPreset
              side="top"
              description={`${value} / ${config.options.divideBy}`}
            >
              <span className="inline-flex">
                <MeterRing
                  value={cappedValue}
                  max={config.options.divideBy}
                  trackColor={COLOR[config.options.color].hex}
                />
              </span>
            </TooltipPreset>
          )}
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
function getNumberValue(
  value: string | null,
  config: NumberConfig,
): [string, number] {
  if (!value) return ["", 0];
  const num = Number(value);
  if (isNaN(num)) return ["", 0];

  // Capped value for bar, ring display
  const cappedValue = Math.min(config.options.divideBy, Math.max(0, num));

  return [formatNumber(num, config), cappedValue];
}
