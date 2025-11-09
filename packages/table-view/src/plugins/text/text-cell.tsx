"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";

interface TextCellProps {
  value: string;
  wrapped?: boolean;
  onUpdate: (value: string) => void;
}

export function TextCell({ value, wrapped, onUpdate }: TextCellProps) {
  return (
    <TextInputPopover
      value={value}
      onUpdate={onUpdate}
      renderTrigger={() => (
        <CellTrigger className="group/text-cell" wrapped={wrapped}>
          <CopyButton
            className="hidden group-hover/text-cell:flex"
            value={value}
          />
          <div className={cn("leading-normal", wrappedClassName(wrapped))}>
            <span>{value}</span>
          </div>
        </CellTrigger>
      )}
    />
  );
}
