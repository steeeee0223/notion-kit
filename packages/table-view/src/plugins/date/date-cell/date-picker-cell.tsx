import { cn } from "@notion-kit/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@notion-kit/shadcn";

import { CellTrigger, CopyButton } from "../../../common";
import { wrappedClassName } from "../../../lib/utils";
import type { InferCellProps } from "../../types";
import { listCellWidth } from "../../utils";
import type { DatePlugin } from "../types";
import { toDateString } from "../utils";
import { DateTimePicker } from "./date-time-picker";

export function DatePickerCell({
  wrapped,
  data,
  config,
  disabled,
  layout,
  ...props
}: InferCellProps<DatePlugin>) {
  const dateStr = toDateString(data, config);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <CellTrigger
          className={cn(
            "group/date-cell",
            layout === "list" && listCellWidth("date"),
          )}
          wrapped={wrapped}
          layout={layout}
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
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={0}
        className="z-990 w-62"
      >
        <DateTimePicker data={data} config={config} {...props} />
      </PopoverContent>
    </Popover>
  );
}
