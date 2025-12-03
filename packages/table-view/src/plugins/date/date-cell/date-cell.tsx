"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton } from "../../../common";
import { wrappedClassName } from "../../../lib/utils";
import type { DateConfig, DateData } from "../types";
import { toDateString } from "../utils";

interface DateCellProps {
  data: DateData;
  config: DateConfig;
  wrapped?: boolean;
  disabled?: boolean;
}

export function DateCell({ data, config, wrapped, disabled }: DateCellProps) {
  const dateStr = toDateString(data, config);

  return (
    <CellTrigger
      className="group/date-cell"
      wrapped={wrapped}
      aria-disabled={disabled}
    >
      <CopyButton
        className="hidden group-hover/date-cell:flex"
        value={dateStr}
      />
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {dateStr}
      </div>
    </CellTrigger>
  );
}
