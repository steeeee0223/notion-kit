import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import {
  toDateString,
  type DateConfig,
  type DateData,
} from "@notion-kit/table-hook/plugins";

import type { CellValueProps } from "@/plugins/renderers";

export function DateCell({
  data,
  config,
  wrapped,
}: CellValueProps<DateData, DateConfig>) {
  const dateStr = toDateString(data, config);

  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      {dateStr}
    </div>
  );
}
