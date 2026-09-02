import type { OnChangeFn } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import type { CellValueProps } from "@notion-kit/table-hook/plugins";

import { TextInputPopoverContent } from "@/common";

export function TextCellValue({ data, wrapped }: CellValueProps<string>) {
  if (!data) return null;
  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      <span>{data}</span>
    </div>
  );
}

interface TextCellEditorProps {
  data: string;
  onChange: OnChangeFn<string>;
  onCancel?: () => void;
  commitOnUnchanged?: boolean;
}

export function TextCellEditor({
  data,
  onChange,
  onCancel,
  commitOnUnchanged,
}: TextCellEditorProps) {
  return (
    <TextInputPopoverContent
      value={data}
      onUpdate={onChange}
      onCancel={onCancel}
      commitOnUnchanged={commitOnUnchanged}
    />
  );
}
