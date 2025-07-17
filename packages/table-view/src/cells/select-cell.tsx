"use client";

import React from "react";

import { Badge, TooltipPreset } from "@notion-kit/shadcn";

import { COLOR } from "../lib/colors";
import type { SelectConfig } from "../lib/types";
import { CellTrigger } from "./cell-trigger";
import { useSelectPopover } from "./use-select-popover";

interface SelectCellProps {
  config: SelectConfig;
  wrapped?: boolean;
  onUpdate?: (values: string[]) => void;
}

export function SelectCell({ config, wrapped, onUpdate }: SelectCellProps) {
  const { ref, openSelectMenu } = useSelectPopover<HTMLDivElement>({
    config,
    onUpdate,
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
          {Object.values(config.config.options).map((option) => (
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
              <Badge
                variant="tag"
                size="sm"
                className="h-5 max-w-full min-w-0 shrink-0 text-sm leading-5"
                style={{ backgroundColor: COLOR[option.color].rgba }}
              >
                <span className="truncate">{option.name}</span>
              </Badge>
            </TooltipPreset>
          ))}
        </div>
      </div>
    </CellTrigger>
  );
}
