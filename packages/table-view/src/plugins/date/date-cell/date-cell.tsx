import { cn } from "@notion-kit/cn";
import type { LayoutType } from "@notion-kit/table-hook";
import { wrappedClassName } from "@notion-kit/table-hook";
import {
  toDateString,
  type DateConfig,
  type DateData,
} from "@notion-kit/table-hook/plugins";

import { CellTrigger, CopyButton } from "@/common";

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
  onClick?: () => void;
}

export function DateCell({
  data,
  config,
  wrapped,
  disabled,
  layout,
  tooltip,
  onClick,
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
      onClick={onClick}
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
