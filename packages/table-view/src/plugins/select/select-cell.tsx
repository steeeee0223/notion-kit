import { cn } from "@notion-kit/cn";
import type {
  CellEditorProps,
  CellValueProps,
  SelectConfig,
} from "@notion-kit/table-hook/plugins";
import { TooltipDescription, TooltipPreset } from "@notion-kit/ui/primitives";

import { CellTrigger, OptionTag } from "@/common";

import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";

interface SelectCellValueProps extends CellValueProps<string[], SelectConfig> {
  multi?: boolean;
}

interface SelectCellEditorProps
  extends CellEditorProps<string[], SelectConfig> {
  multi?: boolean;
}

export function SelectCellValue({
  config,
  data: options,
  wrapped,
  disabled,
  layout,
  tooltip,
  onClick,
}: SelectCellValueProps) {
  if (layout !== "table" && layout !== "row-view" && options.length === 0)
    return null;
  return (
    <CellTrigger
      wrapped={wrapped}
      aria-disabled={disabled}
      layout={layout}
      tooltip={tooltip}
      widthType="select"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "flex flex-nowrap gap-x-2 gap-y-1.5",
            wrapped && "flex-wrap",
          )}
        >
          {options.length > 0 ? (
            options.map((name) => {
              const option = config.options.items[name];
              if (!option) return;
              return (
                <TooltipPreset
                  key={option.id}
                  disabled={layout !== "table"}
                  description={
                    option.description ? (
                      <>
                        <TooltipDescription text={option.name} />
                        <TooltipDescription
                          type="secondary"
                          text={option.description}
                        />
                      </>
                    ) : (
                      option.name
                    )
                  }
                  side="top"
                >
                  <OptionTag name={option.name} color={option.color} />
                </TooltipPreset>
              );
            })
          ) : layout === "row-view" ? (
            <span className="text-muted">Empty</span>
          ) : null}
        </div>
      </div>
    </CellTrigger>
  );
}

export function SelectCellEditor({
  multi,
  propId,
  config,
  data: options,
  onChange,
  onConfigChange,
}: SelectCellEditorProps) {
  const selectedOptions = Array.isArray(options) ? options : [];
  const menu = useSelectMenu({
    multi,
    propId,
    config,
    options: selectedOptions,
    onChange,
    onConfigChange,
  });

  return <SelectMenu menu={menu} />;
}
