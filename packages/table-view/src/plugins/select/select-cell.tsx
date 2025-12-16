"use client";

import { useState } from "react";

import { cn } from "@notion-kit/cn";
import { useRect } from "@notion-kit/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  TooltipPreset,
} from "@notion-kit/shadcn";

import { CellTrigger, OptionTag } from "../../common";
import { CellProps } from "../types";
import { SelectMenu } from "./select-menu";
import { useSelectMenu } from "./select-menu/use-select-menu";
import type { SelectConfig } from "./types";

export function SelectCell({
  propId,
  config,
  data: options,
  wrapped,
  disabled,
  layout,
  tooltip,
  onChange,
}: CellProps<string[], SelectConfig>) {
  const [open, setOpen] = useState(false);
  const { ref, rect } = useRect<HTMLDivElement>();
  const menu = useSelectMenu({ propId, options, onChange });
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      menu.commitChange();
    }
  };

  if (layout !== "table" && options.length === 0) return null;
  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
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
              {options.map((name) => {
                const option = config.options.items[name];
                if (!option) return;
                return (
                  <TooltipPreset
                    asChild={false}
                    key={option.id}
                    disabled={layout !== "table"}
                    description={
                      option.description
                        ? [
                            { type: "default", text: option.name },
                            { type: "secondary", text: option.description },
                          ]
                        : option.name
                    }
                    side="top"
                  >
                    <OptionTag {...option} />
                  </TooltipPreset>
                );
              })}
            </div>
          </div>
        </CellTrigger>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={-rect.height}
        className="z-990 max-h-[773px] min-h-[34px] w-[300px] overflow-visible backdrop-filter-none"
      >
        <SelectMenu menu={menu} />
      </PopoverContent>
    </Popover>
  );
}
