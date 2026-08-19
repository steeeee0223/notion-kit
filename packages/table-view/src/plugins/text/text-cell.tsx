import { cn } from "@notion-kit/cn";
import { wrappedClassName } from "@notion-kit/table-hook";
import type {
  CellEditorProps,
  CellValueProps,
} from "@notion-kit/table-hook/plugins";

import { CellTrigger, CopyButton, TextInputPopoverContent } from "@/common";

export function TextCellValue({
  data,
  wrapped,
  disabled,
  layout,
  tooltip,
}: CellValueProps<string>) {
  if (layout !== "table" && layout !== "row-view" && !data) return null;
  return (
    <CellTrigger
      className="group/text-cell"
      wrapped={wrapped}
      layout={layout}
      widthType="text"
      aria-disabled={disabled}
      tooltip={tooltip}
    >
      {(layout === "table" || layout === "row-view") && (
        <CopyButton className="hidden group-hover/text-cell:flex" value={data} />
      )}
      <div className={cn("leading-normal", wrappedClassName(wrapped))}>
        {data ? (
          <span>{data}</span>
        ) : layout === "row-view" ? (
          <span className="text-muted">Empty</span>
        ) : null}
      </div>
    </CellTrigger>
  );
}

export function TextCellEditor({ data, onChange }: CellEditorProps<string>) {
  return <TextInputPopoverContent value={data} onUpdate={onChange} />;
}
