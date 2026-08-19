import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import {
  formatNumber,
  type CellEditorProps,
  type CellValueProps,
  type NumberConfig,
} from "@notion-kit/table-hook/plugins";
import { MeterBar, MeterRing, TooltipPreset } from "@notion-kit/ui/primitives";
import { COLOR } from "@notion-kit/utils";

import { CellTrigger, CopyButton, TextInputPopoverContent } from "@/common";

export function NumberCellValue({
  data,
  config,
  wrapped,
  disabled,
  layout,
  tooltip,
  onClick,
}: CellValueProps<string | null, NumberConfig>) {
  const value = data ?? "";

  if (layout !== "table" && layout !== "row-view" && data === null) return null;
  return (
    <CellTrigger
      className={cn("group/number-cell", layout === "table" && "h-9")}
      wrapped={wrapped}
      aria-disabled={disabled}
      layout={layout}
      widthType="number"
      tooltip={tooltip}
      onClick={onClick}
    >
      {layout === "table" && (
        <CopyButton
          className="hidden justify-start group-hover/number-cell:flex"
          value={value}
        />
      )}
      <div
        className={cn(
          "flex justify-end gap-x-2 gap-y-1.5",
          wrapped ? "flex-wrap" : "flex-nowrap",
        )}
      >
        <NumberDisplay
          view={layout}
          value={data}
          config={config}
          wrapped={wrapped}
        />
      </div>
    </CellTrigger>
  );
}

export function NumberCellEditor({
  data,
  onChange,
  onCancel,
}: CellEditorProps<string | null, NumberConfig>) {
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
    />
  );
}

interface NumberDisplayProps {
  view: CellValueProps<string | null, NumberConfig>["layout"];
  value: string | null;
  config: NumberConfig;
  wrapped?: boolean;
}

function NumberDisplay({ view, value, config, wrapped }: NumberDisplayProps) {
  const [displayedValue, cappedValue] = getNumberValue(value ?? "", config);

  if (view === "row-view" && !displayedValue) {
    return <span className="text-muted">Empty</span>;
  }

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
