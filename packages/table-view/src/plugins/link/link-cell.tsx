"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";

interface LinkCellProps {
  type: "email" | "phone" | "url";
  value: string;
  wrapped?: boolean;
  onUpdate: (value: string) => void;
}

export function LinkCell({ type, value, wrapped, onUpdate }: LinkCellProps) {
  return (
    <TextInputPopover
      value={value}
      onUpdate={onUpdate}
      renderTrigger={() => (
        <CellTrigger className="group/link-cell" wrapped={wrapped}>
          <CopyButton
            className="hidden group-hover/link-cell:flex"
            value={value}
          />
          <div className={cn("leading-normal", wrappedClassName(wrapped))}>
            <a
              href={getHref(type, value)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline animate-bg-in cursor-pointer text-inherit underline decoration-muted underline-offset-2 select-none"
            >
              {value}
            </a>
          </div>
        </CellTrigger>
      )}
    />
  );
}

function getHref(type: LinkCellProps["type"], value: string) {
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
