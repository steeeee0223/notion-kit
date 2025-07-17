"use client";

import React from "react";

import { Badge, TooltipPreset } from "@notion-kit/shadcn";

import { COLOR } from "../lib/colors";
import type { OptionConfig } from "../lib/types";
import { CellTrigger } from "./cell-trigger";

interface SelectCellProps {
  type: "select" | "multi-select";
  options: OptionConfig[];
  wrapped?: boolean;
  onPointerDown?: () => void;
}

export function SelectCell({
  options,
  wrapped,
  onPointerDown,
}: SelectCellProps) {
  return (
    <CellTrigger
      className="py-2"
      wrapped={wrapped}
      onPointerDown={onPointerDown}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-nowrap gap-x-2 gap-y-1.5">
          {options.map((option) => (
            <TooltipPreset key={option.id} description={option.name} side="top">
              <Badge
                variant="tag"
                size="sm"
                className="h-5 max-w-full min-w-0 shrink-0 text-sm leading-5"
                style={{ backgroundColor: COLOR[option.color] }}
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
