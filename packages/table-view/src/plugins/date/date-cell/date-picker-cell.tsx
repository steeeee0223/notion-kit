import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import { toDateString, type DatePlugin } from "@notion-kit/table-hook/plugins";

import type { CellValueProps } from "@/plugins/renderers";

export function DatePickerCellValue({
  wrapped,
  data,
  config,
}: CellValueProps<
  DatePlugin["default"]["data"],
  DatePlugin["default"]["config"]
>) {
  const dateStr = toDateString(data, config);

  if (data.start === undefined) return null;
  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      {dateStr}
    </div>
  );
}
