import { cn } from "@notion-kit/cn";
import { Checkbox } from "@notion-kit/shadcn/src/checkbox";

import type { GroupingValueProps } from "../types";

export function CheckboxGroupingValue({
  className,
  value,
  table,
}: GroupingValueProps) {
  const checked = Boolean(value);
  const column = table.getGroupedColumnInfo();

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 truncate font-medium",
        className,
      )}
    >
      <Checkbox
        className="rounded-[3px] disabled:cursor-default disabled:opacity-100"
        defaultChecked={checked}
        disabled
      />
      <span>{column?.name}</span>
    </div>
  );
}
