"use client";

import React from "react";

import { MenuProvider, TooltipPreset, useMenu } from "@notion-kit/shadcn";

import { OptionTag } from "../common";
import type { SelectConfig } from "../lib/types";
import { SelectMenu } from "../menus";
import { CellTrigger } from "./cell-trigger";
import { useTriggerPosition } from "./use-trigger-position";

interface SelectCellProps {
  propId: string;
  meta: SelectConfig;
  options: string[];
  wrapped?: boolean;
  onChange?: (options: string[]) => void;
}

export function SelectCell({
  propId,
  meta,
  options,
  wrapped,
  onChange,
}: SelectCellProps) {
  const { openMenu } = useMenu();
  const { ref, position } = useTriggerPosition<HTMLDivElement>();

  const openSelectMenu = () => {
    openMenu(
      <MenuProvider>
        <SelectMenu propId={propId} options={options} onUpdate={onChange} />
      </MenuProvider>,
      {
        x: position.left,
        y: position.top,
        className:
          "max-h-[773px] min-h-[34px] w-[300px] overflow-visible backdrop-filter-none",
      },
    );
  };

  return (
    <CellTrigger
      ref={ref}
      className="py-1.5"
      wrapped={wrapped}
      onPointerDown={openSelectMenu}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-nowrap gap-x-2 gap-y-1.5">
          {options.map((name) => {
            const option = meta.config.options.items[name];
            if (!option) return;
            return (
              <TooltipPreset
                key={option.id}
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
  );
}
