import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import { CellProps } from "@notion-kit/table-hook";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipDescription,
  TooltipPreset,
} from "@notion-kit/ui/primitives";

import { CellTrigger, OptionTag } from "@/common";

import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";
import type { SelectConfig } from "./types";

interface SelectCellProps extends CellProps<string[], SelectConfig> {
  multi?: boolean;
}

export function SelectCell({
  multi,
  propId,
  config,
  data: options,
  wrapped,
  disabled,
  layout,
  tooltip,
  onChange,
  onConfigChange,
}: SelectCellProps) {
  const [open, setOpen] = useState(false);
  const { ref, rect } = useRect<HTMLDivElement>();
  const menu = useSelectMenu({
    multi,
    propId,
    config,
    options,
    onChange,
    onConfigChange,
  });
  const selectMenu = {
    ...menu,
    selectTag: (value: string) => {
      menu.selectTag(value);
      if (!multi) setOpen(false);
    },
  };
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
  };

  if (layout !== "table" && layout !== "row-view" && options.length === 0)
    return null;
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        nativeButton={false}
        render={
          <CellTrigger
            ref={ref}
            wrapped={wrapped}
            aria-disabled={disabled}
            layout={layout}
            tooltip={tooltip}
            widthType="select"
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
                        <OptionTag {...option} />
                      </TooltipPreset>
                    );
                  })
                ) : layout === "row-view" ? (
                  <span className="text-muted">Empty</span>
                ) : null}
              </div>
            </div>
          </CellTrigger>
        }
      />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={-rect.height}
        className="max-h-[773px] min-h-[34px] w-75 overflow-visible backdrop-filter-none"
        onKeyDownCapture={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      >
        <SelectMenu menu={selectMenu} />
      </PopoverContent>
    </Popover>
  );
}
