"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton } from "../../../common";
import type { LayoutType } from "../../../features";
import { wrappedClassName } from "../../../lib/utils";
import { listCellWidth } from "../../utils";
import type { DateConfig, DateData } from "../types";
import { toDateString } from "../utils";

interface DateCellProps {
  data: DateData;
  config: DateConfig;
  wrapped?: boolean;
  disabled?: boolean;
  layout?: LayoutType;
}

export function DateCell({
  data,
  config,
  wrapped,
  disabled,
  layout,
}: DateCellProps) {
  const dateStr = toDateString(data, config);

  return (
    <CellTrigger
      className={cn(
        "group/date-cell",
        layout === "list" && listCellWidth("date"),
      )}
      layout={layout}
      wrapped={wrapped}
      aria-disabled={disabled}
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
