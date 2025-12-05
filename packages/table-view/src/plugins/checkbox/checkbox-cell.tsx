"use client";

import { cn } from "@notion-kit/cn";
import { Checkbox } from "@notion-kit/shadcn";

import { CellTrigger } from "../../common";
import type { CellProps } from "../types";

export function CheckboxCell({
  data,
  wrapped,
  disabled,
  layout,
  onChange,
}: CellProps<boolean>) {
  return (
    <CellTrigger
      className={cn(layout === "table" && "py-2.5")}
      wrapped={wrapped}
      layout={layout}
      aria-disabled={disabled}
      onPointerDown={() => onChange((v) => !v)}
    >
      <div className="h-4 max-w-full">
        <Checkbox className="rounded-[3px]" checked={data} />
      </div>
    </CellTrigger>
  );
}
