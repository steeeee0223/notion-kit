import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";

import type { CellValueProps } from "@/plugins/renderers";

export function TextCellValue({ data, wrapped }: CellValueProps<string>) {
  if (!data) return null;
  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      <span>{data}</span>
    </div>
  );
}
