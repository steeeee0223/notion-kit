import { createContext, use, type ReactNode } from "react";

import { cn } from "@notion-kit/cn";
import type {
  CellEditorProps,
  CellValueProps,
  SelectConfig,
} from "@notion-kit/table-hook/plugins";
import { TooltipDescription, TooltipPreset } from "@notion-kit/ui/primitives";

import { OptionTag } from "@/common/option-tag";

import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";

interface SelectCellValueProps extends CellValueProps<string[], SelectConfig> {
  multi?: boolean;
}

interface SelectCellEditorProps
  extends CellEditorProps<string[], SelectConfig> {
  multi?: boolean;
}

const SelectOptionTooltipContext = createContext(false);

interface SelectOptionTooltipScopeProps {
  children: ReactNode;
  enabled: boolean;
}

export function SelectOptionTooltipScope({
  children,
  enabled,
}: SelectOptionTooltipScopeProps) {
  return (
    <SelectOptionTooltipContext value={enabled}>
      {children}
    </SelectOptionTooltipContext>
  );
}

export function SelectCellValue({
  config,
  data: options,
  wrapped,
}: SelectCellValueProps) {
  const optionTooltipsEnabled = use(SelectOptionTooltipContext);

  if (options.length === 0) return null;
  return (
    <div className="flex items-center justify-between">
      <div
        className={cn(
          "flex flex-nowrap gap-x-2 gap-y-1.5",
          wrapped && "flex-wrap",
        )}
      >
        {options.map((name) => {
          const option = config.options.items[name];
          if (!option) return;
          return (
            <TooltipPreset
              key={option.id}
              disabled={!optionTooltipsEnabled}
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
        })}
      </div>
    </div>
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
