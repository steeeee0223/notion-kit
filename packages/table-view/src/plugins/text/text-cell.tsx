import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import type {
  CellEditorProps,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";

import { TextInputPopoverContent } from "@/common";

export function TextCellValue({ data, wrapped }: CellValueProps<string>) {
  if (!data) return null;
  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      <span>{data}</span>
    </div>
  );
}

export function TextCellEditor({
  data,
  onChange,
  onCancel,
  scope,
}: CellEditorProps<string>) {
  return (
    <TextInputPopoverContent
      value={data}
      onUpdate={onChange}
      onCancel={onCancel}
      commitOnUnchanged={scope.kind === "bulk"}
    />
  );
}
