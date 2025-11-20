"use client";

import { cn } from "@notion-kit/cn";
import { IconBlock, type IconData } from "@notion-kit/icon-block";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";

interface TitleCellProps {
  icon?: IconData;
  value: string;
  wrapped?: boolean;
  onUpdate: (value: string) => void;
}

export function TitleCell({ icon, value, wrapped, onUpdate }: TitleCellProps) {
  return (
    <TextInputPopover
      value={value}
      onUpdate={onUpdate}
      renderTrigger={({ width }) => (
        <CellTrigger wrapped={wrapped}>
          <div className="pointer-events-none absolute top-1.5 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/row:flex">
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
          <div className="contents h-5 items-center">
            {icon && <IconBlock icon={icon} className="contents" />}
            <span
              className={cn(
                "mr-[5px] ml-1 inline leading-normal font-medium underline decoration-muted underline-offset-2",
                wrappedClassName(wrapped),
              )}
            >
              {value}
            </span>
          </div>
        </CellTrigger>
      )}
    />
  );
}
