"use client";

import React from "react";

import { TooltipPreset } from "@notion-kit/shadcn";

import { OptionTag } from "../common";
import type { SelectConfig } from "../lib/types";
import { CellTrigger } from "./cell-trigger";
import { useSelectPopover } from "./use-select-popover";

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
  const { ref, openSelectMenu } = useSelectPopover<HTMLDivElement>({
    propId,
    options,
    onChange,
  });

  return (
    <CellTrigger
      ref={ref}
      className="py-2"
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
