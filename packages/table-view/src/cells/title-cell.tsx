"use client";

import React from "react";

import { cn } from "@notion-kit/cn";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger } from "./cell-trigger";
import { useTextInputPopover } from "./use-text-input-popover";

import "../view.css";

interface TitleCellProps {
  icon?: IconData;
  value: string;
  wrapped?: boolean;
  onUpdate?: (value: string) => void;
}

export const TitleCell: React.FC<TitleCellProps> = ({
  icon,
  value,
  wrapped,
  onUpdate,
}) => {
  const { ref, width, openTextInput } = useTextInputPopover<HTMLDivElement>({
    value,
    onUpdate,
  });

  return (
    <CellTrigger ref={ref} wrapped={wrapped} onClick={openTextInput}>
      <div className="pointer-events-none absolute top-1 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/row:flex">
        <div
          id="quick-action-container"
          className="pointer-events-auto sticky right-1 flex bg-transparent"
        >
          <TooltipPreset
            description="Open in side peek"
            side="top"
            className="z-9990"
          >
            <Button
              tabIndex={0}
              aria-label="Open in side peek"
              size="xs"
              className="rounded-md bg-main fill-secondary leading-[1.2] font-medium tracking-[0.5px] text-secondary uppercase shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Icon.PeekModeSide
                className={cn("size-3.5", width > 110 && "mr-1.5")}
              />
              {width > 110 && <>Open</>}
            </Button>
          </TooltipPreset>
        </div>
      </div>
      <div className="flex h-5 items-center">
        {icon && <IconBlock icon={icon} />}
        <span
          className={cn(
            "title-cell-bg-img mr-[5px] inline leading-[1.5] font-medium underline",
            wrapped
              ? "break-words whitespace-pre-wrap"
              : "break-normal whitespace-nowrap",
          )}
        >
          {value}
        </span>
      </div>
    </CellTrigger>
  );
};
