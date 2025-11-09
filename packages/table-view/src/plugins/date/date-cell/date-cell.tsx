"use client";

import { cn } from "@notion-kit/cn";
import { useCopyToClipboard } from "@notion-kit/hooks";
import { Icon } from "@notion-kit/icons";
import { Button, TooltipPreset } from "@notion-kit/shadcn";

import { CellTrigger } from "../../../common";
import { wrappedClassName } from "../../../lib/utils";
import type { DateConfig, DateData } from "../types";
import { toDateString } from "../utils";

interface DateCellProps {
  data: DateData;
  config: DateConfig;
  wrapped?: boolean;
}

export function DateCell({ data, config, wrapped }: DateCellProps) {
  const [, copy] = useCopyToClipboard();
  const dateStr = toDateString(data, config);

  return (
    <CellTrigger className="group/email-cell" wrapped={wrapped}>
      <div className="pointer-events-none absolute top-1.5 right-0 left-0 z-20 mx-1 my-0 hidden justify-end group-hover/email-cell:flex">
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
                void copy(dateStr);
              }}
            >
              <Icon.Copy className="size-3.5" />
            </Button>
          </TooltipPreset>
        </div>
      </div>
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {dateStr}
      </div>
    </CellTrigger>
  );
}
