import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import {
  toDateString,
  type CellValueProps,
  type DatePlugin,
} from "@notion-kit/table-hook/plugins";

import { CellTrigger, CopyButton } from "@/common";

export function DatePickerCellValue({
  wrapped,
  data,
  config,
  disabled,
  layout,
  tooltip,
  onClick,
}: CellValueProps<
  DatePlugin["default"]["data"],
  DatePlugin["default"]["config"]
>) {
  const dateStr = toDateString(data, config);

  if (layout !== "table" && layout !== "row-view" && data.start === undefined)
    return null;
  return (
    <CellTrigger
      className="group/date-cell"
      wrapped={wrapped}
      layout={layout}
      widthType="date"
      aria-disabled={disabled}
      tooltip={tooltip}
      onClick={onClick}
    >
      {(layout === "table" || layout === "row-view") && (
        <CopyButton
          className="hidden group-hover/date-cell:flex"
          value={dateStr}
        />
      )}
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {dateStr ||
          (layout === "row-view" ? (
            <span className="text-muted">Empty</span>
          ) : null)}
      </div>
    </CellTrigger>
  );
}
