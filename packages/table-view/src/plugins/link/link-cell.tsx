import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import type {
  CellEditorProps,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";

import { CellTrigger, CopyButton, TextInputPopoverContent } from "@/common";

interface LinkCellValueProps extends CellValueProps<string> {
  type: "email" | "phone" | "url";
}

export function LinkCellValue({
  type,
  data,
  wrapped,
  disabled,
  layout,
  tooltip,
  onClick,
}: LinkCellValueProps) {
  if (layout !== "table" && layout !== "row-view" && !data) return null;
  return (
    <CellTrigger
      className="group/link-cell"
      wrapped={wrapped}
      aria-disabled={disabled}
      layout={layout}
      widthType="link"
      tooltip={tooltip}
      onClick={onClick}
    >
      {(layout === "table" || layout === "row-view") && (
        <CopyButton className="hidden group-hover/link-cell:flex" value={data} />
      )}
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {data ? (
          <a
            href={getHref(type, data)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline animate-bg-in cursor-pointer text-inherit underline decoration-muted underline-offset-2 select-none"
          >
            {data}
          </a>
        ) : layout === "row-view" ? (
          <span className="text-muted">Empty</span>
        ) : null}
      </div>
    </CellTrigger>
  );
}

export function LinkCellEditor({
  data,
  onChange,
  onCancel,
}: CellEditorProps<string>) {
  return <TextInputPopoverContent value={data} onUpdate={onChange} onCancel={onCancel} />;
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
