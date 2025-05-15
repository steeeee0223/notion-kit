"use client";

import React from "react";

import "../view.css";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger } from "./cell-trigger";
import { TextInputPopover } from "./text-input-popover";
import { useTriggerPosition } from "./use-trigger-position";

interface TitleCellProps {
  value: string;
  wrapped?: boolean;
  onChange?: (value: string) => void;
}

export const TitleCell: React.FC<TitleCellProps> = ({
  value,
  wrapped,
  onChange,
}) => {
  const { ref, position, width } = useTriggerPosition();
  return (
    <TextInputPopover value={value} position={position} onChange={onChange}>
      <CellTrigger ref={ref} wrapped={wrapped}>
        <div className="pointer-events-none absolute top-1 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/row:flex">
          <div
            id="quick-action-container"
            className="pointer-events-auto sticky right-1 flex bg-main dark:bg-popover"
          >
            <TooltipPreset
              description="Open in side peek"
              side="top"
              className="z-[9990]"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label="Open in side peek"
                className="cell-open inline-flex h-6 animate-bg-in cursor-pointer items-center justify-center rounded-md bg-main fill-secondary px-1.5 text-xs/[1.2] font-medium tracking-[0.5px] whitespace-nowrap text-secondary uppercase select-none hover:bg-default/5"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Icon.PeekModeSide
                  className={cn(
                    "block size-[14px] shrink-0 fill-secondary text-secondary",
                    width > 110 && "mr-1.5",
                  )}
                />
                {width > 110 && <>Open</>}
              </div>
            </TooltipPreset>
          </div>
        </div>
        <span
          className={cn(
            "title-cell-bg-img mr-[5px] inline leading-[1.5] font-medium",
            wrapped
              ? "break-words whitespace-pre-wrap"
              : "break-normal whitespace-nowrap",
          )}
        >
          {value}
        </span>
      </CellTrigger>
    </TextInputPopover>
  );
};
