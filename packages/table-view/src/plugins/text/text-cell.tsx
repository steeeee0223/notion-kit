"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";
import type { CellProps } from "../types";

export function TextCell({ data, wrapped, onChange }: CellProps<string>) {
  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={() => (
        <CellTrigger className="group/text-cell" wrapped={wrapped}>
          <CopyButton
            className="hidden group-hover/text-cell:flex"
            value={data}
          />
          <div className={cn("leading-normal", wrappedClassName(wrapped))}>
            <span>{data}</span>
          </div>
        </CellTrigger>
      )}
    />
  );
}
