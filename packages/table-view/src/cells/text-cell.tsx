"use client";

import React from "react";

import "../view.css";

import { useCopyToClipboard } from "usehooks-ts";

import { cn } from "@notion-kit/cn";
import { Icon } from "@notion-kit/icons";
import { TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger } from "./cell-trigger";
import { TextInputPopover } from "./text-input-popover";
import { useTriggerPosition } from "./use-trigger-position";

interface TextCellProps {
  value: string;
  wrap?: boolean;
  onChange?: (value: string) => void;
}

export const TextCell: React.FC<TextCellProps> = ({
  value,
  wrap,
  onChange,
}) => {
  const { ref, position } = useTriggerPosition();
  const [, copy] = useCopyToClipboard();

  return (
    <TextInputPopover value={value} position={position} onChange={onChange}>
      <CellTrigger ref={ref} className="group/text-cell" wrapped={wrap}>
        <div className="pointer-events-none absolute top-1 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/text-cell:flex">
          <div
            id="quick-action-container"
            className="pointer-events-auto sticky right-1 flex bg-main dark:bg-popover"
          >
            <TooltipPreset
              description="Copy to Clipboard"
              side="top"
              className="z-[9990]"
            >
              <div
                role="button"
                tabIndex={0}
                aria-label="Copy to Clipboard"
                className="cell-open dark:bg-poopover inline-flex h-6 animate-bg-in cursor-pointer items-center justify-center rounded-md bg-main fill-secondary px-1.5 text-xs/[1.2] font-medium tracking-[0.5px] whitespace-nowrap text-secondary uppercase select-none hover:bg-default/5"
                onClick={(e) => {
                  e.stopPropagation();
                  void copy(value);
                }}
                onKeyDown={(e) => e.stopPropagation()}
              >
                <Icon.Copy className="block size-3.5 shrink-0 fill-secondary text-secondary" />
              </div>
            </TooltipPreset>
          </div>
        </div>
        <div
          className={cn(
            "leading-[1.5] whitespace-pre-wrap",
            wrap
              ? "break-words whitespace-pre-wrap"
              : "break-normal whitespace-nowrap",
          )}
        >
          <span>{value}</span>
        </div>
      </CellTrigger>
    </TextInputPopover>
  );
};
