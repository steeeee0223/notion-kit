import type { ReactNode } from "react";
import type { OnChangeFn } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import type { SelectConfig } from "@notion-kit/table-hook/plugins";
import { TooltipDescription, TooltipPreset } from "@notion-kit/ui/primitives";

import { CellRenderer } from "@/common";
import { OptionTag } from "@/common/option-tag";
import type { CellRendererProps, CellValueProps } from "@/plugins/renderers";
import { getCellTriggerClass, getCompactWidthClass } from "@/plugins/utils";

import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";

export function SelectCell({
  cell,
  isEmpty,
  value,
  renderEditor,
}: {
  cell: Pick<
    CellRendererProps<unknown, unknown>,
    "disabled" | "surface" | "wrapped"
  >;
  isEmpty: boolean;
  value: ReactNode;
  renderEditor?: (close: () => void) => ReactNode;
}) {
  const { disabled, surface, wrapped } = cell;
  return (
    <CellRenderer
      compactClassName={getCompactWidthClass("select")}
      disabled={disabled}
      emptyContent={
        surface === "row-view" && isEmpty ? (
          <SelectCellValues wrapped={wrapped} className="text-muted">
            Empty
          </SelectCellValues>
        ) : undefined
      }
      hideWhenEmpty={surface === "list" || surface === "board"}
      isEmpty={isEmpty}
      popover={{
        align: "start",
        side: "bottom",
        sideOffset: (rect) => -rect.height,
        className:
          "max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none",
      }}
      renderEditor={renderEditor}
      surface={surface}
      triggerClassName={getCellTriggerClass({
        kind: "select",
        surface,
        wrapped,
      })}
      value={value}
    />
  );
}

export function SelectCellValues({
  children,
  wrapped,
  className,
}: {
  children: ReactNode;
  wrapped?: boolean;
  className?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div
        className={cn(
          "flex min-w-0 flex-nowrap gap-x-2 gap-y-1.5",
          wrapped && "flex-wrap",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface SelectCellValueProps extends Pick<
  CellValueProps<string[], SelectConfig>,
  "data" | "config" | "wrapped"
> {
  multi?: boolean;
}

interface SelectCellEditorProps {
  multi?: boolean;
  propId: string;
  config: SelectConfig;
  data: string[];
  onChange: OnChangeFn<string[]>;
  onConfigChange?: OnChangeFn<SelectConfig>;
  onClose?: () => void;
  onSelect?: () => void;
}

export function SelectCellValue({
  config,
  data: options,
  wrapped,
}: SelectCellValueProps) {
  if (options.length === 0) return null;
  return (
    <SelectCellValues wrapped={wrapped}>
      {options.map((name) => {
        const option = config.options.items[name];
        if (!option) return;
        return (
          <TooltipPreset
            key={option.id}
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
    </SelectCellValues>
  );
}

export function SelectCellEditor({
  multi,
  propId,
  config,
  data: options,
  onChange,
  onConfigChange,
  onClose,
  onSelect,
}: SelectCellEditorProps) {
  const selectedOptions = Array.isArray(options) ? options : [];
  const menu = useSelectMenu({
    multi,
    propId,
    config,
    options: selectedOptions,
    onChange,
    onConfigChange,
    onSelect,
  });

  return <SelectMenu menu={menu} onClose={onClose} />;
}
