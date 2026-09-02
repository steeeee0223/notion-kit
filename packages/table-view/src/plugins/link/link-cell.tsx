import type { OnChangeFn } from "@tanstack/react-table";

import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import type { CellValueProps } from "@notion-kit/table-hook/plugins";

import { TextInputPopoverContent } from "@/common";

interface LinkCellValueProps extends CellValueProps<string> {
  type: "email" | "phone" | "url";
}

export function LinkCellValue({ type, data, wrapped }: LinkCellValueProps) {
  if (!data) return null;
  return (
    <div className={cn("leading-normal", wrappedClassName(wrapped))}>
      <a
        href={getHref(type, data)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline animate-bg-in cursor-pointer text-inherit underline decoration-muted underline-offset-2 select-none"
      >
        {data}
      </a>
    </div>
  );
}

interface LinkCellEditorProps {
  data: string;
  onChange: OnChangeFn<string>;
  onCancel?: () => void;
  commitOnUnchanged?: boolean;
}

export function LinkCellEditor({
  data,
  onChange,
  onCancel,
  commitOnUnchanged,
}: LinkCellEditorProps) {
  return (
    <TextInputPopoverContent
      value={data}
      onUpdate={onChange}
      onCancel={onCancel}
      commitOnUnchanged={commitOnUnchanged}
    />
  );
}

function getHref(type: LinkCellValueProps["type"], value: string) {
  switch (type) {
    case "email":
      return `mailto:${value}`;
    case "phone":
      return `tel:${value}`;
    default:
      //* for url, prevent javascript injection
      if (value.trimStart().toLowerCase().startsWith("javascript:")) return "";
      return value;
  }
}
