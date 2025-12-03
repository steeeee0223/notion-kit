"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";
import type { CellProps } from "../types";
import { listCellWidth } from "../utils";

export function TextCell({
  data,
  wrapped,
  disabled,
  layout,
  onChange,
}: CellProps<string>) {
  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={() => (
        <CellTrigger
          className={cn(
            "group/text-cell",
            layout === "list" && listCellWidth("text"),
          )}
          wrapped={wrapped}
          layout={layout}
          aria-disabled={disabled}
        >
          {layout === "table" && (
            <CopyButton
              className="hidden group-hover/text-cell:flex"
              value={data}
            />
          )}
          <div className={cn("leading-normal", wrappedClassName(wrapped))}>
            <span>{data}</span>
          </div>
        </CellTrigger>
      )}
    />
  );
}
