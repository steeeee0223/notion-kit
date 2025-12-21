"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton } from "../../../common";
import type { LayoutType } from "../../../features";
import { wrappedClassName } from "../../../lib/utils";
import type { DateConfig, DateData } from "../types";
import { toDateString } from "../utils";

interface DateCellProps {
  data: DateData;
  config: DateConfig;
  wrapped?: boolean;
  disabled?: boolean;
  layout?: LayoutType | "row-view";
  tooltip?: {
    title: string;
    description?: string;
  };
}

export function DateCell({
  data,
  config,
  wrapped,
  disabled,
  layout,
  tooltip,
}: DateCellProps) {
  const dateStr = toDateString(data, config);

  return (
    <CellTrigger
      className="group/date-cell"
      layout={layout}
      widthType="date"
      wrapped={wrapped}
      aria-disabled={disabled}
      tooltip={tooltip}
    >
      {layout === "table" && (
        <CopyButton
          className="hidden group-hover/date-cell:flex"
          value={dateStr}
        />
      )}
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {dateStr}
      </div>
    </CellTrigger>
  );
}
