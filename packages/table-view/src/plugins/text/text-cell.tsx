import { cn } from "@notion-kit/cn";
import { wrappedClassName, type CellProps } from "@notion-kit/table-hook";

import { CellTrigger, CopyButton, TextInputPopover } from "@/common";

export function TextCell({
  data,
  wrapped,
  disabled,
  layout,
  tooltip,
  onChange,
}: CellProps<string>) {
  if (layout !== "table" && layout !== "row-view" && !data) return null;
  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={() => (
        <CellTrigger
          className="group/text-cell"
          wrapped={wrapped}
          layout={layout}
          widthType="text"
          aria-disabled={disabled}
          tooltip={tooltip}
        >
          {(layout === "table" || layout === "row-view") && (
            <CopyButton
              className="hidden group-hover/text-cell:flex"
              value={data}
            />
          )}
          <div className={cn("leading-normal", wrappedClassName(wrapped))}>
            {data ? (
              <span>{data}</span>
            ) : layout === "row-view" ? (
              <span className="text-muted">Empty</span>
            ) : null}
          </div>
        </CellTrigger>
      )}
    />
  );
}
