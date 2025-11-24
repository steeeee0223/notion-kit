"use client";

import { cn } from "@notion-kit/cn";

import { CellTrigger, CopyButton, TextInputPopover } from "../../common";
import { wrappedClassName } from "../../lib/utils";
import type { CellProps } from "../types";

interface LinkCellProps extends CellProps<string> {
  type: "email" | "phone" | "url";
}

export function LinkCell({
  type,
  data,
  wrapped,
  disabled,
  onChange,
}: LinkCellProps) {
  return (
    <TextInputPopover
      value={data}
      onUpdate={onChange}
      renderTrigger={() => (
        <CellTrigger
          className="group/link-cell"
          wrapped={wrapped}
          aria-disabled={disabled}
        >
          <CopyButton
            className="hidden group-hover/link-cell:flex"
            value={data}
          />
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
