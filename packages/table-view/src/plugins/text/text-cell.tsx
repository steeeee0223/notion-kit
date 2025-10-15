"use client";

import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger, TextInputPopover } from "../../common";

interface TextCellProps {
  value: string;
  wrapped?: boolean;
  onUpdate?: (value: string) => void;
}

export function TextCell({ value, wrapped, onUpdate }: TextCellProps) {
  const [, copy] = useCopyToClipboard();

  return (
    <TextInputPopover
      value={value}
      onUpdate={onUpdate}
      renderTrigger={() => (
        <CellTrigger className="group/text-cell" wrapped={wrapped}>
          <div className="pointer-events-none absolute top-1 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/text-cell:flex">
            <div
              id="quick-action-container"
              className="pointer-events-auto sticky right-1 flex bg-transparent"
            >
              <TooltipPreset
                description="Copy to Clipboard"
                side="top"
                className="z-9990"
              >
                <Button
                  tabIndex={0}
                  aria-label="Copy to Clipboard"
                  size="xs"
                  className="rounded-md bg-main fill-secondary leading-[1.2] font-medium tracking-[0.5px] text-secondary uppercase shadow-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    void copy(value);
                  }}
                >
                  <Icon.Copy className="size-3.5" />
                </Button>
              </TooltipPreset>
            </div>
          </div>
          <div
            className={cn(
              "leading-[1.5] whitespace-pre-wrap",
              wrapped
                ? "break-words whitespace-pre-wrap"
                : "break-normal whitespace-nowrap",
            )}
          >
            <span>{value}</span>
          </div>
        </CellTrigger>
      )}
    />
  );
}
